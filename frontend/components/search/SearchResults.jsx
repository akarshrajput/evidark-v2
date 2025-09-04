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
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const SearchResults = ({ results, isLoading, query, onLoadMore, hasMore }) => {
  const [activeTab, setActiveTab] = useState("all");

  if (isLoading && !results) {
    return (
      <div className="space-y-6">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 animate-pulse"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-background/50 rounded-lg"></div>
              <div className="flex-1 space-y-3">
                <div className="h-4 bg-background/50 rounded w-3/4"></div>
                <div className="h-3 bg-background/50 rounded w-1/2"></div>
                <div className="flex gap-4">
                  <div className="h-3 bg-background/50 rounded w-16"></div>
                  <div className="h-3 bg-background/50 rounded w-16"></div>
                  <div className="h-3 bg-background/50 rounded w-16"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!results || results.total === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-6 bg-background/50 rounded-full flex items-center justify-center">
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
    <Link key={story._id} href={`/story/${story.slug || story._id}`}>
      <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 hover:border-red-500/30 hover:bg-card/70 transition-all group">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-red-900/50 to-purple-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-6 h-6 text-red-200" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground group-hover:text-red-200 transition-colors line-clamp-2 mb-2">
              {story.title}
            </h3>
            {story.description && (
              <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                {story.description}
              </p>
            )}
            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {story.author?.name || "Unknown"}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDistanceToNow(new Date(story.createdAt), {
                  addSuffix: true,
                })}
              </span>
              <span className="capitalize px-2 py-1 bg-background/50 rounded-full">
                {story.category}
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {story.views || 0}
              </span>
              <span className="flex items-center gap-1">
                <Heart
                  className={cn(
                    "w-3 h-3",
                    story.isLiked && "text-red-400 fill-current"
                  )}
                />
                {story.likesCount || 0}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="w-3 h-3" />
                {story.commentsCount || 0}
              </span>
              <span className="flex items-center gap-1">
                <Bookmark
                  className={cn(
                    "w-3 h-3",
                    story.isBookmarked && "text-blue-400 fill-current"
                  )}
                />
                {story.bookmarksCount || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );

  const renderUserCard = (user) => (
    <Link key={user._id} href={`/user/${user.username || user._id}`}>
      <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 hover:border-green-500/30 hover:bg-card/70 transition-all group">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-green-900/50 to-blue-900/50 rounded-full flex items-center justify-center flex-shrink-0">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <User className="w-6 h-6 text-green-200" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-foreground group-hover:text-green-200 transition-colors">
                {user.name}
              </h3>
              {user.verified && (
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
              )}
            </div>
            <p className="text-muted-foreground text-sm mb-2">
              @{user.username}
            </p>
            {user.bio && (
              <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                {user.bio}
              </p>
            )}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>{user.stats?.storiesCount || 0} stories</span>
              <span>{user.stats?.followersCount || 0} followers</span>
              <span>Level {user.level || 1}</span>
              <span className="capitalize px-2 py-1 bg-background/50 rounded-full">
                {user.role}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );

  const renderCommunityCard = (community) => (
    <Link key={community._id} href={`/communities/${community._id}`}>
      <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 hover:border-purple-500/30 hover:bg-card/70 transition-all group">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-900/50 to-pink-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
            <Users className="w-6 h-6 text-purple-200" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground group-hover:text-purple-200 transition-colors mb-2">
              {community.name}
            </h3>
            <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
              {community.description}
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {community.stats?.memberCount || 0} members
              </span>
              <span className="capitalize px-2 py-1 bg-background/50 rounded-full">
                {community.type}
              </span>
              {community.featured && (
                <span className="px-2 py-1 bg-yellow-900/30 text-yellow-200 rounded-full">
                  Featured
                </span>
              )}
            </div>
            {community.tags && community.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {community.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-1 bg-background/30 rounded-full text-muted-foreground"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );

  const renderEventCard = (event) => (
    <Link key={event._id} href={`/events/${event._id}`}>
      <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 hover:border-orange-500/30 hover:bg-card/70 transition-all group">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-900/50 to-red-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
            <Calendar className="w-6 h-6 text-orange-200" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-foreground group-hover:text-orange-200 transition-colors">
                {event.title}
              </h3>
              {event.status === "active" && (
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              )}
            </div>
            <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
              {event.description}
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {event.participants?.length || 0} participants
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {event.type.replace("_", " ")}
              </span>
              <span className="capitalize px-2 py-1 bg-background/50 rounded-full">
                {event.status}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              {event.status === "upcoming"
                ? "Starts"
                : event.status === "active"
                ? "Ends"
                : "Ended"}{" "}
              {formatDistanceToNow(
                new Date(
                  event.status === "upcoming" ? event.startDate : event.endDate
                ),
                { addSuffix: true }
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );

  const renderResults = () => {
    if (activeTab === "all" && results.mixed) {
      return results.mixed.map((item) => {
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
      });
    }

    switch (activeTab) {
      case "stories":
        return results.stories?.map(renderStoryCard);
      case "users":
        return results.users?.map(renderUserCard);
      case "communities":
        return results.communities?.map(renderCommunityCard);
      case "events":
        return results.events?.map(renderEventCard);
      default:
        return [
          ...(results.stories?.map(renderStoryCard) || []),
          ...(results.users?.map(renderUserCard) || []),
          ...(results.communities?.map(renderCommunityCard) || []),
          ...(results.events?.map(renderEventCard) || []),
        ];
    }
  };

  return (
    <div className="space-y-6">
      {/* Result Summary */}
      <div className="flex items-center justify-between">
        <div className="text-muted-foreground">
          {results.total} result{results.total !== 1 ? "s" : ""}
          {query && ` for "${query}"`}
        </div>
      </div>

      {/* Tabs */}
      {tabs.length > 1 && (
        <div className="flex flex-wrap gap-2 border-b border-border/50 pb-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "bg-red-950/30 text-red-200 border border-red-500/50"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50"
              )}
            >
              {tab.label}
              <span className="ml-2 px-2 py-0.5 bg-background/50 rounded-full text-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      <div className="space-y-4">{renderResults()}</div>

      {/* Load More */}
      {hasMore && (
        <div className="text-center pt-6">
          <Button
            onClick={onLoadMore}
            variant="outline"
            disabled={isLoading}
            className="border-border/50 bg-background/50 backdrop-blur-sm hover:bg-background/80"
          >
            {isLoading ? "Loading..." : "Load More Results"}
          </Button>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
