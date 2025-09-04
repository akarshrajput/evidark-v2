"use client";

import { useState, useEffect } from "react";
import { ChevronDown, Filter, X, Calendar, Tag, User, BookOpen } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const SearchFilters = ({ 
  filters, 
  onFiltersChange, 
  className,
  isOpen = false,
  onToggle 
}) => {
  const [localFilters, setLocalFilters] = useState({
    type: 'all',
    category: '',
    tags: '',
    author: '',
    dateRange: '',
    sortBy: 'relevance',
    ...filters
  });

  // Fetch filter options
  const { data: filterOptions } = useQuery({
    queryKey: ["search-filters"],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/search/filters`
      );
      if (!response.ok) throw new Error("Failed to fetch filter options");
      const result = await response.json();
      return result.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const handleFilterChange = (key, value) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
    onFiltersChange?.(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      type: 'all',
      category: '',
      tags: '',
      author: '',
      dateRange: '',
      sortBy: 'relevance'
    };
    setLocalFilters(clearedFilters);
    onFiltersChange?.(clearedFilters);
  };

  const hasActiveFilters = Object.entries(localFilters).some(([key, value]) => {
    if (key === 'type') return value !== 'all';
    if (key === 'sortBy') return value !== 'relevance';
    return value && value !== '';
  });

  const activeFilterCount = Object.entries(localFilters).filter(([key, value]) => {
    if (key === 'type') return value !== 'all';
    if (key === 'sortBy') return value !== 'relevance';
    return value && value !== '';
  }).length;

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        onClick={onToggle}
        className={cn(
          "border-border/50 bg-background/50 backdrop-blur-sm hover:bg-background/80",
          hasActiveFilters && "border-red-500/50 bg-red-950/20",
          className
        )}
      >
        <Filter className="w-4 h-4 mr-2" />
        Filters
        {activeFilterCount > 0 && (
          <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
            {activeFilterCount}
          </span>
        )}
      </Button>
    );
  }

  return (
    <div className={cn(
      "bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 space-y-6",
      className
    )}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Filter className="w-5 h-5 text-red-400" />
          Search Filters
        </h3>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground hover:text-red-400"
            >
              Clear All
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Content Type Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-400" />
            Content Type
          </label>
          <select
            value={localFilters.type}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="w-full px-3 py-2 bg-background/50 border border-border/50 rounded-lg text-foreground focus:border-red-500/50 focus:ring-red-500/20"
          >
            <option value="all">All Content</option>
            <option value="stories">Stories</option>
            <option value="users">Users</option>
            <option value="communities">Communities</option>
            <option value="events">Events</option>
          </select>
        </div>

        {/* Category Filter */}
        {(localFilters.type === 'all' || localFilters.type === 'stories') && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Tag className="w-4 h-4 text-purple-400" />
              Category
            </label>
            <select
              value={localFilters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-3 py-2 bg-background/50 border border-border/50 rounded-lg text-foreground focus:border-red-500/50 focus:ring-red-500/20"
            >
              <option value="">All Categories</option>
              {filterOptions?.categories?.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Date Range Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4 text-green-400" />
            Date Range
          </label>
          <select
            value={localFilters.dateRange}
            onChange={(e) => handleFilterChange('dateRange', e.target.value)}
            className="w-full px-3 py-2 bg-background/50 border border-border/50 rounded-lg text-foreground focus:border-red-500/50 focus:ring-red-500/20"
          >
            <option value="">All Time</option>
            {filterOptions?.dateRanges?.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>

        {/* Tags Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground flex items-center gap-2">
            <Tag className="w-4 h-4 text-red-400" />
            Tags
          </label>
          <Input
            type="text"
            value={localFilters.tags}
            onChange={(e) => handleFilterChange('tags', e.target.value)}
            placeholder="horror, mystery, thriller..."
            className="bg-background/50 border-border/50 focus:border-red-500/50 focus:ring-red-500/20"
          />
          <div className="text-xs text-muted-foreground">
            Separate multiple tags with commas
          </div>
        </div>

        {/* Author Filter */}
        {(localFilters.type === 'all' || localFilters.type === 'stories') && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground flex items-center gap-2">
              <User className="w-4 h-4 text-orange-400" />
              Author
            </label>
            <Input
              type="text"
              value={localFilters.author}
              onChange={(e) => handleFilterChange('author', e.target.value)}
              placeholder="Author name or username..."
              className="bg-background/50 border-border/50 focus:border-red-500/50 focus:ring-red-500/20"
            />
          </div>
        )}

        {/* Sort By Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Sort By
          </label>
          <select
            value={localFilters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="w-full px-3 py-2 bg-background/50 border border-border/50 rounded-lg text-foreground focus:border-red-500/50 focus:ring-red-500/20"
          >
            {filterOptions?.sortOptions?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Popular Tags */}
      {filterOptions?.tags && (
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">
            Popular Tags
          </label>
          <div className="flex flex-wrap gap-2">
            {filterOptions.tags.slice(0, 10).map((tag) => (
              <button
                key={tag.value}
                onClick={() => {
                  const currentTags = localFilters.tags.split(',').map(t => t.trim()).filter(Boolean);
                  if (!currentTags.includes(tag.value)) {
                    const newTags = [...currentTags, tag.value].join(', ');
                    handleFilterChange('tags', newTags);
                  }
                }}
                className="px-3 py-1 text-xs bg-background/50 border border-border/50 rounded-full hover:border-red-500/50 hover:bg-red-950/20 transition-colors text-foreground"
              >
                #{tag.value}
                <span className="ml-1 text-muted-foreground">
                  ({tag.count})
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilters;
