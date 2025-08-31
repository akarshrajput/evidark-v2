import { io } from 'socket.io-client';

class SocketClient {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect(token) {
    if (this.socket && this.isConnected) {
      return this.socket;
    }

    this.socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050', {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('🔌 Connected to Socket.IO server');
      this.isConnected = true;
    });

    this.socket.on('disconnect', () => {
      console.log('🔌 Disconnected from Socket.IO server');
      this.isConnected = false;
    });

    this.socket.on('error', (error) => {
      console.error('🚨 Socket.IO error:', error);
    });

    this.socket.on('connect_error', (error) => {
      console.error('🚨 Socket.IO connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Chat methods
  joinChat(chatId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_chat', { chatId });
    }
  }

  leaveChat(chatId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave_chat', { chatId });
    }
  }

  sendMessage(chatId, content, type = 'text', replyTo = null) {
    if (this.socket && this.isConnected) {
      this.socket.emit('send_message', {
        chatId,
        content,
        type,
        replyTo
      });
    }
  }

  startTyping(chatId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing_start', chatId);
    }
  }

  stopTyping(chatId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing_stop', chatId);
    }
  }

  addReaction(messageId, emoji) {
    if (this.socket && this.isConnected) {
      this.socket.emit('add_reaction', { messageId, emoji });
    }
  }

  removeReaction(messageId, emoji) {
    if (this.socket && this.isConnected) {
      this.socket.emit('remove_reaction', { messageId, emoji });
    }
  }

  markMessagesRead(chatId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('mark_messages_read', { chatId });
    }
  }

  // Event listeners
  onNewMessage(callback) {
    if (this.socket) {
      this.socket.on('new_message', callback);
    }
  }

  onUserTyping(callback) {
    if (this.socket) {
      this.socket.on('user_typing', callback);
    }
  }

  onUserStopTyping(callback) {
    if (this.socket) {
      this.socket.on('user_stop_typing', callback);
    }
  }

  onUserStatusChange(callback) {
    if (this.socket) {
      this.socket.on('user_status_change', callback);
    }
  }

  onMessageReactionAdded(callback) {
    if (this.socket) {
      this.socket.on('message_reaction_added', callback);
    }
  }

  onMessageReactionRemoved(callback) {
    if (this.socket) {
      this.socket.on('message_reaction_removed', callback);
    }
  }

  onMessagesRead(callback) {
    if (this.socket) {
      this.socket.on('messages_read', callback);
    }
  }

  onJoinedChat(callback) {
    if (this.socket) {
      this.socket.on('joined_chat', callback);
    }
  }

  onLeftChat(callback) {
    if (this.socket) {
      this.socket.on('left_chat', callback);
    }
  }

  onNewMessageNotification(callback) {
    if (this.socket) {
      this.socket.on('new_message_notification', callback);
    }
  }

  // Remove event listeners
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  getSocket() {
    return this.socket;
  }
}

// Create singleton instance
const socketClient = new SocketClient();

export default socketClient;
