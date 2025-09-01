import Notification from '../models/Notification.js';

// Import socket instance
let io;
export const setSocketIO = (socketInstance) => {
  io = socketInstance;
};

// Function to emit notification via socket
const emitNotification = (userId, notification) => {
  if (io) {
    io.to(`user_${userId}`).emit('newNotification', notification);
    console.log(` Emitted notification to user ${userId}:`, notification.message);
  } else {
    console.log(` Would emit notification to user ${userId}:`, notification.message);
  }
};

// Helper function to create and emit notifications
export const createNotification = async (notificationData) => {
  try {
    const notification = await Notification.createOptimized(notificationData);
    
    if (notification) {
      // Populate the notification for real-time emission
      await notification.populate([
        { path: 'actor', select: 'name avatar role' },
        { path: 'target' },
        { path: 'lastActors', select: 'name avatar' }
      ]);

      // Emit real-time notification via Socket.IO
      const io = getIO();
      if (io) {
        io.to(`user_${notification.recipient}`).emit('new_notification', {
          notification,
          unreadCount: await Notification.getUnreadCount(notification.recipient)
        });
      }

      return notification;
    }
    
    return null;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

// Helper to create follow notification
export const createFollowNotification = async (followerId, followedUserId) => {
  return await createNotification({
    recipient: followedUserId,
    actor: followerId,
    type: 'follow',
    targetType: 'User',
    targetId: followedUserId
  });
};

// Helper to create like notification
export const createLikeNotification = async (userId, storyAuthorId, storyId) => {
  return await createNotification({
    recipient: storyAuthorId,
    actor: userId,
    type: 'like',
    targetType: 'Story',
    targetId: storyId,
    isAggregated: true
  });
};

// Helper to create comment notification
export const createCommentNotification = async (userId, storyAuthorId, storyId, commentId) => {
  return await createNotification({
    recipient: storyAuthorId,
    actor: userId,
    type: 'comment',
    targetType: 'Story',
    targetId: storyId,
    isAggregated: true
  });
};

// Helper to create story published notification (for followers)
export const createStoryPublishedNotification = async (authorId, storyId, followerIds) => {
  const notifications = [];
  
  for (const followerId of followerIds) {
    const notification = await createNotification({
      recipient: followerId,
      actor: authorId,
      type: 'story_published',
      targetType: 'Story',
      targetId: storyId
    });
    
    if (notification) {
      notifications.push(notification);
    }
  }
  
  return notifications;
};
