import mongoose from 'mongoose';
import slugify from 'slugify';

const storySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Story title is required'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  slug: {
    type: String,
    unique: true,
    index: true
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters'],
    default: ''
  },
  content: {
    type: String,
    required: [true, 'Story content is required']
  },
  photo: {
    type: String,
    default: ''
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Story must have an author']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['horror', 'thriller', 'supernatural', 'psychological', 'gothic', 'mystery', 'dark fantasy', 'paranormal'],
    lowercase: true
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  status: {
    type: String,
    enum: ['draft', 'published', 'archived', 'pending'],
    default: 'draft'
  },
  ageRating: {
    type: String,
    enum: ['13+', '16+', '18+'],
    default: '16+'
  },
  contentWarnings: [{
    type: String,
    enum: [
      'violence',
      'gore',
      'psychological horror',
      'death',
      'suicide',
      'self-harm',
      'abuse',
      'sexual content',
      'strong language',
      'substance abuse',
      'disturbing imagery',
      'jump scares',
      // Legacy values for backward compatibility
      'Strong Language',
      'Suicide/Self-harm',
      'Violence',
      'Gore',
      'Death',
      'Sexual Content',
      'Abuse',
      'Substance Abuse',
      'Disturbing Imagery'
    ]
  }],
  readingTime: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  likesCount: {
    type: Number,
    default: 0
  },
  commentsCount: {
    type: Number,
    default: 0
  },
  bookmarksCount: {
    type: Number,
    default: 0
  },
  upvotes: {
    type: Number,
    default: 0
  },
  downvotes: {
    type: Number,
    default: 0
  },
  featured: {
    type: Boolean,
    default: false
  },
  trending: {
    type: Boolean,
    default: false
  },
  series: {
    name: String,
    part: Number,
    description: String
  },
  publishedAt: {
    type: Date
  },
  lastEditedAt: {
    type: Date,
    default: Date.now
  },
  metadata: {
    wordCount: { type: Number, default: 0 },
    characterCount: { type: Number, default: 0 },
    readabilityScore: { type: Number, default: 0 },
    sentiment: {
      type: String,
      enum: ['positive', 'negative', 'neutral'],
      default: 'neutral'
    }
  },
  engagement: {
    totalInteractions: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    completionRate: { type: Number, default: 0, min: 0, max: 100 }
  },
  seo: {
    metaTitle: String,
    metaDescription: String,
    keywords: [String]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
storySchema.index({ author: 1, status: 1 });
storySchema.index({ category: 1, status: 1 });
storySchema.index({ tags: 1 });
storySchema.index({ featured: 1, status: 1 });
storySchema.index({ trending: 1, status: 1 });
storySchema.index({ createdAt: -1 });
storySchema.index({ views: -1 });
storySchema.index({ likesCount: -1 });
storySchema.index({ 'engagement.totalInteractions': -1 });

// Text index for search functionality
storySchema.index({
  title: 'text',
  description: 'text',
  content: 'text',
  tags: 'text'
});

// Virtual for net votes
storySchema.virtual('netVotes').get(function() {
  return this.upvotes - this.downvotes;
});

// Virtual for engagement score
storySchema.virtual('engagementScore').get(function() {
  return (this.likesCount * 2) + (this.commentsCount * 3) + (this.bookmarksCount * 1.5) + (this.views * 0.1);
});

// Pre-save middleware to generate slug and fix data types
storySchema.pre('save', function(next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g
    });
  }
  
  // Fix upvotes/downvotes if they are arrays (legacy data)
  if (Array.isArray(this.upvotes)) {
    this.upvotes = this.upvotes.length || 0;
  }
  if (Array.isArray(this.downvotes)) {
    this.downvotes = this.downvotes.length || 0;
  }
  
  next();
});

// Pre-save middleware to calculate reading time and metadata
storySchema.pre('save', function(next) {
  if (this.isModified('content')) {
    // Calculate reading time (average 200 words per minute)
    const wordCount = this.content.split(/\s+/).length;
    this.readingTime = Math.ceil(wordCount / 200);
    
    // Update metadata
    this.metadata.wordCount = wordCount;
    this.metadata.characterCount = this.content.length;
  }
  
  // Set published date when status changes to published
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  // Update last edited date
  if (this.isModified() && !this.isNew) {
    this.lastEditedAt = new Date();
  }
  
  next();
});

// Method to increment views
storySchema.methods.incrementViews = async function() {
  this.views += 1;
  await this.save();
};

// Method to update engagement metrics
storySchema.methods.updateEngagement = async function() {
  const Like = mongoose.model('Like');
  const Comment = mongoose.model('Comment');
  const Bookmark = mongoose.model('Bookmark');

  const [likesCount, commentsCount, bookmarksCount] = await Promise.all([
    Like.countDocuments({ targetType: 'Story', target: this._id }),
    Comment.countDocuments({ story: this._id }),
    Bookmark.countDocuments({ story: this._id })
  ]);

  this.likesCount = likesCount;
  this.commentsCount = commentsCount;
  this.bookmarksCount = bookmarksCount;
  this.engagement.totalInteractions = likesCount + commentsCount + bookmarksCount;

  await this.save();
};

// Static method to get trending stories
storySchema.statics.getTrending = function(limit = 10) {
  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
  
  return this.aggregate([
    {
      $match: {
        status: 'published',
        createdAt: { $gte: twoDaysAgo }
      }
    },
    {
      $addFields: {
        trendingScore: {
          $add: [
            { $multiply: ['$likesCount', 2] },
            { $multiply: ['$commentsCount', 3] },
            { $multiply: ['$bookmarksCount', 1.5] },
            { $multiply: ['$views', 0.1] }
          ]
        }
      }
    },
    { $sort: { trendingScore: -1 } },
    { $limit: limit }
  ]);
};

// Static method to get featured stories
storySchema.statics.getFeatured = function(limit = 5) {
  return this.find({ 
    status: 'published', 
    featured: true 
  })
  .populate('author', 'name username avatar verified')
  .sort({ createdAt: -1 })
  .limit(limit);
};

export default mongoose.model('Story', storySchema);
