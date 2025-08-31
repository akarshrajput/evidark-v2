import express from 'express';
import User from '../models/User.js';
import Story from '../models/Story.js';
import Category from '../models/Category.js';

const router = express.Router();

// @desc    Get platform stats
// @route   GET /api/v1/stats
// @access  Public
router.get('/', async (req, res) => {
  try {
    const [totalUsers, totalStories, totalCategories, publishedStories] = await Promise.all([
      User.countDocuments(),
      Story.countDocuments(),
      Category.countDocuments(),
      Story.countDocuments({ status: 'published' })
    ]);

    // Get total views and likes from all published stories
    const storyStats = await Story.aggregate([
      { $match: { status: 'published' } },
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$views' },
          totalLikes: { $sum: '$likesCount' }
        }
      }
    ]);

    const stats = {
      users: totalUsers,
      stories: publishedStories,
      categories: totalCategories,
      views: storyStats[0]?.totalViews || 0,
      likes: storyStats[0]?.totalLikes || 0
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching stats'
    });
  }
});

export default router;
