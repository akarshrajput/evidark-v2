import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import Chat from '../models/Chat.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import connectDB from '../config/database.js';

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      await connectDB();
      
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (err) {
      console.error('Socket authentication error:', err);
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
        const { chatId, content, type = 'text', replyTo } = data;

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
          type,
          replyTo: replyTo || null
        });

        await message.save();
        console.log(`💾 MESSAGE SAVED to database: ${message._id}`);
        
        await message.populate('sender', 'name email avatar role');
        if (replyTo) {
          await message.populate('replyTo', 'content sender');
        }
        
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

        // Send notifications to offline users
        await sendNotificationsToOfflineUsers(chat, message, socket.userId);

      } catch (error) {
        console.error(`💥 SEND_MESSAGE ERROR for user ${socket.user.name}:`, error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle typing indicators
    socket.on('typing_start', (chatId) => {
      console.log(`⌨️ TYPING_START: User ${socket.user.name} in chat ${chatId}`);
      socket.to(`chat_${chatId}`).emit('user_typing', {
        userId: socket.userId,
        userName: socket.user.name,
        chatId
      });
    });

    socket.on('typing_stop', (chatId) => {
      console.log(`⌨️ TYPING_STOP: User ${socket.user.name} in chat ${chatId}`);
      socket.to(`chat_${chatId}`).emit('user_stop_typing', {
        userId: socket.userId,
        userName: socket.user.name,
        chatId
      });
    });

    // Handle message reactions
    socket.on('add_reaction', async (data) => {
      try {
        const { messageId, emoji } = data;
        const message = await Message.findById(messageId);
        
        if (!message) {
          socket.emit('error', { message: 'Message not found' });
          return;
        }

        // Check if user is participant in the chat
        const chat = await Chat.findById(message.chat);
        if (!chat || !chat.isParticipant(socket.userId)) {
          socket.emit('error', { message: 'Unauthorized' });
          return;
        }

        message.addReaction(socket.userId, emoji);
        await message.save();

        // Broadcast reaction to chat participants
        io.to(`chat_${message.chat}`).emit('message_reaction_added', {
          messageId,
          userId: socket.userId,
          userName: socket.user.name,
          emoji,
          reactionCounts: message.reactionCounts
        });
      } catch (error) {
        console.error('Add reaction error:', error);
        socket.emit('error', { message: 'Failed to add reaction' });
      }
    });

    socket.on('remove_reaction', async (data) => {
      try {
        const { messageId, emoji } = data;
        const message = await Message.findById(messageId);
        
        if (!message) {
          socket.emit('error', { message: 'Message not found' });
          return;
        }

        // Check if user is participant in the chat
        const chat = await Chat.findById(message.chat);
        if (!chat || !chat.isParticipant(socket.userId)) {
          socket.emit('error', { message: 'Unauthorized' });
          return;
        }

        message.removeReaction(socket.userId, emoji);
        await message.save();

        // Broadcast reaction removal to chat participants
        io.to(`chat_${message.chat}`).emit('message_reaction_removed', {
          messageId,
          userId: socket.userId,
          userName: socket.user.name,
          emoji,
          reactionCounts: message.reactionCounts
        });
      } catch (error) {
        console.error('Remove reaction error:', error);
        socket.emit('error', { message: 'Failed to remove reaction' });
      }
    });

    // Handle marking messages as read
    socket.on('mark_messages_read', async (data) => {
      try {
        const { chatId } = data;
        
        // Verify user is participant
        const chat = await Chat.findById(chatId);
        if (!chat || !chat.isParticipant(socket.userId)) {
          socket.emit('error', { message: 'Unauthorized' });
          return;
        }

        await Message.markAllAsRead(chatId, socket.userId);
        
        // Notify other participants that messages were read
        socket.to(`chat_${chatId}`).emit('messages_read', {
          userId: socket.userId,
          userName: socket.user.name,
          chatId
        });
      } catch (error) {
        console.error('Mark messages read error:', error);
        socket.emit('error', { message: 'Failed to mark messages as read' });
      }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log(`🔌 DISCONNECT: User ${socket.user.name} (ID: ${socket.userId}) disconnected`);
      updateUserOnlineStatus(socket.userId, false);
    });

    // Handle connection errors
    socket.on('error', (error) => {
      console.error(`🚨 SOCKET ERROR for user ${socket.user.name}:`, error);
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
    if (io) {
      io.emit('user_status_change', {
        userId,
        isOnline,
        lastSeen: new Date()
      });
    }
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

    // Emit to their user rooms in case they come online
    offlineParticipants.forEach(user => {
      if (io) {
        io.to(`user_${user._id}`).emit('new_message_notification', {
          chatId: chat._id,
          message: {
            content: message.content,
            sender: message.sender.name,
            chatName: chat.type === 'private' ? 'Private Chat' : chat.name
          }
        });
      }
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
