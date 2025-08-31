import express from 'express';
import { body, validationResult, query } from 'express-validator';
import User from '../models/User.js';
import Story from '../models/Story.js';
import { authenticate, optionalAuth, authorize } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get all users (with search and pagination)
// @route   GET /api/v1/users
// @access  Public
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().trim().isLength({ min: 1 }).withMessage('Search term cannot be empty')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';

    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('name username avatar bio role verified stats createdAt')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching users'
    });
  }
});

// @desc    Search users (for chat functionality)
// @route   GET /api/v1/users/search
// @access  Private
router.get('/search', authenticate, [
  query('q').trim().isLength({ min: 1 }).withMessage('Search query is required'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { q } = req.query;
    const limit = parseInt(req.query.limit) || 10;

    const users = await User.find({
      $and: [
        { _id: { $ne: req.user.id } }, // Exclude current user
        {
          $or: [
            { name: { $regex: q, $options: 'i' } },
            { username: { $regex: q, $options: 'i' } },
            { email: { $regex: q, $options: 'i' } }
          ]
        }
      ]
    })
    .select('name username email avatar role verified isOnline')
    .limit(limit);

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error searching users'
    });
  }
});

// @desc    Get user by ID
// @route   GET /api/v1/users/:id
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('followers', 'name username avatar verified')
      .populate('following', 'name username avatar verified');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if current user is following this user
    let isFollowing = false;
    if (req.user) {
      isFollowing = user.followers.some(follower => 
        follower._id.toString() === req.user.id
      );
    }

    // Get user's published stories
    const stories = await Story.find({ 
      author: user._id, 
      status: 'published' 
    })
    .select('title slug description category readingTime views likesCount createdAt')
    .sort({ createdAt: -1 })
    .limit(10);

    res.json({
      success: true,
      data: {
        ...user.toObject(),
        isFollowing,
        stories
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching user'
    });
  }
});

// @desc    Get user by username
// @route   GET /api/v1/users/username/:username
// @access  Public
router.get('/username/:username', optionalAuth, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('-password')
      .populate('followers', 'name username avatar verified')
      .populate('following', 'name username avatar verified');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if current user is following this user
    let isFollowing = false;
    if (req.user) {
      console.log('Checking follow status for user:', req.user.id);
      console.log('Target user followers:', user.followers.map(f => f._id.toString()));
      
      // Check both ways to ensure accuracy
      const isInFollowers = user.followers.some(follower => 
        follower._id.toString() === req.user.id.toString()
      );
      
      // Also check current user's following list as backup
      const currentUserDoc = await User.findById(req.user.id).select('following');
      const isInFollowing = currentUserDoc.following.some(followingId => 
        followingId.toString() === user._id.toString()
      );
      
      // Both should match, but prioritize the followers list
      isFollowing = isInFollowers;
      
      console.log('Is in followers:', isInFollowers);
      console.log('Is in following:', isInFollowing);
      console.log('Final isFollowing result:', isFollowing);
      
      // Log warning if they don't match (indicates data inconsistency)
      if (isInFollowers !== isInFollowing) {
        console.warn('Follow status mismatch detected! Followers:', isInFollowers, 'Following:', isInFollowing);
      }
    }

    // Get user's published stories
    const stories = await Story.find({ 
      author: user._id, 
      status: 'published' 
    })
    .select('title slug description category readingTime views likesCount createdAt')
    .sort({ createdAt: -1 })
    .limit(10);

    res.json({
      success: true,
      data: {
        ...user.toObject(),
        isFollowing,
        stories
      }
    });
  } catch (error) {
    console.error('Get user by username error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching user'
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/v1/users/:id
// @access  Private (Own profile or Admin)
router.put('/:id', authenticate, [
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  body('username').optional().trim().isLength({ min: 3, max: 20 }).withMessage('Username must be between 3 and 20 characters'),
  body('bio').optional().trim().isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters'),
  body('avatar').optional().isURL().withMessage('Avatar must be a valid URL'),
  body('role').optional().isIn(['reader', 'author', 'admin', 'guide']).withMessage('Invalid role')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    // Check if user can update this profile
    if (req.params.id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this profile'
      });
    }

    const { name, username, bio, avatar, socialLinks, preferences, role } = req.body;

    // Check if username is taken by another user
    if (username) {
      const existingUser = await User.findOne({ 
        username, 
        _id: { $ne: req.params.id } 
      });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'Username is already taken'
        });
      }
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (username) updateData.username = username;
    if (bio !== undefined) updateData.bio = bio;
    if (avatar) updateData.avatar = avatar;
    if (socialLinks) updateData.socialLinks = socialLinks;
    if (preferences) updateData.preferences = preferences;
    
    // Only admins can change roles
    if (role && req.user.role === 'admin') {
      updateData.role = role;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error updating user'
    });
  }
});

