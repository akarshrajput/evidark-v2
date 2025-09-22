import express from "express";
import { body, validationResult, query } from "express-validator";
import Story from "../models/Story.js";
import User from "../models/User.js";
import Comment from "../models/Comment.js";
import Like from "../models/Like.js";
import Bookmark from "../models/Bookmark.js";
import { authenticate, optionalAuth, authorize } from "../middleware/auth.js";
import {
  createLikeNotification,
  createCommentNotification,
} from "../utils/notificationHelper.js";
import { APIFeatures } from "../utils/apiFeatures.js";
import {
  trackStoryCreation,
  trackStoryCompletion,
  trackCommentPosted,
} from "../utils/engagementTracker.js";

const router = express.Router();

// @desc    Get all stories with filtering, sorting, pagination
// @route   GET /api/v1/stories
// @access  Public
router.get(
  "/",
  optionalAuth,
  [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage("Limit must be between 1 and 100"),
    query("category")
      .optional()
      .custom(async (value) => {
        const Category = (await import("../models/Category.js")).default;
        const category = await Category.findOne({
          name: value.toLowerCase(),
          isActive: true,
        });
        if (!category) {
          throw new Error("Invalid category");
        }
        return true;
      }),
    query("status")
      .optional()
      .isIn(["published", "archived"])
      .withMessage("Invalid status"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: errors.array(),
        });
      }

      const defaultFields = [
        "title",
        "photo",
        "firstImage",
        "slug",
        "description",
        "status",
        "category",
        "author",
        "tags",
        "readingTime",
        "views",
        "likesCount",
        "commentsCount",
        "bookmarksCount",
        "upvotes",
        "downvotes",
        "createdAt",
        "publishedAt",
        // Removed content field for optimization - use firstImage instead
      ];

      // For public route, only show published stories
      const baseQuery = req.query.status
        ? Story.find()
        : Story.find({ status: "published" });

      const features = new APIFeatures(baseQuery, req.query)
        .filter()
        .sort()
        .limitFields(defaultFields)
        .paginate();

      const stories = await features.query.populate(
        "author",
        "name email username verified avatar"
      );

      // Add like/bookmark status for authenticated users
      let storiesWithStatus = stories;
      if (req.user) {
        const storyIds = stories.map((story) => story._id);
        const [likes, bookmarks] = await Promise.all([
          Like.find({
            user: req.user.id,
            target: { $in: storyIds },
            targetType: "Story",
          }).select("target"),
          Bookmark.find({ user: req.user.id, story: { $in: storyIds } }).select(
            "story"
          ),
        ]);

        const likedStoryIds = new Set(
          likes.map((like) => like.target.toString())
        );
        const bookmarkedStoryIds = new Set(
          bookmarks.map((bookmark) => bookmark.story.toString())
        );

        storiesWithStatus = stories.map((story) => ({
          ...story.toObject(),
          isLiked: likedStoryIds.has(story._id.toString()),
          isBookmarked: bookmarkedStoryIds.has(story._id.toString()),
        }));
      }

      // Count total documents for pagination
      const countQuery = req.query.status
        ? Story.find()
        : Story.find({ status: "published" });
      const total = await Story.countDocuments(
        new APIFeatures(countQuery, req.query).filter().query.getQuery()
      );

      res.json({
        success: true,
        data: storiesWithStatus,
        pagination: {
          page: parseInt(req.query.page) || 1,
          limit: parseInt(req.query.limit) || 100,
          total,
          pages: Math.ceil(total / (parseInt(req.query.limit) || 100)),
        },
      });
    } catch (error) {
      console.error("Get stories error:", error);
      res.status(500).json({
        success: false,
        error: "Server error fetching stories",
      });
    }
  }
);

