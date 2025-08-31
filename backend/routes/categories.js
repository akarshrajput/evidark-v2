import express from 'express';
import { body, validationResult } from 'express-validator';
import Category from '../models/Category.js';
import Story from '../models/Story.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

// @desc    Get all categories
// @route   GET /api/v1/categories
// @access  Public
router.get('/', async (req, res) => {
  try {
    // For admin users, show all categories including inactive ones
    const isAdmin = req.user && req.user.role === 'admin';
    const filter = isAdmin ? {} : { isActive: true };
    
    const categories = await Category.find(filter)
      .sort({ order: 1, name: 1 });

    // Update stories count for each category
    for (let category of categories) {
      await category.updateStoriesCount();
    }

    res.json({
      success: true,
      categories: categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching categories'
    });
  }
});

// @desc    Get single category
// @route   GET /api/v1/categories/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    // Update stories count
    await category.updateStoriesCount();

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching category'
    });
  }
});

// @desc    Create category
// @route   POST /api/v1/categories
// @access  Private (Admin only)
router.post('/', authenticate, authorize('admin'), [
  body('name').trim().isLength({ min: 1, max: 50 }).withMessage('Category name is required and must be less than 50 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
  body('color').optional().matches(/^#[0-9A-F]{6}$/i).withMessage('Color must be a valid hex color'),
  body('order').optional().isInt({ min: 0 }).withMessage('Order must be a non-negative integer')
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

    const categoryData = {
      ...req.body,
      name: req.body.name.toLowerCase()
    };

    const category = await Category.create(categoryData);

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category: category
    });
  } catch (error) {
    console.error('Create category error:', error);
    
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        error: 'Category with this name already exists'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error creating category'
    });
  }
});

// @desc    Update category
// @route   PUT /api/v1/categories/:id
// @access  Private (Admin only)
router.put('/:id', authenticate, authorize('admin'), [
  body('name').optional().trim().isLength({ min: 1, max: 50 }).withMessage('Category name must be less than 50 characters'),
  body('description').optional().trim().isLength({ max: 500 }).withMessage('Description must be less than 500 characters'),
  body('color').optional().matches(/^#[0-9A-F]{6}$/i).withMessage('Color must be a valid hex color'),
  body('order').optional().isInt({ min: 0 }).withMessage('Order must be a non-negative integer')
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

    const updateData = { ...req.body };
    if (updateData.name) {
      updateData.name = updateData.name.toLowerCase();
    }

    const category = await Category.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    res.json({
      success: true,
      message: 'Category updated successfully',
      category: category
    });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error updating category'
    });
  }
});

// @desc    Delete category
// @route   DELETE /api/v1/categories/:id
// @access  Private (Admin only)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    // Check if category has stories
    const storiesCount = await Story.countDocuments({ 
      category: category.name, 
      status: 'published' 
    });

    if (storiesCount > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete category with ${storiesCount} published stories`
      });
    }

    await Category.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error deleting category'
    });
  }
});

// @desc    Get trending categories
// @route   GET /api/v1/categories/trending
// @access  Public
router.get('/trending', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;

    // Get categories with most stories in the last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const trendingCategories = await Story.aggregate([
      {
        $match: {
          status: 'published',
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: '$category',
          storiesCount: { $sum: 1 },
          totalViews: { $sum: '$views' },
          totalLikes: { $sum: '$likesCount' }
        }
      },
      {
        $addFields: {
          trendingScore: {
            $add: [
              { $multiply: ['$storiesCount', 10] },
              { $multiply: ['$totalViews', 0.1] },
              { $multiply: ['$totalLikes', 2] }
            ]
          }
        }
      },
      { $sort: { trendingScore: -1 } },
      { $limit: limit }
    ]);

    // Get full category details
    const categoryNames = trendingCategories.map(cat => cat._id);
    const categories = await Category.find({ 
      name: { $in: categoryNames },
      isActive: true 
    });

    // Merge trending data with category details
    const result = categories.map(category => {
      const trendingData = trendingCategories.find(t => t._id === category.name);
      return {
        ...category.toObject(),
        trendingData: trendingData || { storiesCount: 0, totalViews: 0, totalLikes: 0 }
      };
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Get trending categories error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error fetching trending categories'
    });
  }
});

export default router;
