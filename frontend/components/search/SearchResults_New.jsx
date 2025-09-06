"use client";

import { useState } from "react";
import {
  BookOpen,
  User,
  Users,
  Calendar,
  Eye,
  Heart,
  MessageCircle,
  Bookmark,
  Clock,
  MapPin,
  Star,
  Skull,
  Share2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const SearchResults = ({ results, isLoading, query, onLoadMore, hasMore }) => {
  const [activeTab, setActiveTab] = useState("all");

  if (isLoading && !results) {
    return (
      <div className="space-y-6">
        {[...Array(5)].map((_, i) => (
          <Card
            key={i}
            className="border-none shadow-lg shadow-black/40 backdrop-blur-sm bg-card/50"
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-muted/50 rounded-lg animate-pulse"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-muted/50 rounded animate-pulse w-3/4"></div>
                  <div className="h-3 bg-muted/50 rounded animate-pulse w-1/2"></div>
                  <div className="flex gap-4">
                    <div className="h-3 bg-muted/50 rounded animate-pulse w-16"></div>
                    <div className="h-3 bg-muted/50 rounded animate-pulse w-16"></div>
                    <div className="h-3 bg-muted/50 rounded animate-pulse w-16"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!results || results.total === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-6 bg-card backdrop-blur-sm rounded-lg flex items-center justify-center border-none shadow-sm shadow-black/20">
          <BookOpen className="w-12 h-12 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          No results found
        </h3>
        <p className="text-muted-foreground mb-6">
          {query
            ? `No results found for "${query}"`
            : "Try adjusting your search terms or filters"}
        </p>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>Try:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Using different keywords</li>
            <li>Checking your spelling</li>
            <li>Using fewer filters</li>
            <li>Searching for broader terms</li>
          </ul>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "all", label: "All", count: results.total },
    { id: "stories", label: "Stories", count: results.stories?.length || 0 },
    { id: "users", label: "Users", count: results.users?.length || 0 },
    {
      id: "communities",
      label: "Communities",
      count: results.communities?.length || 0,
    },
    { id: "events", label: "Events", count: results.events?.length || 0 },
  ].filter((tab) => tab.count > 0);

  const renderStoryCard = (story) => (
    <Card
      key={story._id}
      className="border-none shadow-lg shadow-black/40 backdrop-blur-sm bg-card/50 hover:shadow-xl hover:shadow-black/50 transition-all duration-300 hover:scale-[1.02] group"
    >
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
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
                {formatDistanceToNow(new Date(story.createdAt))} ago
              </span>
            </div>

            <Link href={`/story/${story.slug || story._id}`}>
              <h3 className="text-lg font-semibold hover:text-primary transition-colors cursor-pointer mb-2 group-hover:text-red-400">
                {story.title}
              </h3>
            </Link>

            {story.description && (
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {story.description}
              </p>
            )}

            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className="bg-red-600/20 text-red-400 border-red-500/30 backdrop-blur-sm capitalize border-none"
              >
                <Skull className="w-3 h-3 mr-1" />
                {story.category}
              </Badge>

              {story.tags?.slice(0, 3).map((tag) => (
                <Badge
                  key={tag}
                  variant="secondary"
                  className="text-xs bg-muted/40 border-border text-muted-foreground border-none"
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
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
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

  const renderUserCard = (user) => (
    <Card
      key={user._id}
      className="border-none shadow-lg shadow-black/40 backdrop-blur-sm bg-card/50 hover:shadow-xl hover:shadow-black/50 transition-all duration-300 hover:scale-[1.02] group"
    >
      <CardContent className="p-6">
        <Link href={`/user/${user.username}`}>
          <div className="flex items-start gap-4">
            <Avatar className="w-12 h-12 border border-border">
              <AvatarImage src={user.photo} alt={user.name} />
              <AvatarFallback className="bg-secondary">
                {user.name?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground group-hover:text-red-400 transition-colors mb-1">
                {user.name}
              </h3>
              <p className="text-sm text-muted-foreground mb-2">
                @{user.username}
              </p>
              {user.bio && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {user.bio}
                </p>
              )}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  {user.storiesCount || 0} stories
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {user.followersCount || 0} followers
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Joined {formatDistanceToNow(new Date(user.createdAt))} ago
                </span>
              </div>
            </div>
          </div>
        </Link>
      </CardContent>
    </Card>
  );

  const renderCommunityCard = (community) => (
    <Card
      key={community._id}
      className="border-none shadow-lg shadow-black/40 backdrop-blur-sm bg-card/50 hover:shadow-xl hover:shadow-black/50 transition-all duration-300 hover:scale-[1.02] group"
    >
      <CardContent className="p-6">
        <Link href={`/communities/${community.slug || community._id}`}>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-900/50 to-red-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6 text-purple-200" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground group-hover:text-red-400 transition-colors mb-1">
                {community.name}
              </h3>
              {community.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {community.description}
                </p>
              )}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {community.membersCount || 0} members
                </span>
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  {community.postsCount || 0} posts
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Created {formatDistanceToNow(
                    new Date(community.createdAt)
                  )}{" "}
                  ago
                </span>
              </div>
            </div>
          </div>
        </Link>
      </CardContent>
    </Card>
  );

  const renderEventCard = (event) => (
    <Card
      key={event._id}
      className="border-none shadow-lg shadow-black/40 backdrop-blur-sm bg-card/50 hover:shadow-xl hover:shadow-black/50 transition-all duration-300 hover:scale-[1.02] group"
    >
      <CardContent className="p-6">
        <Link href={`/events/${event._id}`}>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-900/50 to-red-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Calendar className="w-6 h-6 text-orange-200" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground group-hover:text-red-400 transition-colors mb-1">
                {event.title}
              </h3>
              {event.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                  {event.description}
                </p>
              )}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(event.startDate).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {event.location || "Online"}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {event.attendeesCount || 0} attending
                </span>
              </div>
            </div>
          </div>
        </Link>
      </CardContent>
    </Card>
  );

  const getFilteredResults = () => {
    if (activeTab === "all") {
      return [
        ...(results.stories || []).map((item) => ({ ...item, type: "story" })),
        ...(results.users || []).map((item) => ({ ...item, type: "user" })),
        ...(results.communities || []).map((item) => ({
          ...item,
          type: "community",
        })),
        ...(results.events || []).map((item) => ({ ...item, type: "event" })),
      ];
    } else {
      return (results[activeTab] || []).map((item) => ({
        ...item,
        type: activeTab.slice(0, -1),
      }));
    }
  };

  const filteredResults = getFilteredResults();

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">
          {results.total} result{results.total !== 1 ? "s" : ""} for "{query}"
        </h2>
      </div>

      {/* Tab Navigation */}
      {tabs.length > 1 && (
        <div className="flex flex-wrap gap-2 border-b border-border pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all border-none shadow-sm shadow-black/20 hover:shadow-md hover:shadow-black/30",
                activeTab === tab.id
                  ? "bg-red-600/20 text-red-400 border-red-500/30"
                  : "bg-card/50 text-muted-foreground hover:text-foreground hover:bg-card/70"
              )}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      <div className="space-y-4">
        {filteredResults.map((item) => {
          switch (item.type) {
            case "story":
              return renderStoryCard(item);
            case "user":
              return renderUserCard(item);
            case "community":
              return renderCommunityCard(item);
            case "event":
              return renderEventCard(item);
            default:
              return null;
          }
        })}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="text-center py-8">
          <Button
            onClick={onLoadMore}
            disabled={isLoading}
            className="bg-red-600/20 text-red-400 border-red-500/30 hover:bg-red-600/30 border-none shadow-sm shadow-black/20 hover:shadow-md hover:shadow-black/30 transition-all duration-200"
          >
            {isLoading ? "Loading..." : "Load More Results"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
