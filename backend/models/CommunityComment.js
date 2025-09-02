import mongoose from 'mongoose';

const communityCommentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CommunityPost',
    required: true
  },
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CommunityComment',
    default: null
  },
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CommunityComment'
  }],
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
  status: {
    type: String,
    enum: ['active', 'edited', 'removed'],
    default: 'active'
  },
  editHistory: [{
    content: String,
    editedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals
communityCommentSchema.virtual('likesCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

communityCommentSchema.virtual('repliesCount').get(function() {
  return this.replies ? this.replies.length : 0;
});

// Indexes
communityCommentSchema.index({ post: 1, createdAt: -1 });
communityCommentSchema.index({ author: 1 });
communityCommentSchema.index({ parentComment: 1 });

// Methods
communityCommentSchema.methods.addReply = function(commentId) {
  if (!this.replies.includes(commentId)) {
    this.replies.push(commentId);
  }
  return this.save();
};

export default mongoose.model('CommunityComment', communityCommentSchema);
