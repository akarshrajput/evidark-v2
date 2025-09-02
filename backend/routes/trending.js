import express from 'express';
import { query, validationResult } from 'express-validator';
import Story from '../models/Story.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Community from '../models/Community.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// @desc    Debug trending data
// @route   GET /api/v1/trending/debug
// @access  Public
router.get('/debug', async (req, res) => {
  try {
    const storyCount = await Story.countDocuments({ status: 'published' });
    const userCount = await User.countDocuments({ role: { $ne: 'admin' } });
    const recentStories = await Story.find({ status: 'published' })
      .select('title views likesCount commentsCount bookmarksCount upvotes downvotes createdAt')
      .sort({ createdAt: -1 })
      .limit(5);
    
    res.json({
      totalPublishedStories: storyCount,
      totalUsers: userCount,
      recentStories,
      message: 'Debug info for trending data'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @desc    Get trending stories
// @route   GET /api/v1/trending/stories
// @access  Public
router.get('/stories', optionalAuth, [
  query('period').optional().isIn(['day', 'week', 'month', 'all']).withMessage('Invalid time period'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const period = req.query.period || 'week';
    const limit = parseInt(req.query.limit) || 20;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;
    
    // Calculate date range
    let dateFilter = {};
    const now = new Date();
    
    switch (period) {
      case 'day':
        dateFilter = { createdAt: { $gte: new Date(now - 24 * 60 * 60 * 1000) } };
        break;
      case 'week':
        dateFilter = { createdAt: { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) } };
        break;
      case 'month':
        dateFilter = { createdAt: { $gte: new Date(now - 30 * 24 * 60 * 60 * 1000) } };
        break;
      default:
        dateFilter = {};
    }

    // Aggregate trending stories based on engagement metrics
    const trendingStories = await Story.aggregate([
      {
        $match: {
          status: 'published',
          ...dateFilter
        }
      },
      {
        $addFields: {
          trendingScore: {
            $add: [
              { $multiply: [{ $ifNull: ['$views', 0] }, 1] },
              { $multiply: [{ $ifNull: ['$likesCount', 0] }, 3] },
              { $multiply: [{ $ifNull: ['$commentsCount', 0] }, 5] },
              { $multiply: [{ $ifNull: ['$bookmarksCount', 0] }, 2] },
              { $multiply: [{ $ifNull: ['$upvotes', 0] }, 4] },
              { $multiply: [{ $subtract: [{ $ifNull: ['$upvotes', 0] }, { $ifNull: ['$downvotes', 0] }] }, 2] },
              // Add base score for all published stories
              10
            ]
          }
        }
      },
      {
        $sort: { trendingScore: -1, createdAt: -1 }
      },
      {
        $skip: skip
      },
      {
        $limit: limit
      },
      {
        $lookup: {
          from: 'users',
          localField: 'author',
          foreignField: '_id',
          as: 'author',
          pipeline: [
            {
              $project: {
                name: 1,
                username: 1,
                avatar: 1,
                verified: 1,
                role: 1
              }
            }
          ]
        }
      },
      {
        $unwind: '$author'
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'category'
        }
      },
      {
        $unwind: { path: '$category', preserveNullAndEmptyArrays: true }
      }
    ]);

    // Add like/bookmark status for authenticated users
    let storiesWithStatus = trendingStories;
    if (req.user) {
      const storyIds = trendingStories.map(story => story._id);
      const [likes, bookmarks] = await Promise.all([
        Story.aggregate([
          { $match: { _id: { $in: storyIds } } },
          {
            $lookup: {
              from: 'likes',
              let: { storyId: '$_id' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ['$target', '$$storyId'] },
                        { $eq: ['$user', req.user._id] },
                        { $eq: ['$targetType', 'Story'] }
                      ]
                    }
                  }
                }
              ],
              as: 'userLike'
            }
          },
          {
            $project: {
              _id: 1,
              isLiked: { $gt: [{ $size: '$userLike' }, 0] }
            }
          }
        ]),
        Story.aggregate([
          { $match: { _id: { $in: storyIds } } },
          {
            $lookup: {
              from: 'bookmarks',
              let: { storyId: '$_id' },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: ['$story', '$$storyId'] },
                        { $eq: ['$user', req.user._id] }
                      ]
                    }
                  }
                }
              ],
              as: 'userBookmark'
            }
          },
          {
            $project: {
              _id: 1,
              isBookmarked: { $gt: [{ $size: '$userBookmark' }, 0] }
            }
          }
        ])
      ]);

      const likeMap = new Map(likes.map(item => [item._id.toString(), item.isLiked]));
      const bookmarkMap = new Map(bookmarks.map(item => [item._id.toString(), item.isBookmarked]));

      storiesWithStatus = trendingStories.map(story => ({
        ...story,
        isLiked: likeMap.get(story._id.toString()) || false,
        isBookmarked: bookmarkMap.get(story._id.toString()) || false
      }));
    }

    res.json(storiesWithStatus);
  } catch (error) {
    console.error('Get trending stories error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching trending stories'
    });
  }
});

