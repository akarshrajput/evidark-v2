import cron from "node-cron";
import UserEngagement from "../models/UserEngagement.js";

// Update weekly rankings every hour
export const startWeeklyRankingJob = () => {
  cron.schedule("0 * * * *", async () => {
    console.log("🕐 Running weekly ranking update...");

    try {
      await UserEngagement.updateWeeklyRankings();
      console.log("✅ Weekly rankings updated successfully");
    } catch (error) {
      console.error("❌ Error updating weekly rankings:", error);
    }
  });

  console.log("📅 Weekly ranking cron job started (runs every hour)");
};

// Reset weekly stats every Monday at midnight
export const startWeeklyResetJob = () => {
  cron.schedule("0 0 * * 1", async () => {
    console.log("🔄 Running weekly stats reset...");

    try {
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      await UserEngagement.updateMany(
        {},
        {
          $set: {
            weeklyXP: 0,
            weeklyStoriesCreated: 0,
            weeklyStoriesCompleted: 0,
            weeklyCommentsPosted: 0,
            weeklyReadingTime: 0,
            weeklyRank: null,
            currentWeekStart: startOfWeek,
          },
        }
      );

      console.log("✅ Weekly stats reset completed");
    } catch (error) {
      console.error("❌ Error resetting weekly stats:", error);
    }
  });

  console.log(
    "📅 Weekly reset cron job started (runs every Monday at midnight)"
  );
};
