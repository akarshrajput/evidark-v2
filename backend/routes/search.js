import express from 'express';
import mongoose from 'mongoose';
import Story from '../models/Story.js';
import User from '../models/User.js';
import Community from '../models/Community.js';
import Event from '../models/Event.js';
import { optionalAuth } from '../middleware/auth.js';
import {
  getCachedSearch,
  setCachedSearch,
  getCachedSuggestions,
  setCachedSuggestions,
  getCachedFilters,
  setCachedFilters
} from '../utils/searchCache.js';

const router = express.Router();

// Helper function for fuzzy text matching
const createFuzzyRegex = (query) => {
  // Split query into words and create flexible regex
  const words = query.trim().split(/\s+/);
  const patterns = words.map(word => {
    // Allow for typos and partial matches
    const chars = word.split('');
    return chars.map((char, i) => {
      if (i === chars.length - 1) return `${char}.*?`;
      return `${char}.*?`;
    }).join('');
  });
  return new RegExp(patterns.join('|'), 'i');
};

// Advanced search with text search and fuzzy matching
const performSearch = async (model, query, searchFields, additionalMatch = {}) => {
  try {
    // First try MongoDB text search if available
    const textSearchResults = await model.find({
      $and: [
        additionalMatch,
        { $text: { $search: query } }
      ]
    }, {
      score: { $meta: "textScore" }
    }).sort({ score: { $meta: "textScore" } }).lean();

    if (textSearchResults.length > 0) {
      return textSearchResults.map(doc => ({
        ...doc,
        relevanceScore: doc.score || 1
      }));
    }
  } catch (error) {
    // Text index might not exist, fall back to regex search
  }

  // Fallback to regex search
  const fuzzyRegex = createFuzzyRegex(query);
  const searchConditions = searchFields.map(field => ({
    [field]: fuzzyRegex
  }));

  const results = await model.find({
    $and: [
      additionalMatch,
      { $or: searchConditions }
    ]
  }).lean();

  // Add simple relevance scoring
  return results.map(doc => {
    let score = 0;
    searchFields.forEach(field => {
      const fieldValue = doc[field];
      if (fieldValue) {
        const fieldStr = Array.isArray(fieldValue) ? fieldValue.join(' ') : String(fieldValue);
        if (fieldStr.toLowerCase().includes(query.toLowerCase())) {
          score += field === 'title' || field === 'name' ? 10 : 5;
        } else if (fuzzyRegex.test(fieldStr)) {
          score += field === 'title' || field === 'name' ? 3 : 1;
        }
      }
    });
    return {
      ...doc,
      relevanceScore: score
    };
  }).sort((a, b) => b.relevanceScore - a.relevanceScore);
};

