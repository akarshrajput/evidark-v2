"use client";

import { useState, useEffect } from "react";
import { useQuery, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { SpookyStoryCardSkeleton } from "@/app/_components/ui/SpookySkeleton";
import { useAuth } from "@/contexts/AuthContext";
import { Bookmark, Skull, Heart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";

// Import professional components
import StoryCard from "@/app/_components/stories/StoryCard";
import LoadingIndicator from "@/app/_components/main/LoadingIndicator";

// Safe date formatting helper
const safeFormatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Recently";
    return formatDistanceToNow(date) + " ago";
  } catch (error) {
    return "Recently";
  }
};

export default function BookmarksPage() {
  const { user, isAuthenticated, loading } = useAuth();
  const queryClient = useQueryClient();

  // Redirect if not authenticated (only after loading is complete)
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = '/login';
    }
  }, [isAuthenticated, loading]);

  // Vote handler
  const handleVote = async (storyId, voteType) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to vote");
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/stories/${storyId}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userId: user.id,
          voteType,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("Vote recorded!");
      }
    } catch (error) {
      toast.error("Failed to vote");
    }
  };

  // Like handler
  const handleLike = async (storyId) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to like stories");
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/stories/${storyId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ userId: user.id }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
      }
    } catch (error) {
      toast.error("Failed to like story");
    }
  };

  // Bookmark handler (remove bookmark)
  const handleBookmark = async (storyId) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to manage bookmarks");
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/stories/${storyId}/bookmark`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ userId: user.id }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        // Invalidate both bookmarks and stories queries
        queryClient.invalidateQueries(['bookmarks']);
        queryClient.invalidateQueries(['stories']);
      }
    } catch (error) {
      toast.error("Failed to update bookmark");
    }
  };

  // Fetch bookmarks with React Query and infinite scroll
  const {
    data: bookmarksData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: bookmarksLoading,
    error: bookmarksError,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["bookmarks"],
    queryFn: async ({ pageParam = 1 }) => {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";
      const token = localStorage.getItem("token");
      
      if (!token || !isAuthenticated) {
        throw new Error("Authentication required for bookmarks");
      }
      
      const response = await fetch(
        `${baseUrl}/api/v1/stories/bookmarks?page=${pageParam}&limit=6`,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch bookmarks");
      return response.json();
    },
    getNextPageParam: (lastPage, pages) => {
      return lastPage.data.length === 6 ? pages.length + 1 : undefined;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: isAuthenticated, // Only enable when authenticated
  });

  // Flatten bookmarks from all pages
  const bookmarks = bookmarksData?.pages?.flatMap((page) => page.data) || [];

  // Infinite scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop !==
          document.documentElement.offsetHeight ||
        isFetchingNextPage
      ) {
        return;
      }
      if (hasNextPage) {
        fetchNextPage();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // Show loading while auth is being checked
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="grid gap-6">
          {[...Array(3)].map((_, i) => (
            <SpookyStoryCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Bookmark className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Your Bookmarks</h1>
          </div>
          <p className="text-muted-foreground">
            Stories you&apos;ve saved for later reading
          </p>
        </div>

        {/* Bookmarks Grid */}
        {bookmarksLoading ? (
          <div className="grid gap-6">
            {[...Array(6)].map((_, i) => (
              <SpookyStoryCardSkeleton key={i} />
            ))}
          </div>
        ) : bookmarksError ? (
          <div className="text-center py-12">
            <Skull className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-muted-foreground">
              Failed to load your bookmarks. The darkness consumed them...
            </p>
            <Button
              variant="outline"
              onClick={() => refetch()}
              className="mt-4 border-red-600/50 text-red-200 hover:bg-red-950/30"
            >
              Try Again
            </Button>
          </div>
        ) : bookmarks.length === 0 ? (
          <div className="text-center py-12">
            <Bookmark className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Bookmarks Yet</h3>
            <p className="text-muted-foreground mb-4">
              You haven&apos;t bookmarked any stories yet. Start exploring and save stories you want to read later.
            </p>
            <Button
              asChild
              className="spooky-glow border-none"
            >
              <Link href="/">
                Explore Stories
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-6">
            {bookmarks.map((story, index) => (
              <div key={`${story._id}-${index}`} className="relative">
                <StoryCard
                  story={story}
                  onVote={handleVote}
                  onLike={handleLike}
                  onBookmark={handleBookmark}
                />
                {/* Bookmark date indicator */}
                {story.bookmarkedAt && (
                  <div className="absolute top-4 right-4 bg-yellow-500/10 text-yellow-400 px-2 py-1 rounded-md text-xs border border-yellow-500/20">
                    Bookmarked {safeFormatDate(story.bookmarkedAt)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Loading more indicator */}
        {isFetchingNextPage && <LoadingIndicator />}
      </div>
    </div>
  );
}
