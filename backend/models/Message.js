import mongoose from 'mongoose';

const reactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  emoji: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const messageSchema = new mongoose.Schema({
  chat: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: [2000, 'Message cannot be more than 2000 characters']
  },
  type: {
    type: String,
    enum: ['text', 'image', 'file', 'audio', 'video', 'system'],
    default: 'text'
  },
  replyTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  attachments: [{
    type: {
      type: String,
      enum: ['image', 'file', 'audio', 'video']
    },
    url: String,
    filename: String,
    size: Number,
    mimeType: String
  }],
  reactions: [reactionSchema],
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: Date,
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: Date,
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  metadata: {
    encrypted: { type: Boolean, default: false },
    deliveredAt: Date,
    failedDelivery: { type: Boolean, default: false },
    retryCount: { type: Number, default: 0 }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
messageSchema.index({ chat: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ replyTo: 1 });
messageSchema.index({ 'readBy.user': 1 });

// Virtual for reaction counts
messageSchema.virtual('reactionCounts').get(function() {
  const counts = {};
  this.reactions.forEach(reaction => {
    counts[reaction.emoji] = (counts[reaction.emoji] || 0) + 1;
  });
  return counts;
});

// Method to add reaction
messageSchema.methods.addReaction = function(userId, emoji) {
  // Remove existing reaction from this user
  this.reactions = this.reactions.filter(r => 
    r.user.toString() !== userId.toString() || r.emoji !== emoji
  );
  
  // Add new reaction
  this.reactions.push({
    user: userId,
    emoji: emoji
  });
};

// Method to remove reaction
messageSchema.methods.removeReaction = function(userId, emoji) {
  this.reactions = this.reactions.filter(r => 
    !(r.user.toString() === userId.toString() && r.emoji === emoji)
  );
};

// Method to mark as read by user
messageSchema.methods.markAsRead = function(userId) {
  const existingRead = this.readBy.find(r => 
    r.user.toString() === userId.toString()
  );
  
  if (!existingRead) {
    this.readBy.push({
      user: userId,
      readAt: new Date()
    });
  }
};

// Method to check if read by user
messageSchema.methods.isReadBy = function(userId) {
  return this.readBy.some(r => r.user.toString() === userId.toString());
};

// Static method to get unread count for user in chat
messageSchema.statics.getUnreadCount = function(chatId, userId) {
  return this.countDocuments({
    chat: chatId,
    sender: { $ne: userId },
    'readBy.user': { $ne: userId },
    isDeleted: false
  });
};

// Static method to mark all messages as read in a chat
messageSchema.statics.markAllAsRead = async function(chatId, userId) {
  const messages = await this.find({
    chat: chatId,
    sender: { $ne: userId },
    'readBy.user': { $ne: userId },
    isDeleted: false
  });

  const updatePromises = messages.map(message => {
    message.markAsRead(userId);
    return message.save();
  });

  await Promise.all(updatePromises);
};

// Pre-save middleware to update chat's last message and activity
messageSchema.pre('save', async function(next) {
  if (this.isNew && !this.isDeleted) {
    const Chat = mongoose.model('Chat');
    await Chat.findByIdAndUpdate(this.chat, {
      lastMessage: this._id,
      lastActivity: new Date(),
      $inc: { 'metadata.messageCount': 1 }
    });
  }
  next();
});

// Pre-remove middleware to update chat's message count
messageSchema.pre('remove', async function(next) {
  const Chat = mongoose.model('Chat');
  await Chat.findByIdAndUpdate(this.chat, {
    $inc: { 'metadata.messageCount': -1 }
  });
  next();
});

export default mongoose.model('Message', messageSchema);
