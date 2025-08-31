import express from 'express';
import { body, validationResult, query } from 'express-validator';
import Chat from '../models/Chat.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get user's chats
// @route   GET /api/v1/chats
// @access  Private
router.get('/', authenticate, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('search').optional().isString().trim().withMessage('Search term must be a string')
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

    let query = {
      'participants.user': req.user.id,
      'participants.isActive': true,
      isDeleted: false
    };

    // Add search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'participants.user': { $in: await User.find({ 
          name: { $regex: search, $options: 'i' } 
        }).select('_id') } }
      ];
    }

    const chats = await Chat.find(query)
      .populate({
        path: 'participants.user',
        select: 'name email avatar role isOnline lastSeen'
      })
      .populate({
        path: 'lastMessage',
        populate: {
          path: 'sender',
          select: 'name avatar'
        }
      })
      .sort({ lastActivity: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Get unread counts for each chat
    const chatsWithUnreadCount = await Promise.all(
      chats.map(async (chat) => {
        const unreadCount = await Message.getUnreadCount(chat._id, req.user.id);
        return {
          ...chat.toObject(),
          unreadCount
        };
      })
    );

    const total = await Chat.countDocuments(query);

    res.json({
      success: true,
      chats: chatsWithUnreadCount,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching chats'
    });
  }
});

// @desc    Create new chat
// @route   POST /api/v1/chats
// @access  Private
router.post('/', authenticate, [
  body('type').isIn(['private', 'group']).withMessage('Chat type must be private or group'),
  body('participantIds').isArray({ min: 1 }).withMessage('Participant IDs must be an array with at least one ID'),
  body('name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Chat name must be between 1 and 100 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters')
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

    const { type, participantIds, name, description } = req.body;

    // For private chats, ensure exactly 1 other participant
    if (type === 'private' && participantIds.length !== 1) {
      return res.status(400).json({
        success: false,
        error: 'Private chats must have exactly one other participant'
      });
    }

    // Check if private chat already exists
    if (type === 'private') {
      const existingChat = await Chat.findOne({
        type: 'private',
        'participants.user': { 
          $all: [req.user.id, participantIds[0]] 
        },
        'participants.isActive': true,
        isDeleted: false
      });

      if (existingChat) {
        return res.status(409).json({
          success: false,
          error: 'Private chat already exists',
          chatId: existingChat._id
        });
      }
    }

    // Verify all participants exist and can chat
    const participants = await User.find({
      _id: { $in: participantIds },
      role: { $in: ['user', 'guide', 'admin', 'author', 'reader'] }
    });

    if (participants.length !== participantIds.length) {
      return res.status(400).json({
        success: false,
        error: 'Some participants not found or cannot chat'
      });
    }

    // Create chat participants array
    const chatParticipants = [
      { user: req.user.id, role: 'admin' }, // Creator is admin
      ...participantIds.map(id => ({ user: id, role: 'member' }))
    ];

    // Create the chat
    const chat = new Chat({
      type,
      name: type === 'group' ? name : undefined,
      description,
      participants: chatParticipants,
      createdBy: req.user.id
    });

    await chat.save();
    await chat.populate('participants.user', 'name email avatar role isOnline');

    res.status(201).json({
      success: true,
      message: 'Chat created successfully',
      chat
    });
  } catch (error) {
    console.error('Create chat error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error creating chat'
    });
  }
});

// @desc    Get single chat
// @route   GET /api/v1/chats/:chatId
// @access  Private
router.get('/:chatId', authenticate, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId)
      .populate('participants.user', 'name email avatar role isOnline lastSeen')
      .populate({
        path: 'lastMessage',
        populate: {
          path: 'sender',
          select: 'name avatar'
        }
      });

    if (!chat) {
      return res.status(404).json({
        success: false,
        error: 'Chat not found'
      });
    }

    // Check if user is participant
    if (!chat.isParticipant(req.user.id)) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this chat'
      });
    }

    const unreadCount = await Message.getUnreadCount(chat._id, req.user.id);

    res.json({
      success: true,
      data: {
        ...chat.toObject(),
        unreadCount
      }
    });
  } catch (error) {
    console.error('Get chat error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching chat'
    });
  }
});

// @desc    Update chat
// @route   PUT /api/v1/chats/:chatId
// @access  Private (Admin only)
router.put('/:chatId', authenticate, [
  body('name').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Chat name must be between 1 and 100 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  body('avatar').optional().isURL().withMessage('Avatar must be a valid URL')
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

    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        error: 'Chat not found'
      });
    }

    // Check if user is admin of the chat
    if (!chat.isAdmin(req.user.id)) {
      return res.status(403).json({
        success: false,
        error: 'Only chat admins can update chat details'
      });
    }

    const { name, description, avatar, settings } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (avatar) updateData.avatar = avatar;
    if (settings) updateData.settings = { ...chat.settings, ...settings };

    const updatedChat = await Chat.findByIdAndUpdate(
      req.params.chatId,
      updateData,
      { new: true, runValidators: true }
    ).populate('participants.user', 'name email avatar role isOnline');

    res.json({
      success: true,
      message: 'Chat updated successfully',
      data: updatedChat
    });
  } catch (error) {
    console.error('Update chat error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error updating chat'
    });
  }
});

