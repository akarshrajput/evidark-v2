import express from 'express';
import { body, query, param, validationResult } from 'express-validator';
import Community from '../models/Community.js';
import CommunityPost from '../models/CommunityPost.js';
import CommunityComment from '../models/CommunityComment.js';
import User from '../models/User.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';
import { APIFeatures } from '../utils/apiFeatures.js';

const router = express.Router();

// @desc    Get all communities with filtering and pagination
// @route   GET /api/v1/communities
// @access  Public
router.get('/', optionalAuth, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('type').optional().isIn(['circle', 'challenge', 'ritual', 'coven']).withMessage('Invalid community type'),
  query('featured').optional().isBoolean().withMessage('Featured must be boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const features = new APIFeatures(
      Community.find({ status: 'active' })
        .populate('creator', 'name username avatar verified')
        .populate('members.user', 'name username avatar'),
      req.query
    )
      .filter()
      .sort()
      .paginate();

    const communities = await features.query;

    // Add membership status for authenticated users
    let communitiesWithStatus = communities;
    if (req.user) {
      communitiesWithStatus = communities.map(community => ({
        ...community.toObject(),
        isMember: community.isMember(req.user.id),
        userRole: community.getMemberRole(req.user.id)
      }));
    }

    const total = await Community.countDocuments({ status: 'active' });

    res.json({
      success: true,
      data: communitiesWithStatus,
      pagination: {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
        total,
        pages: Math.ceil(total / (parseInt(req.query.limit) || 20))
      }
    });
  } catch (error) {
    console.error('Get communities error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching communities'
    });
  }
});

// @desc    Create new community
// @route   POST /api/v1/communities
// @access  Private
router.post('/', authenticate, [
  body('name').trim().isLength({ min: 3, max: 50 }).withMessage('Name must be 3-50 characters'),
  body('description').trim().isLength({ min: 10, max: 500 }).withMessage('Description must be 10-500 characters'),
  body('type').isIn(['circle', 'challenge', 'ritual', 'coven']).withMessage('Invalid community type'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('isPrivate').optional().isBoolean().withMessage('isPrivate must be boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Check if community name already exists
    const existingCommunity = await Community.findOne({ 
      name: new RegExp(`^${req.body.name}$`, 'i') 
    });
    
    if (existingCommunity) {
      return res.status(400).json({
        success: false,
        error: 'A community with this name already exists'
      });
    }

    const communityData = {
      name: req.body.name,
      description: req.body.description,
      type: req.body.type,
      creator: req.user.id,
      tags: req.body.tags || [],
      settings: {
        isPrivate: req.body.isPrivate || false,
        requireApproval: req.body.requireApproval || false,
        allowInvites: req.body.allowInvites !== false
      }
    };

    const community = await Community.create(communityData);
    
    // Add creator as first member with elder role
    await community.addMember(req.user.id, 'elder');
    
    await community.populate('creator', 'name username avatar verified');

    res.status(201).json({
      success: true,
      data: community,
      message: 'Community created successfully'
    });
  } catch (error) {
    console.error('Create community error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error creating community'
    });
  }
});

// @desc    Get single community
// @route   GET /api/v1/communities/:id
// @access  Public
router.get('/:id', optionalAuth, [
  param('id').isMongoId().withMessage('Invalid community ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const community = await Community.findById(req.params.id)
      .populate('creator', 'name username avatar verified')
      .populate('members.user', 'name username avatar verified');

    if (!community || community.status !== 'active') {
      return res.status(404).json({
        success: false,
        error: 'Community not found'
      });
    }

    let communityData = community.toObject();
    
    if (req.user) {
      communityData.isMember = community.isMember(req.user.id);
      communityData.userRole = community.getMemberRole(req.user.id);
    }

    res.json({
      success: true,
      data: communityData
    });
  } catch (error) {
    console.error('Get community error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching community'
    });
  }
});

// @desc    Join community
// @route   POST /api/v1/communities/:id/join
// @access  Private
router.post('/:id/join', authenticate, [
  param('id').isMongoId().withMessage('Invalid community ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const community = await Community.findById(req.params.id);
    
    if (!community || community.status !== 'active') {
      return res.status(404).json({
        success: false,
        error: 'Community not found'
      });
    }

    if (community.isMember(req.user.id)) {
      return res.status(400).json({
        success: false,
        error: 'You are already a member of this community'
      });
    }

    await community.addMember(req.user.id);

    res.json({
      success: true,
      message: 'Successfully joined the community',
      isMember: true
    });
  } catch (error) {
    console.error('Join community error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error joining community'
    });
  }
});

