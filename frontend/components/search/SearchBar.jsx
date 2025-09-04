"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  Clock,
  Hash,
  User,
  BookOpen,
  Users,
  Calendar,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const SearchBar = ({
  className,
  placeholder = "Search stories, users, communities...",
  showFilters = false,
  onSearch,
  defaultValue = "",
}) => {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [query, setQuery] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef(null);
  const resultsRef = useRef(null);

  // Debounced search for suggestions
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Fetch search suggestions
  const { data: suggestions, isLoading } = useQuery({
    queryKey: ["search-suggestions", debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery || debouncedQuery.length < 2)
        return { suggestions: [], recent: [] };

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL
        }/api/v1/search/suggestions?q=${encodeURIComponent(debouncedQuery)}`,
        {
          headers: isAuthenticated
            ? {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              }
            : {},
        }
      );

      if (!response.ok) throw new Error("Failed to fetch suggestions");
      const result = await response.json();
      return result.data;
    },
    enabled: debouncedQuery.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleSearch = useCallback(
    (searchQuery = query) => {
      if (!searchQuery.trim()) return;

      if (onSearch) {
        onSearch(searchQuery);
      } else {
        router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      }

      setIsOpen(false);
      setSelectedIndex(-1);
      searchRef.current?.blur();
    },
    [query, onSearch, router]
  );

  const handleKeyDown = (e) => {
    const allSuggestions = [
      ...(suggestions?.suggestions || []),
      ...(suggestions?.recent || []),
    ];

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < allSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > -1 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && allSuggestions[selectedIndex]) {
          handleSuggestionClick(allSuggestions[selectedIndex]);
        } else {
          handleSearch();
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSelectedIndex(-1);
        searchRef.current?.blur();
        break;
    }
  };

  const handleSuggestionClick = (suggestion) => {
    // If suggestion has direct navigation data, navigate directly
    if (suggestion.type && suggestion.id) {
      setIsOpen(false);
      setSelectedIndex(-1);
      searchRef.current?.blur();

      switch (suggestion.type) {
        case "story":
          router.push(`/story/${suggestion.slug || suggestion.id}`);
          break;
        case "user":
          router.push(`/user/${suggestion.username || suggestion.id}`);
          break;
        case "community":
          router.push(`/communities/${suggestion.slug || suggestion.id}`);
          break;
        case "event":
          router.push(`/events/${suggestion.id}`);
          break;
        default:
          // For tags or other types, go to search page
          const searchValue = suggestion.value || suggestion.text;
          setQuery(searchValue);
          handleSearch(searchValue);
      }
    } else {
      // Fallback to search functionality
      const searchValue = suggestion.value || suggestion.text;
      setQuery(searchValue);
      handleSearch(searchValue);
    }
  };

  const getSuggestionIcon = (type) => {
    switch (type) {
      case "story":
        return <BookOpen className="w-4 h-4 text-blue-400" />;
      case "user":
        return <User className="w-4 h-4 text-green-400" />;
      case "community":
        return <Users className="w-4 h-4 text-purple-400" />;
      case "event":
        return <Calendar className="w-4 h-4 text-orange-400" />;
      case "tag":
        return <Hash className="w-4 h-4 text-red-400" />;
      default:
        return <Search className="w-4 h-4 text-gray-400" />;
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const allSuggestions = [
    ...(suggestions?.suggestions || []),
    ...(suggestions?.recent || []),
  ];

  return (
    <div ref={searchRef} className={cn("relative w-full max-w-2xl", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 text-muted-foreground" />
        <Input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-10 pr-10 bg-background/50 backdrop-blur-sm border-border/50 focus:border-red-500/50 focus:ring-red-500/20 text-foreground placeholder:text-muted-foreground"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              setIsOpen(false);
              setSelectedIndex(-1);
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Search Suggestions Dropdown */}
      {isOpen && (query.length >= 2 || suggestions?.recent?.length > 0) && (
        <div
          ref={resultsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-card/95 backdrop-blur-sm border border-border/50 rounded-xl shadow-2xl z-50 max-h-96 overflow-y-auto"
        >
          {isLoading && (
            <div className="p-4 text-center text-muted-foreground">
              <div className="animate-spin w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full mx-auto mb-2"></div>
              Searching...
            </div>
          )}

          {!isLoading && allSuggestions.length === 0 && query.length >= 2 && (
            <div className="p-4 text-center text-muted-foreground">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No suggestions found</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSearch()}
                className="mt-2 text-red-400 hover:text-red-300"
              >
                Search for "{query}"
              </Button>
            </div>
          )}

          {/* Recent Searches */}
          {suggestions?.recent?.length > 0 && query.length < 2 && (
            <div className="p-2">
              <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Recent Searches
              </div>
              {suggestions.recent.map((item, index) => (
                <button
                  key={`recent-${index}`}
                  onClick={() => handleSuggestionClick(item)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-background/50 rounded-lg transition-colors",
                    selectedIndex === index && "bg-background/50"
                  )}
                >
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{item.text}</span>
                </button>
              ))}
            </div>
          )}

          {/* Search Suggestions */}
          {suggestions?.suggestions?.length > 0 && (
            <div className="p-2">
              {query.length >= 2 && (
                <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Suggestions
                </div>
              )}
              {suggestions.suggestions.map((suggestion, index) => {
                const adjustedIndex =
                  (suggestions?.recent?.length || 0) + index;
                return (
                  <button
                    key={`suggestion-${index}`}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-background/50 rounded-lg transition-colors group",
                      selectedIndex === adjustedIndex && "bg-background/50"
                    )}
                  >
                    {getSuggestionIcon(suggestion.type)}
                    <div className="flex-1 min-w-0">
                      <span className="text-foreground">{suggestion.text}</span>
                      <div className="text-xs text-muted-foreground capitalize flex items-center gap-1">
                        {suggestion.type}
                        {suggestion.type !== "tag" && (
                          <span className="text-xs opacity-60">
                            • Click to visit
                          </span>
                        )}
                      </div>
                    </div>
                    {suggestion.type !== "tag" && (
                      <div className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                        ↗
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Search Action */}
          {query.length >= 2 && (
            <div className="border-t border-border/50 p-2">
              <Button
                onClick={() => handleSearch()}
                variant="ghost"
                className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-950/20"
              >
                <Search className="w-4 h-4 mr-2" />
                Search for "{query}"
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
