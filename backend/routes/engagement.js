import express from "express";
import UserEngagement from "../models/UserEngagement.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// @desc    Get user's engagement stats
// @route   GET /api/v1/engagement/me
// @access  Private
router.get("/me", authenticate, async (req, res) => {
  try {
    let engagement = await UserEngagement.findOne({
      user: req.user.id,
    }).populate("user", "name username avatar verified");

    if (!engagement) {
      // Create engagement record if it doesn't exist
      engagement = new UserEngagement({ user: req.user.id });
      await engagement.save();
      await engagement.populate("user", "name username avatar verified");
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
      await engagement.save();
    }

    res.json({
      success: true,
      data: engagement,
    });
  } catch (error) {
    console.error("Get engagement error:", error);
    res.status(500).json({
      success: false,
      error: "Server error fetching engagement data",
    });
  }
});

// @desc    Get user's detailed progress (for progress page)
// @route   GET /api/v1/engagement/progress
// @access  Private
router.get("/progress", authenticate, async (req, res) => {
  try {
    const engagement = await UserEngagement.findOne({
      user: req.user.id,
    }).populate("user", "name username avatar verified");

    if (!engagement) {
      return res.status(404).json({
        success: false,
        error: "Engagement data not found",
      });
    }

    // Calculate additional stats
    const nextLevelXP = Math.pow(engagement.level, 2) * 100;
    const currentLevelXP = Math.pow(engagement.level - 1, 2) * 100;
    const progressToNextLevel =
      ((engagement.totalXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) *
      100;

    // Get rank among all users
    const totalRank =
      (await UserEngagement.countDocuments({
        totalXP: { $gt: engagement.totalXP },
      })) + 1;

    const totalUsers = await UserEngagement.countDocuments();

    res.json({
      success: true,
      data: {
        ...engagement.toObject(),
        nextLevelXP,
        currentLevelXP,
        progressToNextLevel: Math.min(100, Math.max(0, progressToNextLevel)),
        totalRank,
        totalUsers,
        percentile: Math.round(
          ((totalUsers - totalRank + 1) / totalUsers) * 100
        ),
      },
    });
  } catch (error) {
    console.error("Get progress error:", error);
    res.status(500).json({
      success: false,
      error: "Server error fetching progress data",
    });
  }
});

// @desc    Get weekly leaderboard
// @route   GET /api/v1/engagement/leaderboard/weekly
// @access  Public
router.get("/leaderboard/weekly", async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const leaderboard = await UserEngagement.getWeeklyLeaderboard(
      parseInt(limit)
    );

    res.json({
      success: true,
      data: leaderboard,
    });
  } catch (error) {
    console.error("Get weekly leaderboard error:", error);
    res.status(500).json({
      success: false,
      error: "Server error fetching leaderboard",
    });
  }
});

// @desc    Get all-time leaderboard
// @route   GET /api/v1/engagement/leaderboard/alltime
// @access  Public
router.get("/leaderboard/alltime", async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const leaderboard = await UserEngagement.find({ totalXP: { $gt: 0 } })
      .populate("user", "name username avatar verified")
      .sort({ totalXP: -1 })
      .limit(parseInt(limit))
      .lean();

    res.json({
      success: true,
      data: leaderboard,
    });
  } catch (error) {
    console.error("Get all-time leaderboard error:", error);
    res.status(500).json({
      success: false,
      error: "Server error fetching leaderboard",
    });
  }
});

// @desc    Add XP for specific action (internal use)
// @route   POST /api/v1/engagement/add-xp
// @access  Private
router.post("/add-xp", authenticate, async (req, res) => {
  try {
    const { type, metadata = {} } = req.body;

    let engagement = await UserEngagement.findOne({ user: req.user.id });

    if (!engagement) {
      engagement = new UserEngagement({ user: req.user.id });
    }

    const updatedEngagement = await engagement.addXP(type, metadata);

    res.json({
      success: true,
      data: updatedEngagement,
      xpGained: updatedEngagement.recentActivities[0]?.xpGained || 0,
    });
  } catch (error) {
    console.error("Add XP error:", error);
    res.status(500).json({
      success: false,
      error: "Server error adding XP",
    });
  }
});

// @desc    Get user badges
// @route   GET /api/v1/engagement/badges
// @access  Private
router.get("/badges", authenticate, async (req, res) => {
  try {
    const engagement = await UserEngagement.findOne({
      user: req.user.id,
    }).select("badges");

    if (!engagement) {
      return res.json({
        success: true,
        data: [],
      });
    }

    res.json({
      success: true,
      data: engagement.badges.sort(
        (a, b) => new Date(b.earnedAt) - new Date(a.earnedAt)
      ),
    });
  } catch (error) {
    console.error("Get badges error:", error);
    res.status(500).json({
      success: false,
      error: "Server error fetching badges",
    });
  }
});

export default router;
