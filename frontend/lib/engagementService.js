// Service to track user engagement activities
import api from "@/lib/api";

export const engagementService = {
  // Track story completion (when user finishes reading)
  trackStoryCompletion: async (storyId) => {
    try {
      const response = await api.post(`/api/v1/stories/${storyId}/complete`);
      return response.data;
    } catch (error) {
      console.error("Error tracking story completion:", error);
      return null;
    }
  },

  // Get user engagement data
  getUserEngagement: async () => {
    try {
      const response = await api.get("/api/v1/engagement/me");
      return response.data;
    } catch (error) {
      console.error("Error fetching engagement data:", error);
      return null;
    }
  },

  // Get user progress
  getUserProgress: async () => {
    try {
      const response = await api.get("/api/v1/engagement/progress");
      return response.data;
    } catch (error) {
      console.error("Error fetching progress data:", error);
      return null;
    }
  },

  // Get weekly leaderboard
  getWeeklyLeaderboard: async (limit = 10) => {
    try {
      const response = await api.get(
        `/api/v1/engagement/leaderboard/weekly?limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching weekly leaderboard:", error);
      return null;
    }
  },

  // Get all-time leaderboard
  getAllTimeLeaderboard: async (limit = 10) => {
    try {
      const response = await api.get(
        `/api/v1/engagement/leaderboard/alltime?limit=${limit}`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching all-time leaderboard:", error);
      return null;
    }
  },
};

// Hook to track story reading completion
export const useStoryCompletion = () => {
  const trackCompletion = async (storyId) => {
    return await engagementService.trackStoryCompletion(storyId);
  };

  return { trackCompletion };
};