// @desc    Create new story
// @route   POST /api/v1/stories
// @access  Private
router.post(
  "/",
  authenticate,
  [
    body("title")
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage("Title is required and must be less than 200 characters"),
    body("content")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Content is required"),
    body("category").custom(async (value) => {
      const Category = (await import("../models/Category.js")).default;
      const category = await Category.findOne({
        name: value.toLowerCase(),
        isActive: true,
      });
      if (!category) {
        throw new Error("Invalid category");
      }
      return true;
    }),
    body("description")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Description must be less than 500 characters"),
    body("tags").optional().isArray().withMessage("Tags must be an array"),
    body("status")
      .optional()
      .isIn(["published", "archived"])
      .withMessage("Invalid status"),
    body("ageRating")
      .optional()
      .isIn(["13+", "16+", "18+"])
      .withMessage("Invalid age rating"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: errors.array(),
        });
      }

      const storyData = {
        ...req.body,
        author: req.user.id,
        category: req.body.category.toLowerCase(),
        tags: req.body.tags || [],
        status: req.body.status || "published",
        ageRating: req.body.ageRating || "16+",
      };

      const story = await Story.create(storyData);
      await story.populate("author", "name username avatar verified");

      // Increment user's story count
      await User.findByIdAndUpdate(
        req.user.id,
        { $inc: { "stats.storiesCount": 1 } },
        { new: true }
      );

      // Track engagement for story creation
      await trackStoryCreation(req.user.id, story._id, story.title);

      res.status(201).json({
        success: true,
        message: "Story created successfully",
        data: story,
      });
    } catch (error) {
      console.error("Create story error:", error);

      if (error.name === "ValidationError") {
        const errors = Object.values(error.errors).map((e) => e.message);
        return res.status(400).json({
          success: false,
          error: "Validation failed: " + errors.join(", "),
        });
      }

      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          error: "A story with this title already exists",
        });
      }

      res.status(500).json({
        success: false,
        error: "Server error creating story",
      });
    }
  }
);

// @desc    Get user bookmarks
// @route   GET /api/v1/stories/bookmarks
// @access  Private
router.get("/bookmarks", authenticate, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const bookmarks = await Bookmark.find({ user: req.user.id })
      .populate({
        path: "story",
        match: { status: "published" }, // Only show published stories
        populate: {
          path: "author",
          select: "name username avatar verified",
        },
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Filter out bookmarks where story is null (unpublished/deleted stories)
    const validBookmarks = bookmarks.filter((bookmark) => bookmark.story);

    // Add like/bookmark status for authenticated users
    let storiesWithStatus = validBookmarks.map((bookmark) => ({
      ...bookmark.story.toObject(),
      bookmarkedAt: bookmark.createdAt,
      bookmarkNotes: bookmark.notes,
      bookmarkTags: bookmark.tags,
      isBookmarked: true, // Always true for bookmarks page
    }));

    if (storiesWithStatus.length > 0) {
      const storyIds = storiesWithStatus.map((story) => story._id);
      const likes = await Like.find({
        user: req.user.id,
        target: { $in: storyIds },
        targetType: "Story",
      }).select("target");
      const likedStoryIds = new Set(
        likes.map((like) => like.target.toString())
      );

      storiesWithStatus = storiesWithStatus.map((story) => ({
        ...story,
        isLiked: likedStoryIds.has(story._id.toString()),
      }));
    }

    const total = await Bookmark.countDocuments({
      user: req.user.id,
      story: { $exists: true },
    });

    res.json({
      success: true,
      data: storiesWithStatus,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Get bookmarks error:", error);
    res.status(500).json({
      success: false,
      error: "Server error fetching bookmarks",
    });
  }
});

// @desc    Get stories from followed users
// @route   GET /api/v1/stories/following
// @access  Private
router.get("/following", authenticate, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    // Get current user with following list
    const currentUser = await User.findById(req.user.id).select("following");

    if (
      !currentUser ||
      !currentUser.following ||
      currentUser.following.length === 0
    ) {
      return res.json({
        success: true,
        data: [],
        message: "You're not following anyone yet",
        pagination: {
          page,
          limit,
          total: 0,
          pages: 0,
        },
      });
    }

    // Find stories from followed users (only published stories)
    const stories = await Story.find({
      author: { $in: currentUser.following },
      status: "published",
    })
      .select(
        "title photo firstImage slug description category author tags readingTime views likesCount commentsCount bookmarksCount upvotes downvotes createdAt publishedAt"
      )
      .populate("author", "name username avatar verified")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // Add like/bookmark status for authenticated users
    let storiesWithStatus = stories;
    if (stories.length > 0) {
      const storyIds = stories.map((story) => story._id);
      const [likes, bookmarks] = await Promise.all([
        Like.find({
          user: req.user.id,
          target: { $in: storyIds },
          targetType: "Story",
        }).select("target"),
        Bookmark.find({ user: req.user.id, story: { $in: storyIds } }).select(
          "story"
        ),
      ]);

      const likedStoryIds = new Set(
        likes.map((like) => like.target.toString())
      );
      const bookmarkedStoryIds = new Set(
        bookmarks.map((bookmark) => bookmark.story.toString())
      );

      storiesWithStatus = stories.map((story) => ({
        ...story.toObject(),
        isLiked: likedStoryIds.has(story._id.toString()),
        isBookmarked: bookmarkedStoryIds.has(story._id.toString()),
      }));
    }

    const total = await Story.countDocuments({
      author: { $in: currentUser.following },
      status: "published",
    });

    res.json({
      success: true,
      data: storiesWithStatus,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get following stories error:", error);
    res.status(500).json({
      success: false,
      error: "Server error fetching following stories",
    });
  }
});

// @desc    Get single story by ID
// @route   GET /api/v1/stories/:id
// @access  Public
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id).populate(
      "author",
      "name username avatar verified bio role stats"
    );

    if (!story) {
      return res.status(404).json({
        success: false,
        error: "Story not found",
      });
    }

    // Only show published stories for public access
    if (story.status !== "published") {
      return res.status(404).json({
        success: false,
        error: "Story not found",
      });
    }

    // Views are now tracked separately via the /view endpoint
    // No automatic view increment on GET requests

    // Check if user has liked/bookmarked (if authenticated)
    let isLiked = false;
    let isBookmarked = false;

    if (req.user) {
      const [like, bookmark] = await Promise.all([
        Like.findOne({
          user: req.user.id,
          target: story._id,
          targetType: "Story",
        }),
        Bookmark.findOne({ user: req.user.id, story: story._id }),
      ]);

      isLiked = !!like;
      isBookmarked = !!bookmark;
    }

    // Return different data based on authentication status
    const responseData = {
      ...story.toObject(),
      isLiked,
      isBookmarked,
      isAuthenticated: !!req.user,
    };

    // If user is not authenticated, hide the full content
    if (!req.user) {
      delete responseData.content;
      responseData.contentPreview =
        story.description || story.content?.substring(0, 200) + "...";
      responseData.requiresAuth = true;
    } else {
      // User is authenticated, ensure content is included
      responseData.content = story.content;
      responseData.requiresAuth = false;
    }

    res.json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error("Get story error:", error);
    res.status(500).json({
      success: false,
      error: "Server error fetching story",
    });
  }
});

