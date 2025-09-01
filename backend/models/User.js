import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  username: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [20, 'Username cannot be more than 20 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  avatar: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot be more than 500 characters'],
    default: ''
  },
  role: {
    type: String,
    enum: ['user', 'guide', 'admin'],
    default: 'user'
  },
  verified: {
    type: Boolean,
    default: false
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  xp: {
    type: Number,
    default: 0,
    min: 0
  },
  level: {
    type: Number,
    default: 1,
    min: 1
  },
  creatorScore: {
    type: Number,
    default: 0,
    min: 0
  },
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'dark'
    },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      comments: { type: Boolean, default: true },
      likes: { type: Boolean, default: true },
      follows: { type: Boolean, default: true }
    },
    privacy: {
      profileVisibility: {
        type: String,
        enum: ['public', 'followers', 'private'],
        default: 'public'
      },
      showEmail: { type: Boolean, default: false },
      showOnlineStatus: { type: Boolean, default: true }
    }
  },
  socialLinks: {
    website: String,
    twitter: String,
    instagram: String,
    github: String
  },
  stats: {
    storiesCount: { type: Number, default: 0 },
    likesReceived: { type: Number, default: 0 },
    likesGiven: { type: Number, default: 0 },
    commentsReceived: { type: Number, default: 0 },
    viewsReceived: { type: Number, default: 0 },
    followersCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 }
  },
  badges: [{
    name: String,
    description: String,
    icon: String,
    earnedAt: { type: Date, default: Date.now }
  }],
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  emailVerificationToken: String,
  emailVerificationExpire: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better query performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ role: 1 });
userSchema.index({ verified: 1 });

// Virtual for follower count
userSchema.virtual('followersCount').get(function() {
  return this.followers ? this.followers.length : 0;
});

// Virtual for following count
userSchema.virtual('followingCount').get(function() {
  return this.following ? this.following.length : 0;
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to check password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to generate username from email if not provided
userSchema.methods.generateUsername = function() {
  if (!this.username) {
    const baseUsername = this.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
    this.username = baseUsername + Math.floor(Math.random() * 1000);
  }
};

// Pre-save middleware to generate username
userSchema.pre('save', function(next) {
  if (!this.username && this.email) {
    this.generateUsername();
  }
  next();
});

// Method to update stats
userSchema.methods.updateStats = async function() {
  const Story = mongoose.model('Story');
  const Like = mongoose.model('Like');
  const Comment = mongoose.model('Comment');

  const [storiesCount, likesReceived, commentsReceived] = await Promise.all([
    Story.countDocuments({ author: this._id, status: 'published' }),
    Like.countDocuments({ targetType: 'Story', target: { $in: await Story.find({ author: this._id }).select('_id') } }),
    Comment.countDocuments({ story: { $in: await Story.find({ author: this._id }).select('_id') } })
  ]);

  this.stats.storiesCount = storiesCount;
  this.stats.likesReceived = likesReceived;
  this.stats.commentsReceived = commentsReceived;
  this.stats.followersCount = this.followers.length;
  this.stats.followingCount = this.following.length;

  await this.save();
};

export default mongoose.model('User', userSchema);
