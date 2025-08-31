"use client";

import React, { useState } from "react";
import { Search as SearchIcon, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    author: "",
    tags: []
  });

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery, "with filters:", filters);
  };

  return (
    <form onSubmit={handleSearch} className="flex items-center gap-2">
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          type="text"
          placeholder="Search dark stories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 w-64 bg-input border-border focus:border-primary transition-colors"
        />
      </div>
      
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="border-border hover:border-primary">
            <Filter className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 bg-card border-border">
          <div className="space-y-4">
            <h4 className="font-medium text-sm text-foreground">Search Filters</h4>
            
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Category</label>
              <select 
                className="w-full p-2 bg-input border border-border rounded-md text-sm"
                value={filters.category}
                onChange={(e) => setFilters({...filters, category: e.target.value})}
              >
                <option value="">All Categories</option>
                <option value="horror">Horror</option>
                <option value="thriller">Thriller</option>
                <option value="supernatural">Supernatural</option>
                <option value="psychological">Psychological</option>
                <option value="gothic">Gothic</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs text-muted-foreground">Popular Tags</label>
              <div className="flex flex-wrap gap-1">
                {["ghost", "murder", "haunted", "mystery", "dark", "suspense"].map((tag) => (
                  <Badge 
                    key={tag}
                    variant="outline" 
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground text-xs"
                    onClick={() => {
                      const newTags = filters.tags.includes(tag) 
                        ? filters.tags.filter(t => t !== tag)
                        : [...filters.tags, tag];
                      setFilters({...filters, tags: newTags});
                    }}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </form>
  );
};

export default Search;