// @desc    Get story by slug
// @route   GET /api/v1/stories/slug/:slug
// @access  Public
router.get("/slug/:slug", optionalAuth, async (req, res) => {
  try {
    let story = await Story.findOne({ slug: req.params.slug }).populate(
      "author",
      "name username avatar verified bio role stats"
    );

    if (!story) {
      return res.status(404).json({
        success: false,
        error: "Story not found",
      });
    }

    // Only show published stories for public access
    if (story.status !== "published") {
      return res.status(404).json({
        success: false,
        error: "Story not found",
      });
    }

    // Fix legacy data issues before returning
    const storyObj = story.toObject();

    // Fix upvotes/downvotes if they are arrays
    if (Array.isArray(storyObj.upvotes)) {
      storyObj.upvotes = storyObj.upvotes.length || 0;
    }
    if (Array.isArray(storyObj.downvotes)) {
      storyObj.downvotes = storyObj.downvotes.length || 0;
    }

    // Ensure numeric fields are numbers
    storyObj.views = Number(storyObj.views) || 0;
    storyObj.likesCount = Number(storyObj.likesCount) || 0;
    storyObj.commentsCount = Number(storyObj.commentsCount) || 0;
    storyObj.bookmarksCount = Number(storyObj.bookmarksCount) || 0;

    // Views are now tracked separately via the /view endpoint
    // No automatic view increment on GET requests

    // Check if user has liked/bookmarked (if authenticated)
    let isLiked = false;
    let isBookmarked = false;

    if (req.user) {
      const [like, bookmark] = await Promise.all([
        Like.findOne({
          user: req.user.id,
          target: story._id,
          targetType: "Story",
        }),
        Bookmark.findOne({ user: req.user.id, story: story._id }),
      ]);

      isLiked = !!like;
      isBookmarked = !!bookmark;
    }

    // Return different data based on authentication status
    const responseData = {
      ...storyObj,
      isLiked,
      isBookmarked,
      isAuthenticated: !!req.user,
    };

    // If user is not authenticated, hide the full content
    if (!req.user) {
      delete responseData.content;
      responseData.contentPreview =
        story.description || story.content?.substring(0, 200) + "...";
      responseData.requiresAuth = true;
    } else {
      // User is authenticated, ensure content is included
      responseData.content = story.content;
      responseData.requiresAuth = false;
    }

    res.json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error("Get story by slug error:", error);
    res.status(500).json({
      success: false,
      error: "Server error fetching story",
    });
  }
});