// GET /api/v1/search - Universal search endpoint
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { 
      q: query, 
      type = 'all', 
      category,
      tags,
      author,
      dateFrom,
      dateTo,
      dateRange,
      sortBy = 'relevance',
      limit = 20,
      page = 1 
    } = req.query;

    if (!query || query.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
    }

    // Check cache first
    const filters = { type, category, tags, author, dateRange, sortBy };
    const cachedResult = getCachedSearch(query, filters, page);
    if (cachedResult) {
      return res.json(cachedResult);
    }

    const skip = (page - 1) * limit;
    const results = {
      stories: [],
      users: [],
      communities: [],
      events: [],
      total: 0,
      query: query.trim(),
      filters: { type, category, tags, author, dateRange, sortBy }
    };

    // Search across different content types
    const searchPromises = [];
    
    if (type === 'all' || type === 'stories') {
      const storyMatch = { status: 'published' };
      if (category) storyMatch.category = category;
      if (tags) storyMatch.tags = { $in: tags.split(',') };
      if (author) {
        const authorUser = await User.findOne({ 
          $or: [
            { username: new RegExp(author, 'i') },
            { name: new RegExp(author, 'i') }
          ]
        });
        if (authorUser) storyMatch.author = authorUser._id;
      }
      if (dateFrom || dateTo) {
        storyMatch.createdAt = {};
        if (dateFrom) storyMatch.createdAt.$gte = new Date(dateFrom);
        if (dateTo) storyMatch.createdAt.$lte = new Date(dateTo);
      }
      
      searchPromises.push(
        performSearch(Story, query, ['title', 'description', 'content', 'tags'], storyMatch)
          .then(results => results.map(story => ({ ...story, type: 'story' })))
      );
    }

    if (type === 'all' || type === 'users') {
      searchPromises.push(
        performSearch(User, query, ['name', 'username', 'bio'])
          .then(results => results.map(user => ({ ...user, type: 'user' })))
      );
    }

    if (type === 'all' || type === 'communities') {
      searchPromises.push(
        performSearch(Community, query, ['name', 'description', 'tags'])
          .then(results => results.map(community => ({ ...community, type: 'community' })))
      );
    }

    if (type === 'all' || type === 'events') {
      const eventMatch = { status: 'active' };
      if (dateFrom || dateTo) {
        eventMatch.startDate = {};
        if (dateFrom) eventMatch.startDate.$gte = new Date(dateFrom);
        if (dateTo) eventMatch.startDate.$lte = new Date(dateTo);
      }
      
      searchPromises.push(
        performSearch(Event, query, ['title', 'description', 'tags'], eventMatch)
          .then(results => results.map(event => ({ ...event, type: 'event' })))
      );
    }

    // Execute all searches in parallel
    const searchResults = await Promise.all(searchPromises);
    
    // Combine and sort results
    let allResults = searchResults.flat();
    
    // Sort by relevance or date
    if (sortBy === 'date') {
      allResults.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else {
      allResults.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
    }

    // Separate results by type
    results.stories = allResults.filter(item => item.type === 'story');
    results.users = allResults.filter(item => item.type === 'user');
    results.communities = allResults.filter(item => item.type === 'community');
    results.events = allResults.filter(item => item.type === 'event');

    // Remove sensitive data from users
    results.users = results.users.map(user => ({
      ...user,
      password: undefined,
      resetPasswordToken: undefined,
      resetPasswordExpire: undefined,
      emailVerificationToken: undefined,
      emailVerificationExpire: undefined
    }));

    // Populate story authors if we have stories
    if (results.stories.length > 0) {
      const storyIds = results.stories.map(story => story._id);
      const populatedStories = await Story.find({ _id: { $in: storyIds } })
        .populate('author', 'name username profilePicture')
        .lean();
      
      results.stories = populatedStories.map(story => ({
        ...story,
        type: 'story',
        relevanceScore: results.stories.find(s => s._id.toString() === story._id.toString())?.relevanceScore || 0
      }));
    }

    // Apply pagination
    const totalResults = allResults.length;
    results.total = totalResults;
    
    if (type === 'all') {
      // For 'all' type, paginate across all results
      const paginatedResults = allResults.slice(skip, skip + parseInt(limit));
      results.stories = paginatedResults.filter(item => item.type === 'story');
      results.users = paginatedResults.filter(item => item.type === 'user');
      results.communities = paginatedResults.filter(item => item.type === 'community');
      results.events = paginatedResults.filter(item => item.type === 'event');
    } else {
      // For specific types, paginate within that type
      if (type === 'stories') results.stories = results.stories.slice(skip, skip + parseInt(limit));
      if (type === 'users') results.users = results.users.slice(skip, skip + parseInt(limit));
      if (type === 'communities') results.communities = results.communities.slice(skip, skip + parseInt(limit));
      if (type === 'events') results.events = results.events.slice(skip, skip + parseInt(limit));
    }

    // Cache the results
    setCachedSearch(query, filters, page, results);

    res.json({
      success: true,
      data: results,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalResults,
        pages: Math.ceil(totalResults / limit)
      }
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while searching',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/v1/search/suggestions - Search suggestions/autocomplete
router.get('/suggestions', optionalAuth, async (req, res) => {
  try {
    const { q: query, limit = 10 } = req.query;

    if (!query || query.trim().length < 2) {
      return res.json({
        success: true,
        data: {
          suggestions: [],
          recent: req.user ? await getRecentSearches(req.user._id) : []
        }
      });
    }

    // Check cache first
    const cachedSuggestions = getCachedSuggestions(query);
    if (cachedSuggestions) {
      return res.json(cachedSuggestions);
    }

    const suggestions = await Promise.all([
      // Story titles with slug and id for direct navigation
      Story.find({
        title: new RegExp(query, 'i'),
        status: 'published'
      })
      .select('title slug _id')
      .limit(3)
      .lean(),

      // User names with username and id for direct navigation
      User.find({
        $or: [
          { name: new RegExp(query, 'i') },
          { username: new RegExp(query, 'i') }
        ]
      })
      .select('name username _id')
      .limit(3)
      .lean(),

      // Community names with slug and id for direct navigation
      Community.find({
        name: new RegExp(query, 'i'),
        status: 'active'
      })
      .select('name slug _id')
      .limit(2)
      .lean(),

      // Events with id for direct navigation
      Event.find({
        title: new RegExp(query, 'i'),
        status: 'active'
      })
      .select('title _id')
      .limit(2)
      .lean(),

      // Popular tags
      Story.aggregate([
        { $match: { tags: new RegExp(query, 'i'), status: 'published' } },
        { $unwind: '$tags' },
        { $match: { tags: new RegExp(query, 'i') } },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 2 }
      ])
    ]);

    const [stories, users, communities, events, tags] = suggestions;

    const formattedSuggestions = [
      ...stories.map(s => ({ 
        type: 'story', 
        text: s.title, 
        value: s.title,
        id: s._id,
        slug: s.slug
      })),
      ...users.map(u => ({ 
        type: 'user', 
        text: u.name, 
        value: u.username || u.name,
        id: u._id,
        username: u.username
      })),
      ...communities.map(c => ({ 
        type: 'community', 
        text: c.name, 
        value: c.name,
        id: c._id,
        slug: c.slug
      })),
      ...events.map(e => ({ 
        type: 'event', 
        text: e.title, 
        value: e.title,
        id: e._id
      })),
      ...tags.map(t => ({ 
        type: 'tag', 
        text: `#${t._id}`, 
        value: t._id 
      }))
    ].slice(0, limit);

    const response = {
      success: true,
      data: {
        suggestions: formattedSuggestions,
        recent: req.user ? await getRecentSearches(req.user._id) : []
      }
    };

    // Cache suggestions for 10 minutes
    setCachedSuggestions(query, response, 600);

    res.json(response);

  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get suggestions'
    });
  }
});

