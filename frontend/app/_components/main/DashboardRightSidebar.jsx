"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import {
  Calendar,
  Users,
  MapPin,
  Clock,
  ArrowRight,
  Skull,
  Eye,
  TrendingUp,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

const DashboardRightSidebar = () => {
  const { user, isAuthenticated } = useAuth();

  // Fetch trending stories
  const {
    data: trendingStories = [],
    isLoading: trendingLoading,
    error: trendingError,
  } = useQuery({
    queryKey: ["trending-stories"],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/stories/trending?limit=5`
      );
      if (!response.ok) throw new Error("Failed to fetch trending stories");
      const data = await response.json();
      return data.data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch suggested users
  const {
    data: suggestedUsers = [],
    isLoading: usersLoading,
    error: usersError,
  } = useQuery({
    queryKey: ["suggested-users"],
    queryFn: async () => {
      if (!isAuthenticated) return [];
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/suggestions?limit=5`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch suggested users");
      const data = await response.json();
      return data.data || [];
    },
    enabled: isAuthenticated,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch upcoming events
  const {
    data: upcomingEvents = [],
    isLoading: eventsLoading,
    error: eventsError,
  } = useQuery({
    queryKey: ["upcoming-events"],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/events/upcoming?limit=3`
      );
      if (!response.ok) throw new Error("Failed to fetch upcoming events");
      const data = await response.json();
      return data.data || [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });

  const safeFormatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Recently";
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return "Recently";
    }
  };

  return (
    <div className="h-full bg-background">
      <div className="p-6 space-y-6">
        {/* Trending Stories */}
        <Card className="evidark-card border-none rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold">
              <TrendingUp className="w-5 h-5 text-primary" />
              Trending
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {trendingLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center space-x-3 animate-pulse"
                  >
                    <div className="w-8 h-8 bg-muted rounded-md"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-muted rounded w-3/4"></div>
                      <div className="h-2 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : trendingError ? (
              <p className="text-sm text-muted-foreground">
                Failed to load trending stories
              </p>
            ) : trendingStories.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No trending stories available
              </p>
            ) : (
              trendingStories.map((story, index) => (
                <div
                  key={story._id}
                  className="group transition-all duration-200"
                >
                  <Link href={`/story/${story.slug}`} className="block">
                    <div className="flex items-start gap-3 p-2 -mx-2 rounded-md hover:bg-accent/50 transition-colors">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium line-clamp-2 group-hover:text-primary transition-colors">
                          {story.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <Eye className="w-3 h-3" />
                          {story.views || 0} views
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Who to follow */}
        {isAuthenticated && (
          <Card className="evidark-card border-none rounded-xl">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Suggested Authors
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {usersLoading ? (
                <div className="p-4 space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 animate-pulse"
                    >
                      <div className="w-10 h-10 bg-muted rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-muted rounded mb-1"></div>
                        <div className="h-3 bg-muted rounded w-2/3"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-0">
                  {suggestedUsers.slice(0, 4).map((suggestedUser) => (
                    <div
                      key={suggestedUser._id}
                      className="flex items-center justify-between p-4 hover:bg-accent/50 transition-colors border-b border-border last:border-b-0"
                    >
                      <Link
                        href={`/user/${suggestedUser.username}`}
                        className="flex items-center gap-3 flex-1 min-w-0"
                      >
                        <Avatar className="w-10 h-10">
                          <AvatarImage
                            src={
                              suggestedUser.profilePic || "/default-avatar.png"
                            }
                            alt={suggestedUser.username}
                          />
                          <AvatarFallback className="bg-secondary text-secondary-foreground text-sm">
                            {suggestedUser.username?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground truncate text-sm">
                            {suggestedUser.displayName ||
                              suggestedUser.username}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            @{suggestedUser.username}
                          </p>
                        </div>
                      </Link>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-lg px-3 py-1 text-xs border border-border hover:bg-accent"
                      >
                        Follow
                      </Button>
                    </div>
                  ))}
                  <div className="p-4 border-t border-border">
                    <Link
                      href="/users"
                      className="text-sm text-primary hover:text-primary/80 font-medium"
                    >
                      Show more suggestions →
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Upcoming Events */}
        <Card className="evidark-card border-none rounded-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Upcoming Events
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {eventsLoading ? (
              <div className="p-4 space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-3 bg-muted rounded w-3/4 mb-1"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : upcomingEvents.length > 0 ? (
              <div className="space-y-0">
                {upcomingEvents.slice(0, 3).map((event) => (
                  <Link
                    key={event._id}
                    href={`/events/${event._id}`}
                    className="block p-4 hover:bg-accent/50 transition-colors border-b border-border last:border-b-0"
                  >
                    <div className="space-y-2">
                      <p className="font-medium text-foreground line-clamp-2 text-sm">
                        {event.title}
                      </p>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {safeFormatDate(event.date)}
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            {event.location}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
                <div className="p-4 border-t border-border">
                  <Link
                    href="/events"
                    className="text-sm text-primary hover:text-primary/80 font-medium"
                  >
                    View all events →
                  </Link>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-muted-foreground">
                <Calendar className="w-8 h-8 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No upcoming events</p>
                <Link
                  href="/events"
                  className="text-xs text-primary hover:underline"
                >
                  Explore events
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Community Stats or Guidelines */}
        <Card className="bg-card border border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">
              About EviDark
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              A professional platform for dark stories, mysteries, and
              supernatural tales.
            </p>
            <div className="flex justify-between text-xs">
              <span>Stories: 666</span>
              <span>Authors: 1,337</span>
              <span>Communities: 13</span>
            </div>
          </CardContent>
        </Card>

        {/* Footer Links */}
        <div className="pt-4 border-t border-border">
          <div className="text-xs text-muted-foreground space-y-3">
            <div className="flex flex-wrap gap-3">
              <Link
                href="/terms"
                className="hover:text-foreground transition-colors"
              >
                Terms
              </Link>
              <Link
                href="/privacy"
                className="hover:text-foreground transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/about"
                className="hover:text-foreground transition-colors"
              >
                About
              </Link>
              <Link
                href="/help"
                className="hover:text-foreground transition-colors"
              >
                Help
              </Link>
            </div>
            <p className="text-xs">© 2025 EviDark. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardRightSidebar;