// @desc    Delete chat
// @route   DELETE /api/v1/chats/:chatId
// @access  Private (Admin only)
router.delete('/:chatId', authenticate, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        error: 'Chat not found'
      });
    }

    // Check if user is admin of the chat
    if (!chat.isAdmin(req.user.id)) {
      return res.status(403).json({
        success: false,
        error: 'Only chat admins can delete chats'
      });
    }

    // Soft delete
    chat.isDeleted = true;
    await chat.save();

    res.json({
      success: true,
      message: 'Chat deleted successfully'
    });
  } catch (error) {
    console.error('Delete chat error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error deleting chat'
    });
  }
});

// @desc    Get chat messages
// @route   GET /api/v1/chats/:chatId/messages
// @access  Private
router.get('/:chatId/messages', authenticate, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
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

    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        error: 'Chat not found'
      });
    }

    // Check if user is participant
    if (!chat.isParticipant(req.user.id)) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this chat'
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;

    const messages = await Message.find({
      chat: req.params.chatId,
      isDeleted: false
    })
    .populate('sender', 'name avatar role')
    .populate('replyTo', 'content sender')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

    // Mark messages as read
    await Message.markAllAsRead(req.params.chatId, req.user.id);

    const total = await Message.countDocuments({
      chat: req.params.chatId,
      isDeleted: false
    });

    res.json({
      success: true,
      data: messages.reverse(), // Reverse to show oldest first
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching messages'
    });
  }
});

// @desc    Send message
// @route   POST /api/v1/chats/:chatId/messages
// @access  Private
router.post('/:chatId/messages', authenticate, [
  body('content').trim().isLength({ min: 1, max: 2000 }).withMessage('Message content is required and must be less than 2000 characters'),
  body('type').optional().isIn(['text', 'image', 'file', 'audio', 'video']).withMessage('Invalid message type'),
  body('replyTo').optional().isMongoId().withMessage('Invalid reply message ID')
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

    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        error: 'Chat not found'
      });
    }

    // Check if user is participant
    if (!chat.isParticipant(req.user.id)) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to send messages in this chat'
      });
    }

    const { content, type = 'text', replyTo, attachments } = req.body;

    const messageData = {
      chat: req.params.chatId,
      sender: req.user.id,
      content: content.trim(),
      type,
      replyTo: replyTo || null,
      attachments: attachments || []
    };

    const message = await Message.create(messageData);
    await message.populate('sender', 'name avatar role');

    // Emit real-time message via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.to(`chat_${req.params.chatId}`).emit('new_message', message);
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error sending message'
    });
  }
});

// @desc    Add participant to chat
// @route   POST /api/v1/chats/:chatId/participants
// @access  Private (Admin only)
router.post('/:chatId/participants', authenticate, [
  body('userId').isMongoId().withMessage('Valid user ID is required'),
  body('role').optional().isIn(['admin', 'member']).withMessage('Invalid role')
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

    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        error: 'Chat not found'
      });
    }

    // Check if user is admin of the chat
    if (!chat.isAdmin(req.user.id)) {
      return res.status(403).json({
        success: false,
        error: 'Only chat admins can add participants'
      });
    }

    // Cannot add participants to private chats
    if (chat.type === 'private') {
      return res.status(400).json({
        success: false,
        error: 'Cannot add participants to private chats'
      });
    }

    const { userId, role = 'member' } = req.body;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Check if user is already a participant
    if (chat.isParticipant(userId)) {
      return res.status(400).json({
        success: false,
        error: 'User is already a participant'
      });
    }

    chat.addParticipant(userId, role);
    await chat.save();
    await chat.populate('participants.user', 'name email avatar role isOnline');

    res.json({
      success: true,
      message: 'Participant added successfully',
      data: chat
    });
  } catch (error) {
    console.error('Add participant error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error adding participant'
    });
  }
});

// @desc    Remove participant from chat
// @route   DELETE /api/v1/chats/:chatId/participants/:userId
// @access  Private (Admin only or self)
router.delete('/:chatId/participants/:userId', authenticate, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
      return res.status(404).json({
        success: false,
        error: 'Chat not found'
      });
    }

    const { userId } = req.params;

    // Users can remove themselves, or admins can remove others
    if (userId !== req.user.id && !chat.isAdmin(req.user.id)) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to remove this participant'
      });
    }

    // Cannot remove participants from private chats
    if (chat.type === 'private') {
      return res.status(400).json({
        success: false,
        error: 'Cannot remove participants from private chats'
      });
    }

    chat.removeParticipant(userId);
    await chat.save();

    res.json({
      success: true,
      message: 'Participant removed successfully'
    });
  } catch (error) {
    console.error('Remove participant error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error removing participant'
    });
  }
});

export default router;
