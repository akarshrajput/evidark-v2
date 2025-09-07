import mongoose from "mongoose";

const userEngagementSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    // Total lifetime stats
    totalXP: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalStoriesCreated: {
      type: Number,
      default: 0,
    },
    totalStoriesCompleted: {
      type: Number,
      default: 0,
    },
    totalCommentsPosted: {
      type: Number,
      default: 0,
    },
    totalReadingTime: {
      type: Number,
      default: 0, // in minutes
    },

    // Weekly stats (resets every week)
    weeklyXP: {
      type: Number,
      default: 0,
      min: 0,
    },
    weeklyStoriesCreated: {
      type: Number,
      default: 0,
    },
    weeklyStoriesCompleted: {
      type: Number,
      default: 0,
    },
    weeklyCommentsPosted: {
      type: Number,
      default: 0,
    },
    weeklyReadingTime: {
      type: Number,
      default: 0,
    },
    weeklyRank: {
      type: Number,
      default: null,
    },

    // Current streak
    streakDays: {
      type: Number,
      default: 0,
    },
    lastActiveDate: {
      type: Date,
      default: Date.now,
    },

    // Week tracking
    currentWeekStart: {
      type: Date,
      default: () => {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const diff = now.getDate() - dayOfWeek;
        return new Date(now.setDate(diff));
      },
    },

    // Badge tracking
    badges: [
      {
        name: {
          type: String,
          required: true,
        },
        description: String,
        icon: String,
        earnedAt: {
          type: Date,
          default: Date.now,
        },
        type: {
          type: String,
          enum: ["bronze", "silver", "gold", "platinum", "special"],
          default: "bronze",
        },
      },
    ],

    // Level system
    level: {
      type: Number,
      default: 1,
      min: 1,
    },

    // Activity tracking for detailed view
    recentActivities: [
      {
        type: {
          type: String,
          enum: [
            "story_created",
            "story_completed",
            "comment_posted",
            "badge_earned",
            "level_up",
          ],
          required: true,
        },
        description: String,
        xpGained: {
          type: Number,
          default: 0,
        },
        date: {
          type: Date,
          default: Date.now,
        },
        metadata: {
          storyId: mongoose.Schema.Types.ObjectId,
          storyTitle: String,
          commentId: mongoose.Schema.Types.ObjectId,
          badgeName: String,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
userEngagementSchema.index({ user: 1 });
userEngagementSchema.index({ weeklyXP: -1 });
userEngagementSchema.index({ totalXP: -1 });
userEngagementSchema.index({ currentWeekStart: 1 });
userEngagementSchema.index({ level: -1 });

// XP calculation constants
const XP_VALUES = {
  STORY_CREATED: 100,
  STORY_COMPLETED: 15,
  COMMENT_POSTED: 10,
  DAILY_STREAK: 5,
};

// Level calculation (exponential growth)
userEngagementSchema.methods.calculateLevel = function () {
  return Math.floor(Math.sqrt(this.totalXP / 100)) + 1;
};

// Method to add XP and update stats
userEngagementSchema.methods.addXP = async function (type, metadata = {}) {
  const xpGained = XP_VALUES[type] || 0;

  this.totalXP += xpGained;
  this.weeklyXP += xpGained;

  // Update specific counters
  switch (type) {
    case "STORY_CREATED":
      this.totalStoriesCreated += 1;
      this.weeklyStoriesCreated += 1;
      break;
    case "STORY_COMPLETED":
      this.totalStoriesCompleted += 1;
      this.weeklyStoriesCompleted += 1;
      if (metadata.readingTime) {
        this.totalReadingTime += metadata.readingTime;
        this.weeklyReadingTime += metadata.readingTime;
      }
      break;
    case "COMMENT_POSTED":
      this.totalCommentsPosted += 1;
      this.weeklyCommentsPosted += 1;
      break;
  }

  // Update level
  const newLevel = this.calculateLevel();
  if (newLevel > this.level) {
    this.level = newLevel;
    this.recentActivities.unshift({
      type: "level_up",
      description: `Reached level ${newLevel}!`,
      xpGained: 0,
      metadata: { level: newLevel },
    });
  }

  // Add to recent activities
  this.recentActivities.unshift({
    type: type.toLowerCase(),
    description: this.getActivityDescription(type, metadata),
    xpGained,
    metadata,
  });

  // Keep only last 50 activities
  if (this.recentActivities.length > 50) {
    this.recentActivities = this.recentActivities.slice(0, 50);
  }

  // Check for new badges
  await this.checkAndAwardBadges();

  return await this.save();
};

// Get activity description
userEngagementSchema.methods.getActivityDescription = function (
  type,
  metadata
) {
  switch (type) {
    case "STORY_CREATED":
      return `Created story: ${metadata.storyTitle || "Untitled"}`;
    case "STORY_COMPLETED":
      return `Completed reading: ${metadata.storyTitle || "A story"}`;
    case "COMMENT_POSTED":
      return `Posted a comment on: ${metadata.storyTitle || "a story"}`;
    default:
      return "Activity completed";
  }
};

// Badge checking system
userEngagementSchema.methods.checkAndAwardBadges = async function () {
  const badges = [
    // Story creation badges
    {
      name: "First Steps",
      description: "Created your first story",
      icon: "✍️",
      condition: () => this.totalStoriesCreated >= 1,
    },
    {
      name: "Storyteller",
      description: "Created 10 stories",
      icon: "📚",
      type: "silver",
      condition: () => this.totalStoriesCreated >= 10,
    },
    {
      name: "Dark Author",
      description: "Created 50 stories",
      icon: "🖤",
      type: "gold",
      condition: () => this.totalStoriesCreated >= 50,
    },
    {
      name: "Master of Darkness",
      description: "Created 100 stories",
      icon: "👑",
      type: "platinum",
      condition: () => this.totalStoriesCreated >= 100,
    },

    // Reading badges
    {
      name: "Curious Reader",
      description: "Read 10 complete stories",
      icon: "👁️",
      condition: () => this.totalStoriesCompleted >= 10,
    },
    {
      name: "Devoted Reader",
      description: "Read 50 complete stories",
      icon: "📖",
      type: "silver",
      condition: () => this.totalStoriesCompleted >= 50,
    },
    {
      name: "Story Devourer",
      description: "Read 200 complete stories",
      icon: "🔥",
      type: "gold",
      condition: () => this.totalStoriesCompleted >= 200,
    },

    // Comment badges
    {
      name: "Conversationalist",
      description: "Posted 25 comments",
      icon: "💬",
      condition: () => this.totalCommentsPosted >= 25,
    },
    {
      name: "Community Voice",
      description: "Posted 100 comments",
      icon: "🗣️",
      type: "silver",
      condition: () => this.totalCommentsPosted >= 100,
    },

    // XP badges
    {
      name: "Rising Star",
      description: "Earned 1,000 XP",
      icon: "⭐",
      condition: () => this.totalXP >= 1000,
    },
    {
      name: "Dark Legend",
      description: "Earned 10,000 XP",
      icon: "🌟",
      type: "gold",
      condition: () => this.totalXP >= 10000,
    },

    // Level badges
    {
      name: "Level 10",
      description: "Reached level 10",
      icon: "🏆",
      type: "silver",
      condition: () => this.level >= 10,
    },
    {
      name: "Level 25",
      description: "Reached level 25",
      icon: "💎",
      type: "gold",
      condition: () => this.level >= 25,
    },

    // Reading time badges
    {
      name: "Night Owl",
      description: "Read for 10+ hours",
      icon: "🦉",
      condition: () => this.totalReadingTime >= 600,
    },
    {
      name: "Midnight Scholar",
      description: "Read for 50+ hours",
      icon: "🌙",
      type: "gold",
      condition: () => this.totalReadingTime >= 3000,
    },
  ];

  const newBadges = [];

  for (const badge of badges) {
    // Check if user already has this badge
    const hasBadge = this.badges.some(
      (userBadge) => userBadge.name === badge.name
    );

    if (!hasBadge && badge.condition()) {
      this.badges.push({
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        type: badge.type || "bronze",
      });

      this.recentActivities.unshift({
        type: "badge_earned",
        description: `Earned badge: ${badge.name}`,
        xpGained: 0,
        metadata: { badgeName: badge.name },
      });

      newBadges.push(badge);
    }
  }

  return newBadges;
};

// Method to reset weekly stats
userEngagementSchema.methods.resetWeeklyStats = function () {
  this.weeklyXP = 0;
  this.weeklyStoriesCreated = 0;
  this.weeklyStoriesCompleted = 0;
  this.weeklyCommentsPosted = 0;
  this.weeklyReadingTime = 0;
  this.weeklyRank = null;
  this.currentWeekStart = new Date();
};

// Static method to get weekly leaderboard
userEngagementSchema.statics.getWeeklyLeaderboard = async function (
  limit = 10
) {
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  return this.find({ weeklyXP: { $gt: 0 } })
    .populate("user", "name username avatar verified")
    .sort({ weeklyXP: -1 })
    .limit(limit)
    .lean();
};

// Static method to update weekly rankings
userEngagementSchema.statics.updateWeeklyRankings = async function () {
  const leaderboard = await this.getWeeklyLeaderboard(1000);

  for (let i = 0; i < leaderboard.length; i++) {
    await this.findByIdAndUpdate(leaderboard[i]._id, {
      weeklyRank: i + 1,
    });
  }
};

export default mongoose.model("UserEngagement", userEngagementSchema);
