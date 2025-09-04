import express from 'express';
import Event from '../models/Event.js';
import { authenticate as auth, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get all events
// @route   GET /api/v1/events
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { 
      status = 'all', 
      type, 
      limit = 10, 
      page = 1,
      sort = '-startDate'
    } = req.query;

    // Build query
    let query = {};
    
    if (status !== 'all') {
      query.status = status;
    }
    
    if (type) {
      query.type = type;
    }

    // Only show public events for non-authenticated users
    if (!req.user) {
      query['settings.isPublic'] = true;
    }

    const events = await Event.find(query)
      .populate('createdBy', 'username fullName avatar')
      .populate('participants.user', 'username fullName avatar')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    // Add user participation status if authenticated
    const eventsWithUserStatus = events.map(event => ({
      ...event,
      isParticipant: req.user ? event.participants.some(p => p.user._id.toString() === req.user.id) : false,
      canJoin: req.user && (!event.maxParticipants || event.participants.length < event.maxParticipants)
    }));

    const total = await Event.countDocuments(query);

    res.json({
      success: true,
      data: eventsWithUserStatus,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching events'
    });
  }
});

// @desc    Get single event
// @route   GET /api/v1/events/:id
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('createdBy', 'username fullName avatar bio')
      .populate('participants.user', 'username fullName avatar')
      .populate('submissions.user', 'username fullName avatar')
      .populate('submissions.story', 'title slug')
      .lean();

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    // Check if user can view this event
    if (!event.settings.isPublic && (!req.user || req.user.role !== 'admin')) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    // Add user-specific data
    const eventWithUserData = {
      ...event,
      isParticipant: req.user ? event.participants.some(p => p.user._id.toString() === req.user.id) : false,
      canJoin: req.user && (!event.maxParticipants || event.participants.length < event.maxParticipants),
      userSubmission: req.user ? event.submissions.find(s => s.user._id.toString() === req.user.id) : null
    };

    // Increment view count
    await Event.findByIdAndUpdate(req.params.id, { $inc: { 'stats.views': 1 } });

    res.json({
      success: true,
      data: eventWithUserData
    });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching event'
    });
  }
});

// @desc    Create new event (Admin only)
// @route   POST /api/v1/events
// @access  Private (Admin)
router.post('/', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin privileges required.'
      });
    }

    const eventData = {
      ...req.body,
      createdBy: req.user.id
    };

    const event = await Event.create(eventData);
    
    const populatedEvent = await Event.findById(event._id)
      .populate('createdBy', 'username fullName avatar');

    res.status(201).json({
      success: true,
      data: populatedEvent
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to create event'
    });
  }
});

// @desc    Join event
// @route   POST /api/v1/events/:id/join
// @access  Private
router.post('/:id/join', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    // Check if event is joinable
    if (event.status === 'completed' || event.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        error: 'Cannot join completed or cancelled event'
      });
    }

    // Check if already joined
    if (event.isParticipant(req.user.id)) {
      return res.status(400).json({
        success: false,
        error: 'Already joined this event'
      });
    }

    // Check participant limit
    if (event.maxParticipants && event.participants.length >= event.maxParticipants) {
      return res.status(400).json({
        success: false,
        error: 'Event is full'
      });
    }

    // Add participant
    event.addParticipant(req.user.id);
    await event.save();

    res.json({
      success: true,
      message: 'Successfully joined event',
      data: { participantCount: event.participants.length }
    });
  } catch (error) {
    console.error('Join event error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to join event'
    });
  }
});

// @desc    Leave event
// @route   POST /api/v1/events/:id/leave
// @access  Private
router.post('/:id/leave', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    // Check if user is participant
    if (!event.isParticipant(req.user.id)) {
      return res.status(400).json({
        success: false,
        error: 'Not a participant of this event'
      });
    }

    // Remove participant
    event.removeParticipant(req.user.id);
    await event.save();

    res.json({
      success: true,
      message: 'Successfully left event',
      data: { participantCount: event.participants.length }
    });
  } catch (error) {
    console.error('Leave event error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to leave event'
    });
  }
});

// @desc    Submit to event
// @route   POST /api/v1/events/:id/submit
// @access  Private
router.post('/:id/submit', auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({
        success: false,
        error: 'Event not found'
      });
    }

    // Check if user is participant
    if (!event.isParticipant(req.user.id)) {
      return res.status(400).json({
        success: false,
        error: 'Must be a participant to submit'
      });
    }

    // Check if event accepts submissions
    if (event.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: 'Event is not accepting submissions'
      });
    }

    // Check if user already submitted
    const existingSubmission = event.submissions.find(s => s.user.toString() === req.user.id);
    if (existingSubmission) {
      return res.status(400).json({
        success: false,
        error: 'Already submitted to this event'
      });
    }

    // Add submission
    const submission = {
      user: req.user.id,
      story: req.body.storyId,
      content: req.body.content,
      submittedAt: new Date()
    };

    event.submissions.push(submission);
    event.stats.totalSubmissions = event.submissions.length;
    await event.save();

    res.json({
      success: true,
      message: 'Submission successful',
      data: submission
    });
  } catch (error) {
    console.error('Submit to event error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to submit to event'
    });
  }
});

// @desc    Get user's joined events
// @route   GET /api/v1/events/my/joined
// @access  Private
router.get('/my/joined', auth, async (req, res) => {
  try {
    const events = await Event.find({
      'participants.user': req.user.id
    })
    .populate('createdBy', 'username fullName avatar')
    .sort('-startDate')
    .limit(10)
    .lean();

    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Get user events error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user events'
    });
  }
});

export default router;
