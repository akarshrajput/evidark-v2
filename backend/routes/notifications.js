import express from 'express';
import { query, param, body, validationResult } from 'express-validator';
import Notification from '../models/Notification.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get user notifications with pagination
// @route   GET /api/v1/notifications
// @access  Private
router.get('/', authenticate, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('unreadOnly').optional().isBoolean().withMessage('UnreadOnly must be a boolean')
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
    const unreadOnly = req.query.unreadOnly === 'true';

    let query = { recipient: req.user.id };
    if (unreadOnly) {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .populate('actor', 'name avatar role')
      .populate('target')
      .populate('lastActors', 'name avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.getUnreadCount(req.user.id);

    res.json({
      success: true,
      data: notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      unreadCount
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching notifications'
    });
  }
});

// @desc    Get unread notifications count
// @route   GET /api/v1/notifications/unread-count
// @access  Private
router.get('/unread-count', authenticate, async (req, res) => {
  try {
    const unreadCount = await Notification.getUnreadCount(req.user.id);
    
    res.json({
      success: true,
      unreadCount
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching unread count'
    });
  }
});

// @desc    Mark notifications as read
// @route   PATCH /api/v1/notifications/mark-read
// @access  Private
router.patch('/mark-read', authenticate, [
  body('notificationIds').optional().isArray().withMessage('Notification IDs must be an array'),
  body('markAll').optional().isBoolean().withMessage('MarkAll must be a boolean')
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

    const { notificationIds, markAll } = req.body;

    if (markAll) {
      // Mark all notifications as read
      await Notification.updateMany(
        { recipient: req.user.id, isRead: false },
        { isRead: true, readAt: new Date() }
      );
    } else if (notificationIds && notificationIds.length > 0) {
      // Mark specific notifications as read
      await Notification.markAsRead(notificationIds, req.user.id);
    } else {
      return res.status(400).json({
        success: false,
        error: 'Either provide notification IDs or set markAll to true'
      });
    }

    const unreadCount = await Notification.getUnreadCount(req.user.id);

    res.json({
      success: true,
      message: 'Notifications marked as read',
      unreadCount
    });
  } catch (error) {
    console.error('Mark notifications read error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error marking notifications as read'
    });
  }
});

// @desc    Delete notification
// @route   DELETE /api/v1/notifications/:id
// @access  Private
router.delete('/:id', authenticate, [
  param('id').isMongoId().withMessage('Invalid notification ID')
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

    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user.id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error deleting notification'
    });
  }
});

// @desc    Clear all read notifications (cleanup)
// @route   DELETE /api/v1/notifications/clear-read
// @access  Private
router.delete('/clear-read', authenticate, async (req, res) => {
  try {
    const result = await Notification.deleteMany({
      recipient: req.user.id,
      isRead: true,
      readAt: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Older than 7 days
    });

    res.json({
      success: true,
      message: `Cleared ${result.deletedCount} old read notifications`
    });
  } catch (error) {
    console.error('Clear read notifications error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error clearing notifications'
    });
  }
});

export default router;
