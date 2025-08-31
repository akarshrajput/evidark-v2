import express from 'express';
import { body, validationResult } from 'express-validator';
import Comment from '../models/Comment.js';
import Like from '../models/Like.js';
import Story from '../models/Story.js';
import { authenticate, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get comment by ID
// @route   GET /api/v1/comments/:id
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id)
      .populate('author', 'name username avatar verified role')
      .populate('story', 'title slug')
      .populate({
        path: 'replies',
        populate: {
          path: 'author',
          select: 'name username avatar verified role'
        }
      });

    if (!comment || comment.isDeleted) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found'
      });
    }

    // Check if user has liked this comment (if authenticated)
    let isLiked = false;
    if (req.user) {
      const like = await Like.findOne({
        user: req.user.id,
        target: comment._id,
        targetType: 'Comment'
      });
      isLiked = !!like;
    }

    res.json({
      success: true,
      data: {
        ...comment.toObject(),
        isLiked
      }
    });
  } catch (error) {
    console.error('Get comment error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching comment'
    });
  }
});

// @desc    Update comment
// @route   PUT /api/v1/comments/:id
// @access  Private (Author or Admin)
router.put('/:id', authenticate, [
  body('content').trim().isLength({ min: 1, max: 1000 }).withMessage('Comment content is required and must be less than 1000 characters')
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

    const comment = await Comment.findById(req.params.id);

    if (!comment || comment.isDeleted) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found'
      });
    }

    // Check if user is author or admin
    if (comment.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this comment'
      });
    }

    comment.content = req.body.content;
    comment.isEdited = true;
    comment.editedAt = new Date();

    await comment.save();
    await comment.populate('author', 'name username avatar verified role');

    res.json({
      success: true,
      message: 'Comment updated successfully',
      data: comment
    });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error updating comment'
    });
  }
});

// @desc    Delete comment
// @route   DELETE /api/v1/comments/:id
// @access  Private (Author or Admin)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment || comment.isDeleted) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found'
      });
    }

    // Check if user is author or admin
    if (comment.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this comment'
      });
    }

    // Soft delete
    comment.isDeleted = true;
    comment.deletedAt = new Date();
    await comment.save();

    // Update story's comment count
    const story = await Story.findById(comment.story);
    if (story) {
      await story.updateEngagement();
    }

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error deleting comment'
    });
  }
});

// @desc    Like/Unlike comment
// @route   POST /api/v1/comments/:id/like
// @access  Private
router.post('/:id/like', authenticate, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment || comment.isDeleted) {
      return res.status(404).json({
        success: false,
        error: 'Comment not found'
      });
    }

    const existingLike = await Like.findOne({
      user: req.user.id,
      target: comment._id,
      targetType: 'Comment'
    });

    if (existingLike) {
      // Unlike
      await Like.findByIdAndDelete(existingLike._id);
      comment.likesCount = Math.max(0, comment.likesCount - 1);
      await comment.save();
      
      res.json({
        success: true,
        message: 'Comment unliked',
        isLiked: false,
        likesCount: comment.likesCount
      });
    } else {
      // Like
      await Like.create({
        user: req.user.id,
        target: comment._id,
        targetType: 'Comment'
      });
      comment.likesCount += 1;
      await comment.save();
      
      res.json({
        success: true,
        message: 'Comment liked',
        isLiked: true,
        likesCount: comment.likesCount
      });
    }
  } catch (error) {
    console.error('Like comment error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error processing like'
    });
  }
});

export default router;
