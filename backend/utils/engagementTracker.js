import UserEngagement from "../models/UserEngagement.js";

// Helper function to track user engagement
export const trackEngagement = async (userId, type, metadata = {}) => {
  try {
    let engagement = await UserEngagement.findOne({ user: userId });

    if (!engagement) {
      engagement = new UserEngagement({ user: userId });
    }

    // Check if we need to reset weekly stats
    const now = new Date();
    const startOfCurrentWeek = new Date();
    startOfCurrentWeek.setDate(
      startOfCurrentWeek.getDate() - startOfCurrentWeek.getDay()
    );
    startOfCurrentWeek.setHours(0, 0, 0, 0);

    if (engagement.currentWeekStart < startOfCurrentWeek) {
      engagement.resetWeeklyStats();
    }

    const updatedEngagement = await engagement.addXP(type, metadata);
    return updatedEngagement;
  } catch (error) {
    console.error("Track engagement error:", error);
    return null;
  }
};

// Specific tracking functions
export const trackStoryCreation = async (userId, storyId, storyTitle) => {
  return trackEngagement(userId, "STORY_CREATED", {
    storyId,
    storyTitle,
  });
};

export const trackStoryCompletion = async (
  userId,
  storyId,
  storyTitle,
  readingTime
) => {
  return trackEngagement(userId, "STORY_COMPLETED", {
    storyId,
    storyTitle,
    readingTime,
  });
};

export const trackCommentPosted = async (
  userId,
  commentId,
  storyId,
  storyTitle
) => {
  return trackEngagement(userId, "COMMENT_POSTED", {
    commentId,
    storyId,
    storyTitle,
  });
};

// Weekly ranking update (to be run by cron job)
export const updateWeeklyRankings = async () => {
  try {
    await UserEngagement.updateWeeklyRankings();
    console.log("Weekly rankings updated successfully");
  } catch (error) {
    console.error("Error updating weekly rankings:", error);
  }
};

// Create engagement record for existing users (migration helper)
export const createEngagementForUser = async (userId) => {
  try {
    const existingEngagement = await UserEngagement.findOne({ user: userId });
    if (!existingEngagement) {
      const engagement = new UserEngagement({ user: userId });
      await engagement.save();
      return engagement;
    }
    return existingEngagement;
  } catch (error) {
    console.error("Error creating engagement record:", error);
    return null;
  }
};
