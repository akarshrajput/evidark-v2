import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  actor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['follow', 'like', 'comment', 'story_published'],
    required: true,
    index: true
  },
  targetType: {
    type: String,
    enum: ['Story', 'Comment', 'User'],
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  // For aggregated notifications (multiple likes/comments)
  isAggregated: {
    type: Boolean,
    default: false
  },
  aggregatedCount: {
    type: Number,
    default: 1
  },
  lastActors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  message: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  readAt: Date,
  // For optimization - batch delete old notifications
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for performance
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ recipient: 1, type: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
notificationSchema.index({ type: 1, actor: 1, target: 1 }, { unique: true, sparse: true });
notificationSchema.index({ createdAt: 1 }); // For cleanup operations
notificationSchema.index({ isRead: 1, createdAt: 1 }); // For bulk operations

// Virtual for target reference
notificationSchema.virtual('target', {
  refPath: 'targetType',
  localField: 'targetId',
  foreignField: '_id',
  justOne: true
});

// Pre-save middleware to ensure proper targetType casing
notificationSchema.pre('save', function(next) {
  const modelMap = {
    'story': 'Story',
    'comment': 'Comment', 
    'user': 'User'
  };
  
  if (this.targetType && modelMap[this.targetType.toLowerCase()]) {
    this.targetType = modelMap[this.targetType.toLowerCase()];
  }
  
  next();
});

// Static method to create optimized notification
notificationSchema.statics.createOptimized = async function(notificationData) {
  const { recipient, actor, type, targetType, targetId } = notificationData;
  
  // Don't notify yourself
  if (recipient.toString() === actor.toString()) {
    return null;
  }

  // For likes and comments, check if we can aggregate
  if (type === 'like' || type === 'comment') {
    const existingNotification = await this.findOne({
      recipient,
      type,
      targetType,
      targetId,
      isAggregated: true,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Within 24 hours
    });

    if (existingNotification) {
      // Update existing aggregated notification
      existingNotification.aggregatedCount += 1;
      existingNotification.lastActors = [
        actor,
        ...existingNotification.lastActors.filter(id => id.toString() !== actor.toString())
      ].slice(0, 3); // Keep only last 3 actors
      existingNotification.message = generateAggregatedMessage(type, existingNotification.aggregatedCount, existingNotification.lastActors);
      existingNotification.isRead = false;
      existingNotification.createdAt = new Date();
      return await existingNotification.save();
    }
  }

  // Create new notification
  const message = generateNotificationMessage(type, actor, targetType);
  const notification = new this({
    ...notificationData,
    message,
    lastActors: [actor]
  });

  return await notification.save();
};

// Static method to mark as read
notificationSchema.statics.markAsRead = async function(notificationIds, userId) {
  return await this.updateMany(
    { 
      _id: { $in: notificationIds },
      recipient: userId,
      isRead: false
    },
    { 
      isRead: true,
      readAt: new Date()
    }
  );
};

// Static method to get unread count for user
notificationSchema.statics.getUnreadCount = async function(userId) {
  return this.countDocuments({ 
    recipient: userId, 
    isRead: false 
  });
};

// Static method for bulk cleanup of old notifications
notificationSchema.statics.cleanupOldNotifications = async function(daysOld = 90) {
  const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
  
  const result = await this.deleteMany({
    $or: [
      { isRead: true, createdAt: { $lt: cutoffDate } },
      { createdAt: { $lt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000) } } // Force delete after 6 months
    ]
  });
  
  console.log(`🧹 Cleaned up ${result.deletedCount} old notifications`);
  return result;
};

// Static method for bulk operations
notificationSchema.statics.markAllAsRead = async function(userId) {
  return this.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
};

// Helper function to generate notification messages
function generateNotificationMessage(type, actor, targetType) {
  switch (type) {
    case 'follow':
      return `started following you`;
    case 'like':
      return `liked your ${targetType}`;
    case 'comment':
      return `commented on your ${targetType}`;
    case 'story_published':
      return `published a new story`;
    default:
      return 'sent you a notification';
  }
}

function generateAggregatedMessage(type, count, lastActors) {
  const action = type === 'like' ? 'liked' : 'commented on';
  if (count === 2) {
    return `and 1 other ${action} your story`;
  }
  return `and ${count - 1} others ${action} your story`;
}

export default mongoose.model('Notification', notificationSchema);
