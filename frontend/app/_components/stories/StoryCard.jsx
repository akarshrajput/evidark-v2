"use client";

import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Heart,
  MessageCircle,
  Bookmark,
  ChevronUp,
  ChevronDown,
  Eye,
  Calendar,
  Clock,
  User,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Skull,
  Share2,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import Link from "next/link";

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

export default function StoryCard({ story, onVote, onLike, onBookmark }) {
  const { user, isAuthenticated } = useAuth();
  const [localLikeState, setLocalLikeState] = useState(story.isLiked ?? false);
  const [localLikeCount, setLocalLikeCount] = useState(story.likesCount || 0);
  const [localBookmarkState, setLocalBookmarkState] = useState(
    story.isBookmarked ?? false
  );
  const [localBookmarkCount, setLocalBookmarkCount] = useState(
    story.bookmarksCount || 0
  );
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [isBookmarkLoading, setIsBookmarkLoading] = useState(false);

  useEffect(() => {
    setLocalLikeState(story.isLiked ?? false);
    setLocalBookmarkState(story.isBookmarked ?? false);
  }, [story.isLiked, story.isBookmarked]);

  const handleVote = async (voteType) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to vote");
      return;
    }
    if (onVote) {
      await onVote(story._id, voteType);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to like stories");
      return;
    }

    setIsLikeLoading(true);

    // Optimistic update
    const wasLiked = localLikeState;
    setLocalLikeState(!wasLiked);
    setLocalLikeCount((prev) => (wasLiked ? prev - 1 : prev + 1));

    try {
      if (onLike) {
        await onLike(story._id);
      }
    } catch (error) {
      // Rollback on error
      setLocalLikeState(wasLiked);
      setLocalLikeCount((prev) => (wasLiked ? prev + 1 : prev - 1));
      toast.error("Failed to like story");
    } finally {
      setIsLikeLoading(false);
    }
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to bookmark stories");
      return;
    }

    setIsBookmarkLoading(true);

    // Optimistic update
    const wasBookmarked = localBookmarkState;
    setLocalBookmarkState(!wasBookmarked);
    setLocalBookmarkCount((prev) => (wasBookmarked ? prev - 1 : prev + 1));

    try {
      if (onBookmark) {
        await onBookmark(story._id);
      }
    } catch (error) {
      // Revert optimistic update on error
      setLocalBookmarkState(wasBookmarked);
      setLocalBookmarkCount((prev) => (wasBookmarked ? prev + 1 : prev - 1));
      toast.error("Failed to bookmark story");
    } finally {
      setIsBookmarkLoading(false);
    }
  };

  return (
    <Card className="evidark-card border-none transition-all duration-300 rounded-xl">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Professional Vote buttons */}
            <div className="flex flex-col items-center gap-1 bg-muted/30 p-2 rounded-lg border border-border">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleVote("up")}
                className="evidark-btn-secondary h-8 w-8 p-0 rounded-md transition-all duration-200"
              >
                <ArrowUp className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium text-primary">
                {(story.upvotes || 0) - (story.downvotes || 0)}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleVote("down")}
                className="evidark-btn-secondary h-8 w-8 p-0 rounded-md transition-all duration-200"
              >
                <ArrowDown className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Link
                  href={`/user/${story.author?.username}`}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <Avatar className="w-6 h-6 border border-border">
                    <AvatarImage
                      src={story.author?.photo}
                      alt={story.author?.name}
                    />
                    <AvatarFallback className="text-xs bg-secondary">
                      {story.author?.name?.[0] || "A"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {story.author?.name}
                  </span>
                </Link>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">
                  {safeFormatDate(story.createdAt)}
                </span>
              </div>

              <Link href={`/story/${story.slug}`}>
                <h2 className="text-lg font-semibold hover:text-primary transition-colors cursor-pointer mb-2">
                  {story.title}
                </h2>
              </Link>

              {story.description && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {story.description}
                </p>
              )}

              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant="outline"
                  className="bg-red-600/20 text-red-400 border-red-500/30 backdrop-blur-sm capitalize"
                >
                  <Skull className="w-4 h-4" />
                  <span className="ml-1">{story.category}</span>
                </Badge>

                {story.tags?.slice(0, 3).map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-xs bg-muted/40 border-border text-muted-foreground"
                  >
                    {tag}
                  </Badge>
                ))}

                {story.readingTime && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {story.readingTime} min read
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              className="text-muted-foreground hover:text-red-400 hover:bg-red-400/10 border-none shadow-sm shadow-black/30 hover:shadow-md hover:shadow-black/40 transition-all duration-200"
            >
              <Heart className="w-4 h-4 mr-1" />
              {story.likesCount || 0}
            </Button>

            <Link href={`/story/${story.slug}#comments`}>
              <Button
                variant="ghost"
                size="sm"
                className="evidark-btn-secondary text-muted-foreground hover:text-blue-400 transition-all duration-200"
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                {story.commentsCount || 0}
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleBookmark}
              disabled={isBookmarkLoading}
              className={`evidark-btn-secondary transition-all duration-300 ${
                localBookmarkState
                  ? "text-yellow-400 bg-yellow-400/10 border-yellow-400/20 hover:text-yellow-300 hover:bg-yellow-400/20"
                  : "text-muted-foreground hover:text-yellow-400 hover:bg-yellow-400/10"
              } ${isBookmarkLoading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <Bookmark
                className={`w-4 h-4 mr-1 ${
                  localBookmarkState ? "fill-current" : ""
                } ${isBookmarkLoading ? "animate-pulse" : ""}`}
              />
              {localBookmarkCount}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="evidark-btn-secondary text-muted-foreground hover:text-green-400 hover:bg-green-400/10 transition-all duration-200"
            >
              <Share2 className="w-4 h-4 mr-1" />
              Share
            </Button>
          </div>

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Eye className="w-3 h-3" />
            {story.views || 0} views
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
