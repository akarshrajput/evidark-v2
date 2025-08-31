import express from 'express';

const router = express.Router();

// @desc    Health check endpoint
// @route   GET /api/v1/health
// @access  Public
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'EviDark Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

export default router;
