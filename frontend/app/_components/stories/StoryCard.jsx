"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Eye,
  Clock,
  ArrowUp,
  ArrowDown,
  Skull,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

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
    if (onLike) {
      await onLike(story._id);
    }
  };

  const handleBookmark = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to bookmark stories");
      return;
    }
    if (onBookmark) {
      await onBookmark(story._id);
    }
  };

  return (
    <Card className="professional-card border-none transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Vote buttons */}
            <div className="flex flex-col items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleVote("up")}
                className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary border-none shadow-sm shadow-black/30 hover:shadow-md hover:shadow-black/40 transition-all duration-200"
              >
                <ArrowUp className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium text-muted-foreground">
                {(story.upvotes || 0) - (story.downvotes || 0)}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleVote("down")}
                className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive border-none shadow-sm shadow-black/30 hover:shadow-md hover:shadow-black/40 transition-all duration-200"
              >
                <ArrowDown className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Avatar className="w-6 h-6">
                  <AvatarImage src={story.author?.photo} />
                  <AvatarFallback className="text-xs">
                    {story.author?.name?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <Link
                  href={`/user/${story.author?.username}`}
                  className="text-sm font-medium hover:text-primary transition-colors"
                >
                  {story.author?.name || "Anonymous"}
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
                  className="bg-red-500/10 text-red-400 border-none shadow-sm shadow-black/40 capitalize"
                >
                  <Skull className="w-4 h-4" />
                  <span className="ml-1">{story.category}</span>
                </Badge>

                {story.tags?.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs border-none shadow-sm shadow-black/40">
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
                className="text-muted-foreground hover:text-blue-400 hover:bg-blue-400/10 border-none shadow-sm shadow-black/30 hover:shadow-md hover:shadow-black/40 transition-all duration-200"
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                {story.commentsCount || 0}
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleBookmark}
              className="text-muted-foreground hover:text-yellow-400 hover:bg-yellow-400/10 border-none shadow-sm shadow-black/30 hover:shadow-md hover:shadow-black/40 transition-all duration-200"
            >
              <Bookmark className="w-4 h-4 mr-1" />
              {story.bookmarksCount || 0}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-green-400 hover:bg-green-400/10 border-none shadow-sm shadow-black/30 hover:shadow-md hover:shadow-black/40 transition-all duration-200"
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
