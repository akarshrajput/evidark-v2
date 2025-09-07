import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";
import UserEngagement from "../models/UserEngagement.js";
import Story from "../models/Story.js";
import Comment from "../models/Comment.js";
import connectDB from "../config/database.js";

// Load environment variables
dotenv.config();

async function initializeEngagementData() {
  try {
    await connectDB();
    console.log("Connected to MongoDB");

    // Get all users
    const users = await User.find({});
    console.log(`Found ${users.length} users`);

    for (const user of users) {
      // Check if engagement record already exists
      const existingEngagement = await UserEngagement.findOne({
        user: user._id,
      });

      if (existingEngagement) {
        console.log(
          `Engagement record already exists for user: ${user.username}`
        );
        continue;
      }

      // Get user's story count
      const storiesCount = await Story.countDocuments({
        author: user._id,
        status: "published",
      });

      // Get user's comment count
      const commentsCount = await Comment.countDocuments({
        author: user._id,
      });

      // Calculate initial XP based on existing activities
      const initialXP = storiesCount * 100 + commentsCount * 10;

      // Create engagement record
      const engagement = new UserEngagement({
        user: user._id,
        totalXP: initialXP,
        totalStoriesCreated: storiesCount,
        totalCommentsPosted: commentsCount,
        level: Math.floor(Math.sqrt(initialXP / 100)) + 1,
      });

      await engagement.save();
      console.log(
        `Created engagement record for ${user.username}: ${initialXP} XP, Level ${engagement.level}`
      );
    }

    console.log("Engagement initialization completed");
    process.exit(0);
  } catch (error) {
    console.error("Error initializing engagement data:", error);
    process.exit(1);
  }
}

// Run the initialization
initializeEngagementData();
