"use client";

import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { toast } from "sonner";

const TagInput = ({ tags, onTagsChange, maxTags = 15, placeholder = "Add tags..." }) => {
  const [inputValue, setInputValue] = useState("");
  const [isInputFocused, setIsInputFocused] = useState(false);
  const inputRef = useRef(null);

  const addTag = (tagText) => {
    const trimmedTag = tagText.trim().toLowerCase();
    
    if (!trimmedTag) return;
    
    if (trimmedTag.length > 30) {
      toast.error("Tag must be 30 characters or less");
      return;
    }
    
    if (tags.length >= maxTags) {
      toast.error(`Maximum ${maxTags} tags allowed`);
      return;
    }
    
    if (tags.includes(trimmedTag)) {
      toast.error("Tag already exists");
      return;
    }
    
    // Validate tag format (alphanumeric, hyphens, underscores only)
    if (!/^[a-z0-9-_\s]+$/.test(trimmedTag)) {
      toast.error("Tags can only contain letters, numbers, hyphens, and underscores");
      return;
    }
    
    onTagsChange([...tags, trimmedTag]);
    setInputValue("");
  };

  const removeTag = (tagToRemove) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    // Prevent adding commas or other special characters
    if (value.includes(",")) {
      addTag(value.replace(",", ""));
      return;
    }
    setInputValue(value);
  };

  return (
    <div className="space-y-3">
      <div 
        className={`flex flex-wrap gap-2 p-3 border rounded-lg bg-background/50 transition-colors ${
          isInputFocused ? "border-primary" : "border-border"
        }`}
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="flex items-center gap-1 px-2 py-1 bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20 transition-colors"
          >
            <span>{tag}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeTag(tag);
              }}
              className="hover:text-red-300 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
        
        <div className="flex-1 min-w-[120px]">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsInputFocused(true)}
            onBlur={() => setIsInputFocused(false)}
            placeholder={tags.length === 0 ? placeholder : ""}
            className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
            disabled={tags.length >= maxTags}
          />
        </div>
        
        {inputValue && (
          <button
            type="button"
            onClick={() => addTag(inputValue)}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-primary/10 text-primary rounded hover:bg-primary/20 transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add
          </button>
        )}
      </div>
      
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Press Enter or comma to add tags</span>
        <span>{tags.length}/{maxTags} tags</span>
      </div>
    </div>
  );
};

export default TagInput;
