import mongoose from 'mongoose';

const participantSchema = new mongoose.Schema({
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
  isActive: {
    type: Boolean,
    default: true
  },
  lastReadAt: {
    type: Date,
    default: Date.now
  },
  permissions: {
    canSendMessages: { type: Boolean, default: true },
    canAddMembers: { type: Boolean, default: false },
    canRemoveMembers: { type: Boolean, default: false },
    canEditChat: { type: Boolean, default: false }
  }
});

const chatSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['private', 'group'],
    required: true
  },
  name: {
    type: String,
    trim: true,
    maxlength: [100, 'Chat name cannot be more than 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Chat description cannot be more than 500 characters']
  },
  avatar: {
    type: String,
    default: ''
  },
  participants: [participantSchema],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  settings: {
    allowFileUploads: { type: Boolean, default: true },
    allowReactions: { type: Boolean, default: true },
    allowReplies: { type: Boolean, default: true },
    muteNotifications: { type: Boolean, default: false },
    encryptMessages: { type: Boolean, default: false }
  },
  metadata: {
    messageCount: { type: Number, default: 0 },
    activeParticipants: { type: Number, default: 0 }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
chatSchema.index({ 'participants.user': 1, 'participants.isActive': 1 });
chatSchema.index({ type: 1 });
chatSchema.index({ lastActivity: -1 });
chatSchema.index({ createdBy: 1 });

// Virtual for active participants count
chatSchema.virtual('activeParticipantsCount').get(function() {
  return this.participants.filter(p => p.isActive).length;
});

// Method to check if user is participant
chatSchema.methods.isParticipant = function(userId) {
  return this.participants.some(p => 
    p.user.toString() === userId.toString() && p.isActive
  );
};

// Method to check if user is admin
chatSchema.methods.isAdmin = function(userId) {
  const participant = this.participants.find(p => 
    p.user.toString() === userId.toString() && p.isActive
  );
  return participant && participant.role === 'admin';
};

// Method to add participant
chatSchema.methods.addParticipant = function(userId, role = 'member') {
  const existingParticipant = this.participants.find(p => 
    p.user.toString() === userId.toString()
  );
  
  if (existingParticipant) {
    existingParticipant.isActive = true;
    existingParticipant.role = role;
    existingParticipant.joinedAt = new Date();
  } else {
    this.participants.push({
      user: userId,
      role: role,
      joinedAt: new Date(),
      isActive: true
    });
  }
  
  this.metadata.activeParticipants = this.participants.filter(p => p.isActive).length;
};

// Method to remove participant
chatSchema.methods.removeParticipant = function(userId) {
  const participant = this.participants.find(p => 
    p.user.toString() === userId.toString()
  );
  
  if (participant) {
    participant.isActive = false;
  }
  
  this.metadata.activeParticipants = this.participants.filter(p => p.isActive).length;
};

// Method to update last activity
chatSchema.methods.updateLastActivity = function() {
  this.lastActivity = new Date();
};

// Pre-save middleware to set chat name for private chats
chatSchema.pre('save', async function(next) {
  if (this.type === 'private' && !this.name) {
    // For private chats, name is not required as it's generated on frontend
    this.name = undefined;
  }
  
  // Update active participants count
  this.metadata.activeParticipants = this.participants.filter(p => p.isActive).length;
  
  next();
});

// Static method to find user's chats
chatSchema.statics.findUserChats = function(userId, options = {}) {
  const { page = 1, limit = 20, search = '' } = options;
  
  let query = {
    'participants.user': userId,
    'participants.isActive': true,
    isDeleted: false
  };
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }
  
  return this.find(query)
    .populate('participants.user', 'name email avatar role isOnline lastSeen')
    .populate({
      path: 'lastMessage',
      populate: {
        path: 'sender',
        select: 'name avatar'
      }
    })
    .sort({ lastActivity: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

export default mongoose.model('Chat', chatSchema);
