import mongoose from 'mongoose';

const communityPostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    maxlength: 10000
  },
  type: {
    type: String,
    enum: ['discussion', 'challenge', 'ritual', 'story_share', 'question', 'announcement'],
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  community: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
    required: true
  },
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],
  attachments: [{
    type: String, // URLs to images/files
  }],
  poll: {
    question: String,
    options: [{
      text: String,
      votes: [{
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        votedAt: {
          type: Date,
          default: Date.now
        }
      }]
    }],
    endsAt: Date,
    allowMultiple: {
      type: Boolean,
      default: false
    }
  },
  challenge: {
    prompt: String,
    rules: [String],
    deadline: Date,
    participants: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      submission: String,
      submittedAt: Date,
      votes: Number
    }],
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  engagement: {
    likes: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    comments: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CommunityComment'
    }],
    shares: Number,
    views: Number
  },
  status: {
    type: String,
    enum: ['active', 'pinned', 'locked', 'archived', 'removed'],
    default: 'active'
  },
  moderation: {
    reports: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      reason: String,
      createdAt: {
        type: Date,
        default: Date.now
      }
    }],
    moderatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    moderatedAt: Date,
    moderationNote: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals
communityPostSchema.virtual('likesCount').get(function() {
  return this.engagement.likes ? this.engagement.likes.length : 0;
});

communityPostSchema.virtual('commentsCount').get(function() {
  return this.engagement.comments ? this.engagement.comments.length : 0;
});

// Indexes
communityPostSchema.index({ community: 1, createdAt: -1 });
communityPostSchema.index({ author: 1 });
communityPostSchema.index({ type: 1 });
communityPostSchema.index({ status: 1 });
communityPostSchema.index({ 'engagement.likes.user': 1 });

// Methods
communityPostSchema.methods.addLike = function(userId) {
  const existingLike = this.engagement.likes.find(like => 
    like.user.toString() === userId.toString()
  );
  
  if (!existingLike) {
    this.engagement.likes.push({ user: userId });
  } else {
    this.engagement.likes = this.engagement.likes.filter(like => 
      like.user.toString() !== userId.toString()
    );
  }
  
  return this.save();
};

communityPostSchema.methods.isLikedBy = function(userId) {
  return this.engagement.likes.some(like => 
    like.user.toString() === userId.toString()
  );
};

export default mongoose.model('CommunityPost', communityPostSchema);
