import NodeCache from 'node-cache';

// Create cache instances with different TTL for different types of data
const searchCache = new NodeCache({
  stdTTL: 300, // 5 minutes default TTL
  checkperiod: 60, // Check for expired keys every 60 seconds
  useClones: false // Better performance, but be careful with object mutations
});

const suggestionCache = new NodeCache({
  stdTTL: 600, // 10 minutes for suggestions
  checkperiod: 120,
  useClones: false
});

const filterCache = new NodeCache({
  stdTTL: 1800, // 30 minutes for filter options (they change less frequently)
  checkperiod: 300,
  useClones: false
});

// Generate cache keys
const generateSearchKey = (query, filters, page = 1) => {
  const filterString = Object.entries(filters)
    .filter(([_, value]) => value && value !== 'all' && value !== 'relevance')
    .sort()
    .map(([key, value]) => `${key}:${value}`)
    .join('|');
  
  return `search:${query.toLowerCase().trim()}:${filterString}:${page}`;
};

const generateSuggestionKey = (query) => {
  return `suggestions:${query.toLowerCase().trim()}`;
};

const generateFilterKey = () => {
  return 'filters:options';
};

// Search cache functions
export const getCachedSearch = (query, filters, page = 1) => {
  const key = generateSearchKey(query, filters, page);
  return searchCache.get(key);
};

export const setCachedSearch = (query, filters, page = 1, data, ttl = null) => {
  const key = generateSearchKey(query, filters, page);
  if (ttl) {
    return searchCache.set(key, data, ttl);
  }
  return searchCache.set(key, data);
};

// Suggestion cache functions
export const getCachedSuggestions = (query) => {
  const key = generateSuggestionKey(query);
  return suggestionCache.get(key);
};

export const setCachedSuggestions = (query, data, ttl = null) => {
  const key = generateSuggestionKey(query);
  if (ttl) {
    return suggestionCache.set(key, data, ttl);
  }
  return suggestionCache.set(key, data);
};

// Filter cache functions
export const getCachedFilters = () => {
  const key = generateFilterKey();
  return filterCache.get(key);
};

export const setCachedFilters = (data, ttl = null) => {
  const key = generateFilterKey();
  if (ttl) {
    return filterCache.set(key, data, ttl);
  }
  return filterCache.set(key, data);
};

// Cache invalidation functions
export const invalidateSearchCache = (pattern = null) => {
  if (pattern) {
    const keys = searchCache.keys().filter(key => key.includes(pattern));
    keys.forEach(key => searchCache.del(key));
    return keys.length;
  } else {
    searchCache.flushAll();
    return 'all';
  }
};

export const invalidateSuggestionCache = () => {
  suggestionCache.flushAll();
};

export const invalidateFilterCache = () => {
  filterCache.flushAll();
};

// Cache statistics
export const getCacheStats = () => {
  return {
    search: {
      keys: searchCache.keys().length,
      hits: searchCache.getStats().hits,
      misses: searchCache.getStats().misses,
      ksize: searchCache.getStats().ksize,
      vsize: searchCache.getStats().vsize
    },
    suggestions: {
      keys: suggestionCache.keys().length,
      hits: suggestionCache.getStats().hits,
      misses: suggestionCache.getStats().misses,
      ksize: suggestionCache.getStats().ksize,
      vsize: suggestionCache.getStats().vsize
    },
    filters: {
      keys: filterCache.keys().length,
      hits: filterCache.getStats().hits,
      misses: filterCache.getStats().misses,
      ksize: filterCache.getStats().ksize,
      vsize: filterCache.getStats().vsize
    }
  };
};

// Warm up cache with popular searches (call this on server start)
export const warmUpCache = async () => {
  try {
    console.log('Warming up search cache...');
    
    // You can add popular search terms here
    const popularSearches = [
      'horror',
      'mystery',
      'thriller',
      'ghost',
      'supernatural',
      'dark',
      'haunted'
    ];

    // Pre-cache popular searches (implement as needed)
    // This is just a placeholder - you'd implement actual search warming
    
    console.log('Search cache warmed up successfully');
  } catch (error) {
    console.error('Error warming up cache:', error);
  }
};

export default {
  getCachedSearch,
  setCachedSearch,
  getCachedSuggestions,
  setCachedSuggestions,
  getCachedFilters,
  setCachedFilters,
  invalidateSearchCache,
  invalidateSuggestionCache,
  invalidateFilterCache,
  getCacheStats,
  warmUpCache
};