// @desc    Update story
// @route   PUT /api/v1/stories/:id
// @access  Private (Author or Admin)
router.put(
  "/:id",
  authenticate,
  [
    body("title")
      .optional()
      .trim()
      .isLength({ min: 1, max: 200 })
      .withMessage("Title must be less than 200 characters"),
    body("content")
      .optional()
      .trim()
      .isLength({ min: 1 })
      .withMessage("Content cannot be empty"),
    body("category")
      .optional()
      .custom(async (value) => {
        const Category = (await import("../models/Category.js")).default;
        const category = await Category.findOne({
          name: value.toLowerCase(),
          isActive: true,
        });
        if (!category) {
          throw new Error("Invalid category");
        }
        return true;
      }),
    body("description")
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage("Description must be less than 500 characters"),
    body("tags").optional().isArray().withMessage("Tags must be an array"),
    body("status")
      .optional()
      .isIn(["published", "archived"])
      .withMessage("Invalid status"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: errors.array(),
        });
      }

      const story = await Story.findById(req.params.id);

      if (!story) {
        return res.status(404).json({
          success: false,
          error: "Story not found",
        });
      }

      // Check if user is author or admin
      if (
        story.author.toString() !== req.user.id &&
        req.user.role !== "admin"
      ) {
        return res.status(403).json({
          success: false,
          error: "Not authorized to update this story",
        });
      }

      const updateData = { ...req.body };
      if (updateData.category) {
        updateData.category = updateData.category.toLowerCase();
      }

      const updatedStory = await Story.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true, runValidators: true }
      ).populate("author", "name username avatar verified");

      res.json({
        success: true,
        message: "Story updated successfully",
        data: updatedStory,
      });
    } catch (error) {
      console.error("Update story error:", error);
      res.status(500).json({
        success: false,
        error: "Server error updating story",
      });
    }
  }
);

// @desc    Delete story
// @route   DELETE /api/v1/stories/:id
// @access  Private (Author or Admin)
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({
        success: false,
        error: "Story not found",
      });
    }

    // Check if user is author or admin
    if (story.author.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "Not authorized to delete this story",
      });
    }

    await Story.findByIdAndDelete(req.params.id);

    // Decrement user's story count
    await User.findByIdAndUpdate(
      story.author,
      { $inc: { "stats.storiesCount": -1 } },
      { new: true }
    );

    res.json({
      success: true,
      message: "Story deleted successfully",
    });
  } catch (error) {
    console.error("Delete story error:", error);
    res.status(500).json({
      success: false,
      error: "Server error deleting story",
    });
  }
});

// @desc    Like/Unlike story
// @route   POST /api/v1/stories/:id/like
// @access  Private
router.post("/:id/like", authenticate, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id).populate(
      "author",
      "name"
    );

    if (!story) {
      return res.status(404).json({
        success: false,
        error: "Story not found",
      });
    }

    const existingLike = await Like.findOne({
      user: req.user.id,
      target: story._id,
      targetType: "Story",
    });

    if (existingLike) {
      // Unlike - remove like and update stats
      await Like.findByIdAndDelete(existingLike._id);

      // Update story engagement
      await story.updateEngagement();

      // Update user stats - decrease likes given for current user and likes received for story author
      await User.findByIdAndUpdate(req.user.id, {
        $inc: { "stats.likesGiven": -1 },
      });
      if (story.author._id.toString() !== req.user.id) {
        await User.findByIdAndUpdate(story.author._id, {
          $inc: { "stats.likesReceived": -1 },
        });
      }

      res.json({
        success: true,
        message: "Story unliked",
        isLiked: false,
        likesCount: story.likesCount,
      });
    } else {
      // Like - create like and update stats
      await Like.create({
        user: req.user.id,
        target: story._id,
        targetType: "Story",
      });

      // Update story engagement
      await story.updateEngagement();

      // Update user stats - increase likes given for current user and likes received for story author
      await User.findByIdAndUpdate(req.user.id, {
        $inc: { "stats.likesGiven": 1 },
      });
      if (story.author._id.toString() !== req.user.id) {
        await User.findByIdAndUpdate(story.author._id, {
          $inc: { "stats.likesReceived": 1 },
        });

        // Create like notification (only if user is not liking their own story)
        await createLikeNotification(req.user.id, story.author._id, story._id);
      }

      res.json({
        success: true,
        message: "Story liked",
        isLiked: true,
        likesCount: story.likesCount,
      });
    }
  } catch (error) {
    console.error("Like story error:", error);
    res.status(500).json({
      success: false,
      error: "Server error processing like",
    });
  }
});