// GET /api/v1/search/filters - Get available filter options
router.get('/filters', async (req, res) => {
  try {
    // Check cache first
    const cachedFilters = getCachedFilters();
    if (cachedFilters) {
      return res.json(cachedFilters);
    }

    const [categories, tags, authors] = await Promise.all([
      // Get unique categories
      Story.distinct('category', { status: 'published' }),
      
      // Get popular tags
      Story.aggregate([
        { $match: { status: 'published' } },
        { $unwind: '$tags' },
        { $group: { _id: '$tags', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 20 }
      ]),
      
      // Get popular authors
      Story.aggregate([
        { $match: { status: 'published' } },
        { $group: { _id: '$author', storyCount: { $sum: 1 } } },
        { $sort: { storyCount: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'authorInfo'
          }
        },
        { $unwind: '$authorInfo' },
        {
          $project: {
            name: '$authorInfo.name',
            username: '$authorInfo.username',
            storyCount: 1
          }
        }
      ])
    ]);

    const response = {
      success: true,
      data: {
        categories: categories.map(cat => ({
          value: cat,
          label: cat.charAt(0).toUpperCase() + cat.slice(1)
        })),
        tags: tags.map(tag => ({
          value: tag._id,
          label: tag._id,
          count: tag.count
        })),
        authors: authors.map(author => ({
          value: author.username || author.name,
          label: author.name,
          storyCount: author.storyCount
        })),
        dateRanges: [
          { value: 'today', label: 'Today' },
          { value: 'week', label: 'This Week' },
          { value: 'month', label: 'This Month' },
          { value: 'year', label: 'This Year' }
        ],
        sortOptions: [
          { value: 'relevance', label: 'Most Relevant' },
          { value: 'newest', label: 'Newest First' },
          { value: 'oldest', label: 'Oldest First' },
          { value: 'popular', label: 'Most Popular' }
        ]
      }
    };

    // Cache filters for 30 minutes
    setCachedFilters(response, 1800);

    res.json(response);

  } catch (error) {
    console.error('Filters error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get filter options'
    });
  }
});

// Helper function to get recent searches (implement based on your needs)
async function getRecentSearches(userId) {
  // This would typically come from a search history collection
  // For now, return empty array
  return [];
}

export default router;