// @desc    Get trending authors
// @route   GET /api/v1/trending/authors
// @access  Public
router.get('/authors', optionalAuth, [
  query('period').optional().isIn(['day', 'week', 'month', 'all']).withMessage('Invalid time period'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const period = req.query.period || 'week';
    const limit = parseInt(req.query.limit) || 15;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;
    
    // Calculate date range
    let dateFilter = {};
    const now = new Date();
    
    switch (period) {
      case 'day':
        dateFilter = { createdAt: { $gte: new Date(now - 24 * 60 * 60 * 1000) } };
        break;
      case 'week':
        dateFilter = { createdAt: { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) } };
        break;
      case 'month':
        dateFilter = { createdAt: { $gte: new Date(now - 30 * 24 * 60 * 60 * 1000) } };
        break;
      default:
        dateFilter = {};
    }

    // Aggregate trending authors based on story performance and followers
    const trendingAuthors = await User.aggregate([
      {
        $match: {
          role: { $ne: 'admin' } // Exclude admin users
        }
      },
      {
        $lookup: {
          from: 'stories',
          let: { userId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$author', '$$userId'] },
                status: 'published',
                ...dateFilter
              }
            },
            {
              $group: {
                _id: null,
                totalViews: { $sum: '$views' },
                totalLikes: { $sum: '$likesCount' },
                totalComments: { $sum: '$commentsCount' },
                totalBookmarks: { $sum: '$bookmarksCount' },
                storyCount: { $sum: 1 }
              }
            }
          ],
          as: 'storyStats'
        }
      },
      {
        $unwind: { path: '$storyStats', preserveNullAndEmptyArrays: true }
      },
      {
        $addFields: {
          followerCount: { $size: { $ifNull: ['$followers', []] } },
          trendingScore: {
            $add: [
              { $multiply: [{ $ifNull: ['$storyStats.totalViews', 0] }, 1] },
              { $multiply: [{ $ifNull: ['$storyStats.totalLikes', 0] }, 3] },
              { $multiply: [{ $ifNull: ['$storyStats.totalComments', 0] }, 5] },
              { $multiply: [{ $ifNull: ['$storyStats.totalBookmarks', 0] }, 2] },
              { $multiply: [{ $size: { $ifNull: ['$followers', []] } }, 2] },
              { $multiply: [{ $ifNull: ['$storyStats.storyCount', 0] }, 10] }
            ]
          }
        }
      },
      {
        $match: {
          trendingScore: { $gt: 0 }
        }
      },
      {
        $sort: { trendingScore: -1, followerCount: -1 }
      },
      {
        $skip: skip
      },
      {
        $limit: limit
      },
      {
        $project: {
          name: 1,
          username: 1,
          email: 1,
          avatar: 1,
          verified: 1,
          bio: 1,
          followerCount: 1,
          followingCount: { $size: { $ifNull: ['$following', []] } },
          storyCount: { $ifNull: ['$storyStats.storyCount', 0] },
          totalViews: { $ifNull: ['$storyStats.totalViews', 0] },
          totalLikes: { $ifNull: ['$storyStats.totalLikes', 0] },
          totalComments: { $ifNull: ['$storyStats.totalComments', 0] },
          trendingScore: 1,
          createdAt: 1
        }
      }
    ]);

    // Add follow status for authenticated users
    let authorsWithStatus = trendingAuthors;
    if (req.user) {
      const currentUser = await User.findById(req.user.id).select('following');
      const followingSet = new Set(currentUser.following.map(id => id.toString()));
      
      authorsWithStatus = trendingAuthors.map(author => ({
        ...author,
        isFollowing: followingSet.has(author._id.toString())
      }));
    }

    res.json(authorsWithStatus);
  } catch (error) {
    console.error('Get trending authors error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching trending authors'
    });
  }
});