// @desc    Bookmark/Unbookmark story
// @route   POST /api/v1/stories/:id/bookmark
// @access  Private
router.post("/:id/bookmark", authenticate, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({
        success: false,
        error: "Story not found",
      });
    }

    const existingBookmark = await Bookmark.findOne({
      user: req.user.id,
      story: story._id,
    });

    if (existingBookmark) {
      // Remove bookmark
      await Bookmark.findByIdAndDelete(existingBookmark._id);
      await story.updateEngagement();

      res.json({
        success: true,
        message: "Bookmark removed",
        isBookmarked: false,
        bookmarksCount: story.bookmarksCount,
      });
    } else {
      // Add bookmark
      await Bookmark.create({
        user: req.user.id,
        story: story._id,
        notes: req.body.notes || "",
        tags: req.body.tags || [],
      });
      await story.updateEngagement();

      res.json({
        success: true,
        message: "Story bookmarked",
        isBookmarked: true,
        bookmarksCount: story.bookmarksCount,
      });
    }
  } catch (error) {
    console.error("Bookmark story error:", error);
    res.status(500).json({
      success: false,
      error: "Server error processing bookmark",
    });
  }
});

// @desc    Get trending stories
// @route   GET /api/v1/stories/trending
// @access  Public
router.get("/trending", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const stories = await Story.getTrending(limit);

    await Story.populate(stories, {
      path: "author",
      select: "name username avatar verified",
    });

    res.json({
      success: true,
      data: stories,
    });
  } catch (error) {
    console.error("Get trending stories error:", error);
    res.status(500).json({
      success: false,
      error: "Server error fetching trending stories",
    });
  }
});

// @desc    Get featured stories
// @route   GET /api/v1/stories/featured
// @access  Public
router.get("/featured", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const stories = await Story.getFeatured(limit);

    res.json({
      success: true,
      data: stories,
    });
  } catch (error) {
    console.error("Get featured stories error:", error);
    res.status(500).json({
      success: false,
      error: "Server error fetching featured stories",
    });
  }
});

