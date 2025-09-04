"use client";

import { useState, useEffect } from "react";
import { Search, X, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SearchBar from "./SearchBar";
import SearchFilters from "./SearchFilters";
import { cn } from "@/lib/utils";

const MobileSearch = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    category: '',
    tags: '',
    author: '',
    dateRange: '',
    sortBy: 'relevance'
  });

  // Close search when clicking outside
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsOpen(false);
    setShowFilters(false);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  if (!isOpen) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className={cn(
          "md:hidden text-muted-foreground hover:text-foreground",
          className
        )}
      >
        <Search className="w-5 h-5" />
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm md:hidden">
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center gap-4 p-4 border-b border-border/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </Button>
          <h2 className="text-lg font-semibold text-foreground">Search</h2>
          <div className="flex-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Filter className="w-5 h-5" />
          </Button>
        </div>

        {/* Search Bar */}
        <div className="p-4">
          <SearchBar
            className="w-full"
            placeholder="Search stories, users, communities..."
            onSearch={handleClose}
          />
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="flex-1 overflow-y-auto p-4">
            <SearchFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              isOpen={true}
              onToggle={() => setShowFilters(false)}
            />
          </div>
        )}

        {/* Quick Actions */}
        {!showFilters && (
          <div className="flex-1 p-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">
                  Quick Search
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Horror Stories", query: "horror", type: "stories" },
                    { label: "Mystery Tales", query: "mystery", type: "stories" },
                    { label: "Dark Communities", query: "dark", type: "communities" },
                    { label: "Active Events", query: "", type: "events" }
                  ].map((item) => (
                    <Button
                      key={item.label}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Navigate to search with predefined filters
                        window.location.href = `/search?q=${item.query}&type=${item.type}`;
                      }}
                      className="justify-start text-left h-auto py-3 px-4 border-border/50 bg-background/50"
                    >
                      <div>
                        <div className="font-medium text-sm">{item.label}</div>
                        <div className="text-xs text-muted-foreground capitalize">
                          {item.type}
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-foreground mb-3">
                  Popular Categories
                </h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    "horror", "thriller", "mystery", "supernatural", 
                    "psychological", "gothic", "dark", "haunted"
                  ].map((category) => (
                    <Button
                      key={category}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        window.location.href = `/search?q=${category}&type=stories&category=${category}`;
                      }}
                      className="text-xs border-border/50 bg-background/50 hover:border-red-500/50"
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileSearch;