// @desc    Get trending categories
// @route   GET /api/v1/trending/categories
// @access  Public
router.get('/categories', [
  query('period').optional().isIn(['day', 'week', 'month', 'all']).withMessage('Invalid time period'),
  query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const period = req.query.period || 'week';
    const limit = parseInt(req.query.limit) || 10;
    
    // Calculate date range
    let dateFilter = {};
    const now = new Date();
    
    switch (period) {
      case 'day':
        dateFilter = { createdAt: { $gte: new Date(now - 24 * 60 * 60 * 1000) } };
        break;
      case 'week':
        dateFilter = { createdAt: { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) } };
        break;
      case 'month':
        dateFilter = { createdAt: { $gte: new Date(now - 30 * 24 * 60 * 60 * 1000) } };
        break;
      default:
        dateFilter = {};
    }

    // Aggregate trending categories based on story activity
    const trendingCategories = await Category.aggregate([
      {
        $match: {
          isActive: true
        }
      },
      {
        $lookup: {
          from: 'stories',
          let: { categoryId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$category', '$$categoryId'] },
                status: 'published',
                ...dateFilter
              }
            },
            {
              $group: {
                _id: null,
                storyCount: { $sum: 1 },
                totalViews: { $sum: '$views' },
                totalLikes: { $sum: '$likesCount' },
                totalComments: { $sum: '$commentsCount' },
                totalBookmarks: { $sum: '$bookmarksCount' }
              }
            }
          ],
          as: 'stats'
        }
      },
      {
        $unwind: { path: '$stats', preserveNullAndEmptyArrays: true }
      },
      {
        $addFields: {
          storyCount: { $ifNull: ['$stats.storyCount', 0] },
          totalViews: { $ifNull: ['$stats.totalViews', 0] },
          totalLikes: { $ifNull: ['$stats.totalLikes', 0] },
          totalComments: { $ifNull: ['$stats.totalComments', 0] },
          totalBookmarks: { $ifNull: ['$stats.totalBookmarks', 0] },
          trendingScore: {
            $add: [
              { $multiply: [{ $ifNull: ['$stats.storyCount', 0] }, 10] },
              { $multiply: [{ $ifNull: ['$stats.totalViews', 0] }, 1] },
              { $multiply: [{ $ifNull: ['$stats.totalLikes', 0] }, 3] },
              { $multiply: [{ $ifNull: ['$stats.totalComments', 0] }, 5] }
            ]
          }
        }
      },
      {
        $match: {
          storyCount: { $gt: 0 }
        }
      },
      {
        $sort: { trendingScore: -1, storyCount: -1 }
      },
      {
        $limit: limit
      },
      {
        $project: {
          name: 1,
          description: 1,
          color: 1,
          icon: 1,
          storyCount: 1,
          totalViews: 1,
          totalLikes: 1,
          totalComments: 1,
          totalBookmarks: 1,
          trendingScore: 1
        }
      }
    ]);

    res.json({
      success: true,
      data: trendingCategories,
      period,
      total: trendingCategories.length
    });
  } catch (error) {
    console.error('Get trending categories error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching trending categories'
    });
  }
});

