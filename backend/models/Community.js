import mongoose from 'mongoose';

const communitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 50
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  type: {
    type: String,
    enum: ['circle', 'challenge', 'ritual', 'coven'],
    required: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['member', 'moderator', 'elder'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    reputation: {
      type: Number,
      default: 0
    }
  }],
  avatar: {
    type: String,
    default: null
  },
  banner: {
    type: String,
    default: null
  },
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  rules: [{
    title: String,
    description: String
  }],
  stats: {
    memberCount: {
      type: Number,
      default: 0
    },
    postCount: {
      type: Number,
      default: 0
    },
    activeMembers: {
      type: Number,
      default: 0
    }
  },
  settings: {
    isPrivate: {
      type: Boolean,
      default: false
    },
    requireApproval: {
      type: Boolean,
      default: false
    },
    allowInvites: {
      type: Boolean,
      default: true
    },
    minReputationToPost: {
      type: Number,
      default: 0
    }
  },
  activity: {
    lastPostAt: Date,
    lastActiveAt: {
      type: Date,
      default: Date.now
    }
  },
  featured: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'suspended'],
    default: 'active'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for member count
communitySchema.virtual('memberCount').get(function() {
  return this.members ? this.members.length : 0;
});

// Indexes for performance
communitySchema.index({ name: 1 });
communitySchema.index({ type: 1 });
communitySchema.index({ 'members.user': 1 });
communitySchema.index({ tags: 1 });
communitySchema.index({ featured: -1, 'stats.memberCount': -1 });
communitySchema.index({ createdAt: -1 });

// Methods
communitySchema.methods.addMember = function(userId, role = 'member') {
  const existingMember = this.members.find(member => 
    member.user.toString() === userId.toString()
  );
  
  if (!existingMember) {
    this.members.push({
      user: userId,
      role,
      joinedAt: new Date(),
      reputation: 0
    });
    this.stats.memberCount = this.members.length;
  }
  
  return this.save();
};

communitySchema.methods.removeMember = function(userId) {
  this.members = this.members.filter(member => 
    member.user.toString() !== userId.toString()
  );
  this.stats.memberCount = this.members.length;
  return this.save();
};

communitySchema.methods.isMember = function(userId) {
  return this.members.some(member => 
    member.user.toString() === userId.toString()
  );
};

communitySchema.methods.getMemberRole = function(userId) {
  const member = this.members.find(member => 
    member.user.toString() === userId.toString()
  );
  return member ? member.role : null;
};

export default mongoose.model('Community', communitySchema);