// @desc    Leave community
// @route   POST /api/v1/communities/:id/leave
// @access  Private
router.post('/:id/leave', authenticate, [
  param('id').isMongoId().withMessage('Invalid community ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const community = await Community.findById(req.params.id);
    
    if (!community) {
      return res.status(404).json({
        success: false,
        error: 'Community not found'
      });
    }

    if (!community.isMember(req.user.id)) {
      return res.status(400).json({
        success: false,
        error: 'You are not a member of this community'
      });
    }

    // Prevent creator from leaving
    if (community.creator.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        error: 'Community creator cannot leave. Transfer ownership first.'
      });
    }

    await community.removeMember(req.user.id);

    res.json({
      success: true,
      message: 'Successfully left the community',
      isMember: false
    });
  } catch (error) {
    console.error('Leave community error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error leaving community'
    });
  }
});

// @desc    Get community posts
// @route   GET /api/v1/communities/:id/posts
// @access  Public
router.get('/:id/posts', optionalAuth, [
  param('id').isMongoId().withMessage('Invalid community ID'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20'),
  query('type').optional().isIn(['discussion', 'challenge', 'ritual', 'story_share', 'question', 'announcement'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const community = await Community.findById(req.params.id);
    if (!community || community.status !== 'active') {
      return res.status(404).json({
        success: false,
        error: 'Community not found'
      });
    }

    const features = new APIFeatures(
      CommunityPost.find({ 
        community: req.params.id, 
        status: { $in: ['active', 'pinned'] }
      })
        .populate('author', 'name username avatar verified')
        .sort({ status: -1, createdAt: -1 }), // Pinned posts first
      req.query
    )
      .filter()
      .paginate();

    const posts = await features.query;

    // Add like status for authenticated users
    let postsWithStatus = posts;
    if (req.user) {
      postsWithStatus = posts.map(post => ({
        ...post.toObject(),
        isLiked: post.isLikedBy(req.user.id)
      }));
    }

    const total = await CommunityPost.countDocuments({ 
      community: req.params.id, 
      status: { $in: ['active', 'pinned'] }
    });

    res.json({
      success: true,
      data: postsWithStatus,
      pagination: {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        total,
        pages: Math.ceil(total / (parseInt(req.query.limit) || 10))
      }
    });
  } catch (error) {
    console.error('Get community posts error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching community posts'
    });
  }
});

// @desc    Create community post
// @route   POST /api/v1/communities/:id/posts
// @access  Private
router.post('/:id/posts', authenticate, [
  param('id').isMongoId().withMessage('Invalid community ID'),
  body('title').trim().isLength({ min: 5, max: 200 }).withMessage('Title must be 5-200 characters'),
  body('content').trim().isLength({ min: 10, max: 10000 }).withMessage('Content must be 10-10000 characters'),
  body('type').isIn(['discussion', 'challenge', 'ritual', 'story_share', 'question']).withMessage('Invalid post type'),
  body('tags').optional().isArray().withMessage('Tags must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const community = await Community.findById(req.params.id);
    if (!community || community.status !== 'active') {
      return res.status(404).json({
        success: false,
        error: 'Community not found'
      });
    }

    // Check if user is a member
    if (!community.isMember(req.user.id)) {
      return res.status(403).json({
        success: false,
        error: 'You must be a member to post in this community'
      });
    }

    const postData = {
      title: req.body.title,
      content: req.body.content,
      type: req.body.type,
      author: req.user.id,
      community: req.params.id,
      tags: req.body.tags || []
    };

    const post = await CommunityPost.create(postData);
    await post.populate('author', 'name username avatar verified');

    // Update community stats
    community.stats.postCount += 1;
    community.activity.lastPostAt = new Date();
    await community.save();

    res.status(201).json({
      success: true,
      data: post,
      message: 'Post created successfully'
    });
  } catch (error) {
    console.error('Create community post error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error creating post'
    });
  }
});

// @desc    Get user's joined communities
// @route   GET /api/v1/communities/my/joined
// @access  Private
router.get('/my/joined', authenticate, async (req, res) => {
  try {
    const communities = await Community.find({
      'members.user': req.user.id,
      status: 'active'
    })
    .populate('creator', 'name username avatar verified')
    .sort('-members.joinedAt')
    .limit(10)
    .lean();

    // Add user role for each community
    const communitiesWithRole = communities.map(community => ({
      ...community,
      userRole: community.members.find(m => m.user.toString() === req.user.id)?.role || 'member'
    }));

    res.json({
      success: true,
      data: communitiesWithRole
    });
  } catch (error) {
    console.error('Get user communities error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching user communities'
    });
  }
});

export default router;