// @desc    Get trending communities
// @route   GET /api/v1/trending/communities
// @access  Public
router.get('/communities', optionalAuth, [
  query('period').optional().isIn(['day', 'week', 'month', 'all']).withMessage('Invalid time period'),
  query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const period = req.query.period || 'week';
    const limit = parseInt(req.query.limit) || 10;
    
    // Calculate date range
    let dateFilter = {};
    const now = new Date();
    
    switch (period) {
      case 'day':
        dateFilter = { createdAt: { $gte: new Date(now - 24 * 60 * 60 * 1000) } };
        break;
      case 'week':
        dateFilter = { createdAt: { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) } };
        break;
      case 'month':
        dateFilter = { createdAt: { $gte: new Date(now - 30 * 24 * 60 * 60 * 1000) } };
        break;
      default:
        dateFilter = {};
    }

    // Aggregate trending communities based on activity and growth
    const trendingCommunities = await Community.aggregate([
      {
        $match: {
          status: 'active'
        }
      },
      {
        $lookup: {
          from: 'communityposts',
          let: { communityId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$community', '$$communityId'] },
                status: { $in: ['active', 'pinned'] },
                ...dateFilter
              }
            },
            {
              $group: {
                _id: null,
                postCount: { $sum: 1 },
                totalLikes: { $sum: { $size: { $ifNull: ['$engagement.likes', []] } } },
                totalComments: { $sum: { $size: { $ifNull: ['$engagement.comments', []] } } }
              }
            }
          ],
          as: 'activityStats'
        }
      },
      {
        $unwind: { path: '$activityStats', preserveNullAndEmptyArrays: true }
      },
      {
        $addFields: {
          memberCount: { $size: { $ifNull: ['$members', []] } },
          recentPosts: { $ifNull: ['$activityStats.postCount', 0] },
          recentLikes: { $ifNull: ['$activityStats.totalLikes', 0] },
          recentComments: { $ifNull: ['$activityStats.totalComments', 0] },
          trendingScore: {
            $add: [
              { $multiply: [{ $size: { $ifNull: ['$members', []] } }, 2] },
              { $multiply: [{ $ifNull: ['$activityStats.postCount', 0] }, 10] },
              { $multiply: [{ $ifNull: ['$activityStats.totalLikes', 0] }, 3] },
              { $multiply: [{ $ifNull: ['$activityStats.totalComments', 0] }, 5] },
              { $multiply: [{ $ifNull: ['$stats.postCount', 0] }, 1] }
            ]
          }
        }
      },
      {
        $match: {
          trendingScore: { $gt: 0 }
        }
      },
      {
        $sort: { trendingScore: -1, memberCount: -1 }
      },
      {
        $limit: limit
      },
      {
        $lookup: {
          from: 'users',
          localField: 'creator',
          foreignField: '_id',
          as: 'creator',
          pipeline: [
            {
              $project: {
                name: 1,
                username: 1,
                avatar: 1,
                verified: 1
              }
            }
          ]
        }
      },
      {
        $unwind: '$creator'
      },
      {
        $project: {
          name: 1,
          description: 1,
          type: 1,
          creator: 1,
          memberCount: 1,
          recentPosts: 1,
          recentLikes: 1,
          recentComments: 1,
          trendingScore: 1,
          featured: 1,
          tags: 1,
          createdAt: 1
        }
      }
    ]);

    // Add membership status for authenticated users
    let communitiesWithStatus = trendingCommunities;
    if (req.user) {
      communitiesWithStatus = trendingCommunities.map(community => ({
        ...community,
        isMember: community.members ? community.members.some(member => 
          member.user.toString() === req.user.id
        ) : false
      }));
    }

    res.json({
      success: true,
      data: communitiesWithStatus,
      period,
      total: communitiesWithStatus.length
    });
  } catch (error) {
    console.error('Get trending communities error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching trending communities'
    });
  }
});

// @desc    Get trending overview (combined data)
// @route   GET /api/v1/trending/overview
// @access  Public
router.get('/overview', optionalAuth, [
  query('period').optional().isIn(['day', 'week', 'month', 'all']).withMessage('Invalid time period')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const period = req.query.period || 'week';
    
    // Get limited data from each trending endpoint
    const [stories, authors, categories, communities] = await Promise.all([
      // Get top 5 trending stories
      fetch(`${req.protocol}://${req.get('host')}/api/v1/trending/stories?period=${period}&limit=5`).then(r => r.json()),
      // Get top 5 trending authors
      fetch(`${req.protocol}://${req.get('host')}/api/v1/trending/authors?period=${period}&limit=5`).then(r => r.json()),
      // Get top 5 trending categories
      fetch(`${req.protocol}://${req.get('host')}/api/v1/trending/categories?period=${period}&limit=5`).then(r => r.json()),
      // Get top 5 trending communities
      fetch(`${req.protocol}://${req.get('host')}/api/v1/trending/communities?period=${period}&limit=5`).then(r => r.json())
    ]);

    res.json({
      success: true,
      data: {
        stories: stories.data || [],
        authors: authors.data || [],
        categories: categories.data || [],
        communities: communities.data || []
      },
      period
    });
  } catch (error) {
    console.error('Get trending overview error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching trending overview'
    });
  }
});

export default router;
