"use client";

import { useState, useEffect } from "react";
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
  TrendingUp,
  Ghost,
  Skull,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-hot-toast";

export default function StoryFeed({ initialStories = [], feedType = "trending" }) {
  const [stories, setStories] = useState(initialStories);
  const [loading, setLoading] = useState(false);
  const { user, isAuthenticated } = useAuth();

  const handleVote = async (storyId, voteType) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to vote");
      return;
    }

    try {
      const response = await fetch(`/api/v1/stories/${storyId}/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          userId: user.id, 
          voteType 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setStories(prev => prev.map(story => 
          story._id === storyId 
            ? { ...story, upvotes: data.upvotes, downvotes: data.downvotes }
            : story
        ));
      }
    } catch (error) {
      toast.error("Failed to vote");
    }
  };

  const handleLike = async (storyId) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to like stories");
      return;
    }

    try {
      const response = await fetch(`/api/v1/stories/${storyId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.id }),
      });

      if (response.ok) {
        const data = await response.json();
        setStories(prev => prev.map(story => 
          story._id === storyId 
            ? { ...story, likesCount: story.likesCount + (data.liked ? 1 : -1) }
            : story
        ));
        toast.success(data.message);
      }
    } catch (error) {
      toast.error("Failed to like story");
    }
  };

  const handleBookmark = async (storyId) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to bookmark stories");
      return;
    }

    try {
      const response = await fetch(`/api/v1/stories/${storyId}/bookmark`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user.id }),
      });

      if (response.ok) {
        const data = await response.json();
        setStories(prev => prev.map(story => 
          story._id === storyId 
            ? { ...story, bookmarksCount: story.bookmarksCount + (data.bookmarked ? 1 : -1) }
            : story
        ));
        toast.success(data.message);
      }
    } catch (error) {
      toast.error("Failed to bookmark story");
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'horror': return <Skull className="w-4 h-4" />;
      case 'supernatural': return <Ghost className="w-4 h-4" />;
      default: return <Eye className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      horror: "bg-red-500/10 text-red-400 border-red-500/20",
      thriller: "bg-orange-500/10 text-orange-400 border-orange-500/20",
      supernatural: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      psychological: "bg-green-500/10 text-green-400 border-green-500/20",
      gothic: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
      mystery: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
      "dark fantasy": "bg-pink-500/10 text-pink-400 border-pink-500/20",
      paranormal: "bg-amber-500/10 text-amber-400 border-amber-500/20"
    };
    return colors[category] || "bg-gray-500/10 text-gray-400 border-gray-500/20";
  };

  return (
    <div className="space-y-4">
      {stories.map((story) => (
        <Card key={story._id} className="bg-card/50 backdrop-blur-sm border-border hover:bg-card/70 transition-all duration-300">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {/* Vote buttons */}
                <div className="flex flex-col items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleVote(story._id, 'up')}
                    className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                  <span className="text-sm font-medium text-muted-foreground">
                    {(story.upvotes || 0) - (story.downvotes || 0)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleVote(story._id, 'down')}
                    className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={story.author?.photo} />
                      <AvatarFallback className="text-xs">
                        {story.author?.name?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <Link 
                      href={`/user/${story.author?.username}`}
                      className="text-sm font-medium hover:text-primary transition-colors"
                    >
                      {story.author?.name || 'Anonymous'}
                    </Link>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(story.publishedAt || story.createdAt))} ago
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
                      className={`${getCategoryColor(story.category)} capitalize`}
                    >
                      {getCategoryIcon(story.category)}
                      <span className="ml-1">{story.category}</span>
                    </Badge>
                    
                    {story.tags?.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
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

              {feedType === "trending" && (
                <div className="flex items-center gap-1 text-primary">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs font-medium">Trending</span>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLike(story._id)}
                  className="text-muted-foreground hover:text-red-400 hover:bg-red-400/10"
                >
                  <Heart className="w-4 h-4 mr-1" />
                  {story.likesCount || 0}
                </Button>

                <Link href={`/story/${story.slug}#comments`}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-blue-400 hover:bg-blue-400/10"
                  >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    {story.commentsCount || 0}
                  </Button>
                </Link>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleBookmark(story._id)}
                  className="text-muted-foreground hover:text-yellow-400 hover:bg-yellow-400/10"
                >
                  <Bookmark className="w-4 h-4 mr-1" />
                  {story.bookmarksCount || 0}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-green-400 hover:bg-green-400/10"
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
      ))}
    </div>
  );
}
