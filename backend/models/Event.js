import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  type: {
    type: String,
    enum: ['writing_challenge', 'dark_ritual', 'community_gathering', 'horror_showcase', 'midnight_reading', 'story_contest'],
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['upcoming', 'active', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  maxParticipants: {
    type: Number,
    default: null // null means unlimited
  },
  participants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['joined', 'participating', 'completed', 'dropped'],
      default: 'joined'
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requirements: {
    minReputation: {
      type: Number,
      default: 0
    },
    categories: [{
      type: String
    }],
    description: String
  },
  rewards: {
    points: {
      type: Number,
      default: 0
    },
    badges: [{
      name: String,
      description: String,
      icon: String
    }],
    description: String
  },
  activities: [{
    type: {
      type: String,
      enum: ['submission', 'voting', 'discussion', 'reading', 'challenge'],
      required: true
    },
    title: String,
    description: String,
    startTime: Date,
    endTime: Date,
    isActive: {
      type: Boolean,
      default: false
    }
  }],
  submissions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    story: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Story'
    },
    content: String, // For non-story submissions
    submittedAt: {
      type: Date,
      default: Date.now
    },
    votes: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      score: {
        type: Number,
        min: 1,
        max: 5
      }
    }],
    totalScore: {
      type: Number,
      default: 0
    }
  }],
  settings: {
    isPublic: {
      type: Boolean,
      default: true
    },
    allowLateJoining: {
      type: Boolean,
      default: true
    },
    requireApproval: {
      type: Boolean,
      default: false
    },
    enableChat: {
      type: Boolean,
      default: true
    },
    enableVoting: {
      type: Boolean,
      default: false
    }
  },
  stats: {
    totalParticipants: {
      type: Number,
      default: 0
    },
    activeParticipants: {
      type: Number,
      default: 0
    },
    totalSubmissions: {
      type: Number,
      default: 0
    },
    views: {
      type: Number,
      default: 0
    }
  },
  featuredImage: {
    type: String,
    default: null
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Indexes for better performance
eventSchema.index({ status: 1, startDate: 1 });
eventSchema.index({ type: 1 });
eventSchema.index({ 'participants.user': 1 });
eventSchema.index({ createdBy: 1 });
eventSchema.index({ startDate: 1, endDate: 1 });

// Virtual for participant count
eventSchema.virtual('participantCount').get(function() {
  return this.participants.length;
});

// Virtual for active participant count
eventSchema.virtual('activeParticipantCount').get(function() {
  return this.participants.filter(p => p.status === 'participating' || p.status === 'joined').length;
});

// Method to check if user is participant
eventSchema.methods.isParticipant = function(userId) {
  return this.participants.some(p => p.user.toString() === userId.toString());
};

// Method to add participant
eventSchema.methods.addParticipant = function(userId) {
  if (!this.isParticipant(userId)) {
    this.participants.push({ user: userId });
    this.stats.totalParticipants = this.participants.length;
    this.stats.activeParticipants = this.activeParticipantCount;
  }
};

// Method to remove participant
eventSchema.methods.removeParticipant = function(userId) {
  this.participants = this.participants.filter(p => p.user.toString() !== userId.toString());
  this.stats.totalParticipants = this.participants.length;
  this.stats.activeParticipants = this.activeParticipantCount;
};

// Method to update event status based on dates
eventSchema.methods.updateStatus = function() {
  const now = new Date();
  if (now < this.startDate) {
    this.status = 'upcoming';
  } else if (now >= this.startDate && now <= this.endDate) {
    this.status = 'active';
  } else {
    this.status = 'completed';
  }
};

// Pre-save middleware to update status
eventSchema.pre('save', function(next) {
  this.updateStatus();
  next();
});

export default mongoose.model('Event', eventSchema);
