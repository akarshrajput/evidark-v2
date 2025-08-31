import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['private', 'group'],
    default: 'private',
    required: true
  },
  name: {
    type: String,
    required: function() {
      return this.type === 'group';
    }
  },
  description: {
    type: String,
    maxlength: 500
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    lastSeen: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  isEncrypted: {
    type: Boolean,
    default: true
  },
  encryptionKey: {
    type: String,
    select: false // Never include in queries by default
  },
  settings: {
    allowInvites: {
      type: Boolean,
      default: false
    },
    muteNotifications: {
      type: Boolean,
      default: false
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
chatSchema.index({ participants: 1 });
chatSchema.index({ lastActivity: -1 });
chatSchema.index({ type: 1 });
chatSchema.index({ 'participants.user': 1, isDeleted: 1 });

// Virtual for participant count
chatSchema.virtual('participantCount').get(function() {
  return this.participants.filter(p => p.isActive).length;
});

// Method to check if user is participant
chatSchema.methods.isParticipant = function(userId) {
  return this.participants.some(p => 
    p.user.toString() === userId.toString() && p.isActive
  );
};

// Method to get user's role in chat
chatSchema.methods.getUserRole = function(userId) {
  const participant = this.participants.find(p => 
    p.user.toString() === userId.toString() && p.isActive
  );
  return participant ? participant.role : null;
};

// Static method to find user's chats
chatSchema.statics.findUserChats = function(userId) {
  return this.find({
    'participants.user': userId,
    'participants.isActive': true,
    isDeleted: false
  })
  .populate('participants.user', 'name email avatar')
  .populate('lastMessage')
  .sort({ lastActivity: -1 });
};

// Static method to create private chat
chatSchema.statics.createPrivateChat = function(user1Id, user2Id) {
  return this.create({
    type: 'private',
    participants: [
      { user: user1Id, role: 'member' },
      { user: user2Id, role: 'member' }
    ],
    createdBy: user1Id,
    isEncrypted: true
  });
};

// Pre-save middleware
chatSchema.pre('save', function(next) {
  if (this.type === 'private' && this.participants.length !== 2) {
    return next(new Error('Private chats must have exactly 2 participants'));
  }
  next();
});

const Chat = mongoose.models.Chat || mongoose.model('Chat', chatSchema);

export default Chat;
