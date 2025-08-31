import { Server } from 'socket.io';
import Chat from '../models/ChatModel.js';
import Message from '../models/MessageModel.js';
import User from '../models/UserModel.js';
import connectDB from './mongodb.js';

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      await connectDB();
      
      const userId = socket.handshake.auth.userId;
      if (!userId) {
        return next(new Error('Authentication error'));
      }

      const user = await User.findById(userId);
      if (!user) {
        return next(new Error('User not found'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 SOCKET SERVER: User ${socket.user.name} (ID: ${socket.userId}) connected`);

    // Join user to their personal room for notifications
    socket.join(`user_${socket.userId}`);
    console.log(`👤 User ${socket.user.name} joined personal room: user_${socket.userId}`);

    // Update user online status
    updateUserOnlineStatus(socket.userId, true);

    // Handle joining chat rooms
    socket.on('join_chat', async (data) => {
      const chatId = data.chatId || data;
      console.log(`🚪 JOIN_CHAT: User ${socket.user.name} trying to join chat ${chatId}`);
      try {
        const chat = await Chat.findById(chatId);
        if (chat && chat.isParticipant(socket.userId)) {
          await socket.join(`chat_${chatId}`);
          console.log(`✅ JOIN_CHAT SUCCESS: User ${socket.user.name} joined room chat_${chatId}`);
          
          // Get room info for debugging
          const room = io.sockets.adapter.rooms.get(`chat_${chatId}`);
          const roomSize = room ? room.size : 0;
          console.log(`🏠 ROOM chat_${chatId} now has ${roomSize} connected sockets`);
          
          socket.emit('joined_chat', { chatId });
          console.log(`📡 JOINED_CHAT event sent to user ${socket.user.name}`);
        } else {
          socket.emit('error', { message: 'Unauthorized to join chat' });
        }
      } catch (error) {
        console.error('Error joining chat:', error);
        socket.emit('error', { message: 'Failed to join chat' });
      }
    });

    // Handle leaving chat rooms
    socket.on('leave_chat', (data) => {
      const chatId = data.chatId || data;
      console.log(`🚪 LEAVE_CHAT: User ${socket.user.name} leaving chat ${chatId}`);
      socket.leave(`chat_${chatId}`);
      socket.emit('left_chat', { chatId });
      console.log(`✅ User ${socket.user.name} left room chat_${chatId}`);
    });

    // Handle sending messages via socket (real-time first)
    socket.on('send_message', async (data) => {
      console.log(`📤 SEND_MESSAGE: User ${socket.user.name} sending to chat ${data.chatId}`, {
        content: data.content,
        type: data.type,
        userId: socket.userId
      });
      
      try {
        const { chatId, content, type = 'text' } = data;

        // Verify user can send to this chat
        const chat = await Chat.findById(chatId);
        if (!chat || !chat.isParticipant(socket.userId)) {
          console.log(`❌ SEND_MESSAGE UNAUTHORIZED: User ${socket.user.name} not participant in chat ${chatId}`);
          socket.emit('error', { message: 'Unauthorized to send message' });
          return;
        }

        console.log(`✅ SEND_MESSAGE AUTHORIZED: User ${socket.user.name} can send to chat ${chatId}`);

        // Create and save message to database
        const message = new Message({
          chat: chatId,
          sender: socket.userId,
          content: content.trim(),
          type
        });

        await message.save();
        console.log(`💾 MESSAGE SAVED to database: ${message._id}`);
        
        await message.populate('sender', 'name email avatar role');
        console.log(`👤 MESSAGE POPULATED with sender data:`, {
          senderId: message.sender._id,
          senderName: message.sender.name
        });

        // Get all sockets in the chat room
        const socketsInRoom = await io.in(`chat_${chatId}`).fetchSockets();
        console.log(`🏠 ROOM chat_${chatId} has ${socketsInRoom.length} connected sockets:`, 
          socketsInRoom.map(s => s.user?.name || 'Unknown'));

        // Broadcast to all chat participants immediately
        io.to(`chat_${chatId}`).emit('new_message', message);
        console.log(`📡 BROADCASTED new_message to room chat_${chatId}:`, {
          messageId: message._id,
          content: message.content,
          sender: message.sender.name
        });

      } catch (error) {
        console.error(`💥 SEND_MESSAGE ERROR for user ${socket.user.name}:`, error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing_start', (chatId) => {
      socket.to(`chat_${chatId}`).emit('user_typing', {
        userId: socket.userId,
        userName: socket.user.name,
        chatId
      });
    });

    socket.on('typing_stop', (chatId) => {
      socket.to(`chat_${chatId}`).emit('user_stop_typing', {
        userId: socket.userId,
        userName: socket.user.name,
        chatId
      });
    });


    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`🔌 DISCONNECT: User ${socket.user.name} (ID: ${socket.userId}) disconnected`);
      updateUserOnlineStatus(socket.userId, false);
    });
  });

  return io;
};

// Helper function to update user online status
const updateUserOnlineStatus = async (userId, isOnline) => {
  try {
    await User.findByIdAndUpdate(userId, {
      isOnline,
      lastSeen: new Date()
    });

    // Broadcast status to all connected sockets
    io.emit('user_status_change', {
      userId,
      isOnline,
      lastSeen: new Date()
    });
  } catch (error) {
    console.error('Error updating user status:', error);
  }
};

// Helper function to send notifications to offline users
const sendNotificationsToOfflineUsers = async (chat, message, senderId) => {
  try {
    const offlineParticipants = await User.find({
      _id: { 
        $in: chat.participants
          .filter(p => p.user.toString() !== senderId && p.isActive)
          .map(p => p.user)
      },
      isOnline: false
    });

    // Here you can integrate with push notification services
    // For now, we'll just emit to their user rooms in case they come online
    offlineParticipants.forEach(user => {
      io.to(`user_${user._id}`).emit('new_message_notification', {
        chatId: chat._id,
        message: {
          content: message.content,
          sender: message.sender.name,
          chatName: chat.type === 'private' ? 'Private Chat' : chat.name
        }
      });
    });
  } catch (error) {
    console.error('Error sending notifications:', error);
  }
};

export const getIO = () => {
  if (!io) {
    console.warn('Socket.IO not initialized, skipping real-time emission');
    return null;
  }
  return io;
};
