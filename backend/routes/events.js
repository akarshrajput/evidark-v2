import express from 'express';

const router = express.Router();

// @desc    Get platform events
// @route   GET /api/v1/events
// @access  Public
router.get('/', async (req, res) => {
  try {
    // For now, return mock events data
    // In a real app, this would come from an Events model
    const events = [
      {
        id: 1,
        title: "Dark Tales Writing Contest",
        description: "Submit your most spine-chilling story",
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        type: "contest",
        status: "upcoming"
      },
      {
        id: 2,
        title: "Horror Authors Meetup",
        description: "Connect with fellow dark story writers",
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        type: "meetup",
        status: "upcoming"
      },
      {
        id: 3,
        title: "Midnight Reading Session",
        description: "Join us for a spooky reading session",
        date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
        type: "reading",
        status: "upcoming"
      }
    ];

    res.json({
      success: true,
      data: events
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching events'
    });
  }
});

export default router;