// @desc    Get follow status
// @route   GET /api/v1/users/:id/follow-status
// @access  Private
router.get('/:id/follow-status', authenticate, async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({
        success: false,
        error: 'Cannot check follow status for yourself'
      });
    }

    const userToCheck = await User.findById(req.params.id);
    if (!userToCheck) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const currentUser = await User.findById(req.user.id);
    const isFollowing = currentUser.following.includes(userToCheck._id);

    res.json({
      success: true,
      data: {
        isFollowing,
        followersCount: userToCheck.followers.length,
        followingCount: userToCheck.following.length
      }
    });
  } catch (error) {
    console.error('Get follow status error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error checking follow status'
    });
  }
});

// @desc    Follow/Unfollow user
// @route   POST /api/v1/users/:id/follow
// @access  Private
router.post('/:id/follow', authenticate, async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({
        success: false,
        error: 'You cannot follow yourself'
      });
    }

    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const isFollowing = currentUser.following.includes(userToFollow._id);

    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter(
        id => id.toString() !== userToFollow._id.toString()
      );
      userToFollow.followers = userToFollow.followers.filter(
        id => id.toString() !== currentUser._id.toString()
      );

      await Promise.all([currentUser.save(), userToFollow.save()]);

      res.json({
        success: true,
        message: 'User unfollowed successfully',
        isFollowing: false,
        followersCount: userToFollow.followers.length
      });
    } else {
      // Follow
      currentUser.following.push(userToFollow._id);
      userToFollow.followers.push(currentUser._id);

      await Promise.all([currentUser.save(), userToFollow.save()]);

      res.json({
        success: true,
        message: 'User followed successfully',
        isFollowing: true,
        followersCount: userToFollow.followers.length
      });
    }
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error processing follow request'
    });
  }
});

// @desc    Delete user (Admin only)
// @route   DELETE /api/v1/users/:id
// @access  Private (Admin)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Don't allow deleting own account through this endpoint
    if (req.params.id === req.user.id) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete your own account through this endpoint'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error deleting user'
    });
  }
});

// @desc    Get user stats
// @route   GET /api/v1/users/:id/stats
// @access  Public
router.get('/:id/stats', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Update user stats
    await user.updateStats();

    res.json({
      success: true,
      data: {
        stats: user.stats,
        xp: user.xp,
        level: user.level,
        creatorScore: user.creatorScore,
        badges: user.badges
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching user stats'
    });
  }
});

// @desc    Get user followers
// @route   GET /api/v1/users/:id/followers
// @access  Public
router.get('/:id/followers', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('followers', 'name username photo role isOnline')
      .select('followers');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user.followers
    });
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching followers'
    });
  }
});

// @desc    Get user following
// @route   GET /api/v1/users/:id/following
// @access  Public
router.get('/:id/following', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('following', 'name username photo role isOnline')
      .select('following');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user.following
    });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching following'
    });
  }
});

// @desc    Get trending users
// @route   GET /api/v1/users/trending
// @access  Public
router.get('/trending', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const users = await User.find()
      .select('name username avatar bio role verified createdAt')
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Get trending users error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching trending users'
    });
  }
});

export default router;