// @desc    Get stories by category
// @route   GET /api/v1/stories/categories
// @access  Public
router.get("/categories", async (req, res) => {
  try {
    const { category } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    if (!category) {
      return res.status(400).json({
        success: false,
        error: "Category parameter is required",
      });
    }

    const stories = await Story.find({
      category: category.toLowerCase(),
      status: "published",
    })
      .select(
        "title photo firstImage slug description category author tags readingTime views likesCount commentsCount bookmarksCount upvotes downvotes createdAt publishedAt"
      )
      .populate("author", "name username avatar verified")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Story.countDocuments({
      category: category.toLowerCase(),
      status: "published",
    });

    res.json({
      success: true,
      data: stories,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get stories by category error:", error);
    res.status(500).json({
      success: false,
      error: "Server error fetching stories by category",
    });
  }
});

// @desc    Get story comments
// @route   GET /api/v1/stories/:id/comments
// @access  Public
router.get("/:id/comments", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const comments = await Comment.find({
      story: req.params.id,
      parentComment: null,
      isDeleted: false,
    })
      .populate("author", "name username avatar verified role")
      .populate({
        path: "replies",
        populate: [
          {
            path: "author",
            select: "name username avatar verified role",
          },
          {
            path: "replies",
            populate: {
              path: "author",
              select: "name username avatar verified role",
            },
          },
        ],
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Comment.countDocuments({
      story: req.params.id,
      parentComment: null,
      isDeleted: false,
    });

    res.json({
      success: true,
      data: comments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get story comments error:", error);
    res.status(500).json({
      success: false,
      error: "Server error fetching comments",
    });
  }
});

// @desc    Add comment to story
// @route   POST /api/v1/stories/:id/comments
// @access  Private
router.post(
  "/:id/comments",
  authenticate,
  [
    body("content")
      .trim()
      .isLength({ min: 1, max: 1000 })
      .withMessage(
        "Comment content is required and must be less than 1000 characters"
      ),
    body("parentComment")
      .optional()
      .isMongoId()
      .withMessage("Invalid parent comment ID"),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: errors.array(),
        });
      }

      // Use lean() to avoid validation issues when just checking existence
      const storyExists = await Story.findById(req.params.id).lean();

      if (!storyExists) {
        return res.status(404).json({
          success: false,
          error: "Story not found",
        });
      }

      const commentData = {
        content: req.body.content,
        author: req.user.id,
        story: req.params.id, // Use the ID directly instead of story object
        parentComment: req.body.parentComment || null,
      };

      const comment = await Comment.create(commentData);
      await comment.populate("author", "name username avatar verified role");

      // If it's a reply, add to parent comment's replies
      if (req.body.parentComment) {
        const parentComment = await Comment.findById(req.body.parentComment);
        if (parentComment) {
          parentComment.addReply(comment._id);
          await parentComment.save();
        }
      }

      // Update user stats - increase comments received for story author
      const story = await Story.findById(req.params.id);
      if (story && story.author.toString() !== req.user.id) {
        await User.findByIdAndUpdate(story.author, {
          $inc: { "stats.commentsReceived": 1 },
        });

        // Create comment notification (only if user is not commenting on their own story)
        await createCommentNotification(
          req.user.id,
          story.author,
          story._id,
          comment._id
        );
      }

      // Update story engagement
      await story.updateEngagement();

      // Track engagement for comment posting
      await trackCommentPosted(
        req.user.id,
        comment._id,
        story._id,
        story.title
      );

      res.status(201).json({
        success: true,
        message: "Comment added successfully",
        data: comment,
      });
    } catch (error) {
      console.error("Add comment error:", error);
      res.status(500).json({
        success: false,
        error: "Server error adding comment",
      });
    }
  }
);

// @desc    Track story view (authenticated users only, unique per user)
// @route   POST /api/v1/stories/:id/view
// @access  Private
router.post("/:id/view", authenticate, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id).populate("author");

    if (!story) {
      return res.status(404).json({
        success: false,
        error: "Story not found",
      });
    }

    // Don't track views for the author viewing their own story
    if (story.author._id.toString() === req.user.id) {
      return res.json({
        success: true,
        message: "Own story view - not tracked",
        views: story.views,
        isNewView: false,
      });
    }

    // Track unique view - only increments if user hasn't viewed before
    const isNewView = await story.trackView(req.user.id);

    // If it's a new view, also increment the author's profile views
    if (isNewView) {
      console.log("Incrementing profile views for author:", story.author._id);
      const updatedUser = await User.findByIdAndUpdate(
        story.author._id,
        { $inc: { "stats.viewsReceived": 1 } },
        { new: true }
      );
      console.log("Updated user stats:", updatedUser?.stats);
    }

    res.json({
      success: true,
      message: isNewView ? "New view tracked" : "Already viewed",
      views: story.views,
      isNewView,
    });
  } catch (error) {
    console.error("Track view error:", error);
    res.status(500).json({
      success: false,
      error: "Server error tracking view",
    });
  }
});

// @desc    Track story completion (when user finishes reading)
// @route   POST /api/v1/stories/:id/complete
// @access  Private
router.post("/:id/complete", authenticate, async (req, res) => {
  try {
    const story = await Story.findById(req.params.id).populate("author");

    if (!story) {
      return res.status(404).json({
        success: false,
        error: "Story not found",
      });
    }

    // Don't track completion for the author reading their own story
    if (story.author._id.toString() === req.user.id) {
      return res.json({
        success: true,
        message: "Own story completion - not tracked",
        xpGained: 0,
      });
    }

    // Track engagement for story completion
    const engagement = await trackStoryCompletion(
      req.user.id,
      story._id,
      story.title,
      story.readingTime
    );

    res.json({
      success: true,
      message: "Story completion tracked",
      xpGained: engagement?.recentActivities[0]?.xpGained || 0,
      totalXP: engagement?.totalXP || 0,
    });
  } catch (error) {
    console.error("Track completion error:", error);
    res.status(500).json({
      success: false,
      error: "Server error tracking completion",
    });
  }
});

export default router;
