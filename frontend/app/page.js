"use client";

import { useState, useEffect } from "react";
import {
  useQuery,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { SpookyStoryCardSkeleton } from "@/app/_components/ui/SpookySkeleton";
import { useAuth } from "@/contexts/AuthContext";
import { Skull, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Import professional components
import FilterButtons from "@/app/_components/main/FilterButtons";
import StoryCard from "@/app/_components/stories/StoryCard";
import RightSidebar from "@/app/_components/main/RightSidebar";
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

export default function MainPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Vote handler
  const handleVote = async (storyId, voteType) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to vote");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/stories/${storyId}/vote`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            userId: user.id,
            voteType,
          }),
        }
      );

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
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/stories/${storyId}/like`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ userId: user.id }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Optimistic cache update instead of full invalidation
        queryClient.setQueryData(["stories", activeFilter, 1], (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              data: page.data.map((story) =>
                story._id === storyId
                  ? {
                      ...story,
                      isLiked: data.isLiked,
                      likesCount: data.isLiked
                        ? story.likesCount + 1
                        : story.likesCount - 1,
                    }
                  : story
              ),
            })),
          };
        });
        toast.success(data.message);
      }
    } catch (error) {
      toast.error("Failed to like story");
    }
  };

  // Bookmark handler with optimistic updates
  const handleBookmark = async (storyId) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to bookmark stories");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/stories/${storyId}/bookmark`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ userId: user.id }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        // Optimistic cache update for all story queries
        queryClient.setQueryData(["stories", activeFilter, 1], (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              data: page.data.map((story) =>
                story._id === storyId
                  ? {
                      ...story,
                      isBookmarked: data.isBookmarked,
                      bookmarksCount: data.isBookmarked
                        ? story.bookmarksCount + 1
                        : story.bookmarksCount - 1,
                    }
                  : story
              ),
            })),
          };
        });
        // Also update bookmarks page cache if it exists
        queryClient.invalidateQueries(["bookmarks"]);
        toast.success(data.message);
      }
    } catch (error) {
      toast.error("Failed to bookmark story");
    }
  };

  // Fetch stories with React Query and infinite scroll
  const {
    data: storiesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: storiesLoading,
    error: storiesError,
  } = useInfiniteQuery({
    queryKey: ["stories", activeFilter],
    queryFn: async ({ pageParam = 1 }) => {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";

      // Handle following filter with authentication
      if (activeFilter === "following") {
        const token = localStorage.getItem("token");
        if (!token || !isAuthenticated) {
          throw new Error("Authentication required for following stories");
        }

        const response = await fetch(
          `${baseUrl}/api/v1/stories/following?page=${pageParam}&limit=6`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch following stories");
        return response.json();
      }

      // Regular stories endpoint for other filters
      const response = await fetch(
        `${baseUrl}/api/v1/stories?page=${pageParam}&limit=6&sort=${
          activeFilter === "trending"
            ? "-views,-likes"
            : activeFilter === "recent"
            ? "-createdAt"
            : activeFilter === "popular"
            ? "-likes,-views"
            : "-createdAt"
        }`
      );
      if (!response.ok) throw new Error("Failed to fetch stories");
      return response.json();
    },
    getNextPageParam: (lastPage, pages) => {
      return lastPage.data.length === 6 ? pages.length + 1 : undefined;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: activeFilter !== "following" || isAuthenticated, // Only enable following query when authenticated
  });

  // Mock data for trending authors
  const trendingAuthors = {
    data: [
      {
        id: 1,
        name: "Dark Writer",
        username: "darkwriter",
        avatar: null,
        bio: "Master of horror tales",
      },
      {
        id: 2,
        name: "Shadow Poet",
        username: "shadowpoet",
        avatar: null,
        bio: "Crafting nightmares in verse",
      },
      {
        id: 3,
        name: "Midnight Scribe",
        username: "midnightscribe",
        avatar: null,
        bio: "Stories that haunt your dreams",
      },
    ],
  };
  const authorsLoading = false;

  // Mock data for categories
  const categories = {
    data: [
      {
        id: 1,
        name: "Horror",
        slug: "horror",
        description: "Spine-chilling tales",
      },
      {
        id: 2,
        name: "Thriller",
        slug: "thriller",
        description: "Edge-of-your-seat suspense",
      },
      {
        id: 3,
        name: "Mystery",
        slug: "mystery",
        description: "Puzzles in the dark",
      },
      {
        id: 4,
        name: "Supernatural",
        slug: "supernatural",
        description: "Beyond the natural world",
      },
    ],
  };
  const categoriesLoading = false;

  // Mock data for events
  const events = {
    data: [
      {
        id: 1,
        title: "Dark Tales Contest",
        description: "Submit your horror story",
        date: "2025-09-15",
      },
      {
        id: 2,
        title: "Midnight Reading",
        description: "Join our spooky session",
        date: "2025-09-22",
      },
      {
        id: 3,
        title: "Horror Writers Meetup",
        description: "Connect with authors",
        date: "2025-10-01",
      },
    ],
  };
  const eventsLoading = false;

  // Mock data for stats
  const stats = {
    data: {
      users: 1337,
      stories: 666,
      categories: 13,
      views: 13666,
      likes: 3333,
    },
  };
  const statsLoading = false;

  // Flatten stories from all pages
  const stories = storiesData?.pages?.flatMap((page) => page.data) || [];

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

  return (
    <div className="min-h-screen space-y-6">
      {/* Filter Section */}
      <FilterButtons
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      {/* Stories Content */}
      <div className="space-y-4">
        {storiesLoading ? (
          <>
            {[...Array(6)].map((_, i) => (
              <SpookyStoryCardSkeleton key={i} />
            ))}
          </>
        ) : storiesError ? (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <Skull className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Failed to Load Stories
            </h3>
            <p className="text-muted-foreground">
              {activeFilter === "following"
                ? "Unable to load stories from people you follow. Please try again."
                : "The darkness consumed the stories. Please refresh the page."}
            </p>
          </div>
        ) : stories.length === 0 && activeFilter === "following" ? (
          <div className="bg-card border border-border rounded-lg p-12 text-center">
            <Users className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No Stories from Following
            </h3>
            <p className="text-muted-foreground mb-6">
              You&apos;re not following anyone yet, or the people you follow
              haven&apos;t published any stories.
            </p>
            <Button
              variant="outline"
              onClick={() => setActiveFilter("all")}
              className="border-blue-600/50 text-blue-200 hover:bg-blue-950/30"
            >
              Explore All Stories
            </Button>
          </div>
        ) : (
          <>
            {stories.map((story, index) => (
              <StoryCard
                key={`${story._id}-${index}`}
                story={story}
                onVote={handleVote}
                onLike={handleLike}
                onBookmark={handleBookmark}
              />
            ))}
          </>
        )}

        {/* Loading more indicator */}
        {isFetchingNextPage && (
          <div className="py-8 flex justify-center">
            <LoadingIndicator />
          </div>
        )}
      </div>
    </div>
  );
}
