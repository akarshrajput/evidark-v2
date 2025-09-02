import express from 'express';
import { body, param, validationResult } from 'express-validator';
import CommunityPost from '../models/CommunityPost.js';
import CommunityComment from '../models/CommunityComment.js';
import Community from '../models/Community.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// @desc    Like/Unlike community post
// @route   POST /api/v1/community-posts/:id/like
// @access  Private
router.post('/:id/like', authenticate, [
  param('id').isMongoId().withMessage('Invalid post ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const post = await CommunityPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    // Check if user is member of the community
    const community = await Community.findById(post.community);
    if (!community.isMember(req.user.id)) {
      return res.status(403).json({
        success: false,
        error: 'You must be a member to interact with posts'
      });
    }

    const wasLiked = post.isLikedBy(req.user.id);
    await post.addLike(req.user.id);

    res.json({
      success: true,
      isLiked: !wasLiked,
      likesCount: post.engagement.likes.length,
      message: wasLiked ? 'Post unliked' : 'Post liked'
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error liking post'
    });
  }
});

// @desc    Add comment to community post
// @route   POST /api/v1/community-posts/:id/comments
// @access  Private
router.post('/:id/comments', authenticate, [
  param('id').isMongoId().withMessage('Invalid post ID'),
  body('content').trim().isLength({ min: 1, max: 2000 }).withMessage('Comment must be 1-2000 characters'),
  body('parentComment').optional().isMongoId().withMessage('Invalid parent comment ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const post = await CommunityPost.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    // Check if user is member of the community
    const community = await Community.findById(post.community);
    if (!community.isMember(req.user.id)) {
      return res.status(403).json({
        success: false,
        error: 'You must be a member to comment'
      });
    }

    const commentData = {
      content: req.body.content,
      author: req.user.id,
      post: req.params.id,
      parentComment: req.body.parentComment || null
    };

    const comment = await CommunityComment.create(commentData);
    await comment.populate('author', 'name username avatar verified');

    // Add comment to post's comments array
    post.engagement.comments.push(comment._id);
    await post.save();

    // If it's a reply, add to parent comment's replies
    if (req.body.parentComment) {
      const parentComment = await CommunityComment.findById(req.body.parentComment);
      if (parentComment) {
        await parentComment.addReply(comment._id);
      }
    }

    res.status(201).json({
      success: true,
      data: comment,
      message: 'Comment added successfully'
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error adding comment'
    });
  }
});

// @desc    Get comments for a community post
// @route   GET /api/v1/community-posts/:id/comments
// @access  Public
router.get('/:id/comments', [
  param('id').isMongoId().withMessage('Invalid post ID')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const comments = await CommunityComment.find({ 
      post: req.params.id, 
      parentComment: null 
    })
    .populate('author', 'name username avatar verified')
    .populate({
      path: 'replies',
      populate: {
        path: 'author',
        select: 'name username avatar verified'
      }
    })
    .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: comments
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching comments'
    });
  }
});

export default router;
