"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import SearchBar from "@/components/search/SearchBar";
import SearchFilters from "@/components/search/SearchFilters";
import SearchResults from "@/components/search/SearchResults";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuth();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [filters, setFilters] = useState({
    type: searchParams.get("type") || "all",
    category: searchParams.get("category") || "",
    tags: searchParams.get("tags") || "",
    author: searchParams.get("author") || "",
    dateRange: searchParams.get("dateRange") || "",
    sortBy: searchParams.get("sortBy") || "relevance",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  // Update local state when URL parameters change
  useEffect(() => {
    const urlQuery = searchParams.get("q") || "";
    const urlFilters = {
      type: searchParams.get("type") || "all",
      category: searchParams.get("category") || "",
      tags: searchParams.get("tags") || "",
      author: searchParams.get("author") || "",
      dateRange: searchParams.get("dateRange") || "",
      sortBy: searchParams.get("sortBy") || "relevance",
    };

    setQuery(urlQuery);
    setFilters(urlFilters);
    setPage(1); // Reset page when search params change
  }, [searchParams]);

  // Update URL when search parameters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== "all" && value !== "relevance") {
        params.set(key, value);
      }
    });

    const newUrl = `/search${params.toString() ? `?${params.toString()}` : ""}`;
    if (newUrl !== window.location.pathname + window.location.search) {
      router.replace(newUrl, { shallow: true });
    }
  }, [query, filters, router]);

  // Search query
  const {
    data: searchResults,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["search", query, filters, page],
    queryFn: async () => {
      if (!query || query.trim().length < 2) {
        return {
          data: {
            total: 0,
            stories: [],
            users: [],
            communities: [],
            events: [],
          },
        };
      }

      const params = new URLSearchParams({
        q: query,
        page: page.toString(),
        limit: "20",
        ...Object.fromEntries(
          Object.entries(filters).filter(
            ([_, value]) => value && value !== "all"
          )
        ),
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/search?${params}`,
        {
          headers: isAuthenticated
            ? {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              }
            : {},
        }
      );

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const result = await response.json();
      return result;
    },
    enabled: query.trim().length >= 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const handleSearch = (newQuery) => {
    setQuery(newQuery);
    setPage(1);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleLoadMore = () => {
    setPage((prev) => prev + 1);
  };

  const hasMore =
    searchResults?.pagination?.page < searchResults?.pagination?.pages;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-red-950/20 to-gray-950">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Search EviDark
            </h1>
            <p className="text-muted-foreground">
              Discover stories, authors, communities, and events in the dark
              realm
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <SearchBar
            defaultValue={query}
            onSearch={handleSearch}
            className="w-full"
            placeholder="Search for stories, users, communities, events..."
          />
        </div>

        {/* Filters and Results Layout */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="sticky top-8">
              <SearchFilters
                filters={filters}
                onFiltersChange={handleFiltersChange}
                isOpen={showFilters}
                onToggle={() => setShowFilters(!showFilters)}
                className={showFilters ? "" : "lg:block"}
              />
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 min-w-0">
            {error && (
              <div className="bg-red-950/20 border border-red-500/50 rounded-xl p-6 mb-6">
                <h3 className="text-red-200 font-semibold mb-2">
                  Search Error
                </h3>
                <p className="text-red-300/80 mb-4">
                  There was an error performing your search. Please try again.
                </p>
                <Button
                  onClick={() => refetch()}
                  variant="outline"
                  size="sm"
                  className="border-red-500/50 text-red-200 hover:bg-red-950/30"
                >
                  Try Again
                </Button>
              </div>
            )}

            {query.trim().length < 2 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-6 bg-background/50 rounded-full flex items-center justify-center">
                  <SearchIcon className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Start Your Search
                </h3>
                <p className="text-muted-foreground mb-6">
                  Enter at least 2 characters to begin searching
                </p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>You can search for:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Horror stories and tales</li>
                    <li>Authors and creators</li>
                    <li>Dark circles (communities)</li>
                    <li>Events and challenges</li>
                  </ul>
                </div>
              </div>
            ) : (
              <SearchResults
                results={searchResults?.data}
                isLoading={isLoading}
                query={query}
                onLoadMore={handleLoadMore}
                hasMore={hasMore}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple search icon component
const SearchIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);
