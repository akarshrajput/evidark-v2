"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
  const observer = useRef();

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
          `${baseUrl}/api/v1/stories/following?page=${pageParam}&limit=10`,
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
        `${baseUrl}/api/v1/stories?page=${pageParam}&limit=10&sort=${
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
      return lastPage.data.length === 10 ? pages.length + 1 : undefined;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: activeFilter !== "following" || isAuthenticated, // Only enable following query when authenticated
  });

  // Intersection observer callback for infinite scroll
  const lastStoryElementRef = useCallback(
    (node) => {
      if (isFetchingNextPage) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        },
        {
          threshold: 0.1,
          rootMargin: "100px",
        }
      );
      if (node) observer.current.observe(node);
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage]
  );

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

  // Improved infinite scroll effect with better mobile support
  useEffect(() => {
    const handleScroll = () => {
      if (isFetchingNextPage || !hasNextPage) {
        return;
      }

      // More reliable scroll detection for desktop and mobile
      const scrollTop =
        document.documentElement.scrollTop || document.body.scrollTop;
      const scrollHeight =
        document.documentElement.scrollHeight || document.body.scrollHeight;
      const clientHeight =
        document.documentElement.clientHeight || window.innerHeight;

      // Trigger when within 200px of bottom
      if (scrollTop + clientHeight >= scrollHeight - 200) {
        fetchNextPage();
      }
    };

    // Use passive listener for better mobile performance
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <div className="min-h-screen space-y-6 mt-4 lg:mt-0 touch-pan-y">
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
            {stories.map((story, index) => {
              // Attach ref to the last story for intersection observer
              const isLastStory = index === stories.length - 1;
              return (
                <div
                  key={`${story._id}-${index}`}
                  ref={isLastStory ? lastStoryElementRef : null}
                >
                  <StoryCard
                    story={story}
                    onVote={handleVote}
                    onLike={handleLike}
                    onBookmark={handleBookmark}
                  />
                </div>
              );
            })}
          </>
        )}

        {/* Loading more indicator */}
        {isFetchingNextPage && (
          <div className="py-8 flex justify-center">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <LoadingIndicator />
              <span className="text-sm">Loading more spooky stories...</span>
            </div>
          </div>
        )}

        {/* End of stories indicator */}
        {!hasNextPage && stories.length > 0 && (
          <div className="py-8 flex justify-center">
            <div className="text-center text-muted-foreground">
              <Skull className="w-6 h-6 mx-auto mb-2 opacity-50" />
              <p className="text-sm">
                You&apos;ve reached the end of the darkness...
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
