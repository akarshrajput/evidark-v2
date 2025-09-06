"use client";

import { useState, useEffect, useRef } from "react";
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
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

const RightSidebar = () => {
  const { user, isAuthenticated } = useAuth();
  const [sidebarTransform, setSidebarTransform] = useState(0);
  const sidebarRef = useRef(null);
  const containerRef = useRef(null);

  // Medium-style flowing sidebar behavior
  useEffect(() => {
    const handleScroll = () => {
      if (!sidebarRef.current || !containerRef.current) return;

      const sidebar = sidebarRef.current;
      const container = containerRef.current;
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const sidebarHeight = sidebar.offsetHeight;
      const containerTop = container.offsetTop;
      const containerHeight = container.offsetHeight;

      // Calculate how much the sidebar should move
      const topOffset = 20;
      const bottomOffset = 20;
      const availableHeight = windowHeight - topOffset - bottomOffset;

      if (sidebarHeight <= availableHeight) {
        // Sidebar fits in viewport - keep it sticky at top
        setSidebarTransform(Math.max(0, scrollTop - containerTop + topOffset));
      } else {
        // Sidebar is taller than viewport - let it flow naturally
        const maxTransform = containerHeight - sidebarHeight;
        const scrollProgress =
          (scrollTop - containerTop) / (containerHeight - windowHeight);
        const transform = Math.max(
          0,
          Math.min(maxTransform, scrollProgress * maxTransform)
        );
        setSidebarTransform(transform);
      }
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);
    handleScroll(); // Initial call

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  // Fetch user's communities
  const { data: userCommunities } = useQuery({
    queryKey: ["user-communities"],
    queryFn: async () => {
      if (!isAuthenticated) return { data: [] };
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/communities/my/joined`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch communities");
      return response.json();
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch upcoming events
  const { data: upcomingEvents } = useQuery({
    queryKey: ["upcoming-events"],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/events?status=upcoming&limit=5`,
        {
          headers: isAuthenticated
            ? {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              }
            : {},
        }
      );
      if (!response.ok) throw new Error("Failed to fetch events");
      return response.json();
    },
    staleTime: 2 * 60 * 1000,
  });

  // Fetch active events
  const { data: activeEvents } = useQuery({
    queryKey: ["active-events"],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/events?status=active&limit=3`,
        {
          headers: isAuthenticated
            ? {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              }
            : {},
        }
      );
      if (!response.ok) throw new Error("Failed to fetch active events");
      return response.json();
    },
    staleTime: 1 * 60 * 1000,
  });

  const communities = userCommunities?.data || [];
  const upcoming = upcomingEvents?.data || [];
  const active = activeEvents?.data || [];

  const getEventTypeIcon = (type) => {
    switch (type) {
      case "writing_challenge":
        return "✍️";
      case "dark_ritual":
        return "🕯️";
      case "community_gathering":
        return "👥";
      case "horror_showcase":
        return "🎭";
      case "midnight_reading":
        return "📖";
      case "story_contest":
        return "🏆";
      default:
        return "📅";
    }
  };

  const getEventTypeColor = (type) => {
    switch (type) {
      case "writing_challenge":
        return "text-blue-400";
      case "dark_ritual":
        return "text-purple-400";
      case "community_gathering":
        return "text-green-400";
      case "horror_showcase":
        return "text-red-400";
      case "midnight_reading":
        return "text-yellow-400";
      case "story_contest":
        return "text-orange-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div ref={containerRef} className="relative min-h-screen w-full">
      <div
        ref={sidebarRef}
        className="space-y-6 transition-transform duration-100 ease-out"
        style={{
          position: "absolute",
          top: "20px",
          width: "320px",
          transform: `translateY(${sidebarTransform}px)`,
          zIndex: 10,
        }}
      >
        {/* My Communities Section */}
        {isAuthenticated && (
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Users className="w-5 h-5 text-red-400" />
                My Dark Circles
              </h3>
              <div className="flex items-center gap-2">
                <Link href="/communities/create">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-red-400"
                    title="Create new community"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </Link>
                {communities.length > 3 && (
                  <Link href="/communities">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-muted-foreground hover:text-red-400"
                    >
                      View All
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {communities.length === 0 ? (
              <div className="text-center py-4">
                <Skull className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground mb-3">
                  No circles joined yet
                </p>
                <Link href="/communities">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-600/50 text-red-200 hover:bg-red-950/30"
                  >
                    Explore Circles
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {communities.slice(0, 3).map((community) => (
                  <Link
                    key={community._id}
                    href={`/communities/${community._id}`}
                  >
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors cursor-pointer group">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-900/50 to-purple-900/50 flex items-center justify-center">
                        <span className="text-sm font-bold text-red-200">
                          {community.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-foreground truncate group-hover:text-red-200 transition-colors">
                          {community.name}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {community.stats?.memberCount || 0} members
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-red-400 transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Active Events Section */}
        {active.length > 0 && (
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                Live Events
              </h3>
              <Link href="/events">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground hover:text-green-400"
                >
                  View All
                </Button>
              </Link>
            </div>

            <div className="space-y-3">
              {active.map((event) => (
                <Link key={event._id} href={`/events/${event._id}`}>
                  <div className="p-3 rounded-lg bg-gradient-to-r from-green-950/20 to-emerald-950/20 border border-green-800/30 hover:border-green-600/50 transition-all cursor-pointer group">
                    <div className="flex items-start gap-3">
                      <span className="text-lg">
                        {getEventTypeIcon(event.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-foreground truncate group-hover:text-green-200 transition-colors">
                          {event.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {event.description}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {event.participants?.length || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {event.stats?.views || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Events Section */}
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-400" />
              Upcoming Events
            </h3>
            <Link href="/events">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground hover:text-blue-400"
              >
                View All
              </Button>
            </Link>
          </div>

          {upcoming.length === 0 ? (
            <div className="text-center py-4">
              <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                No upcoming events
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.slice(0, 4).map((event) => (
                <Link key={event._id} href={`/events/${event._id}`}>
                  <div className="p-3 rounded-lg bg-background/50 hover:bg-background/80 transition-colors cursor-pointer group">
                    <div className="flex items-start gap-3">
                      <span className="text-lg">
                        {getEventTypeIcon(event.type)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-foreground truncate group-hover:text-blue-200 transition-colors">
                          {event.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {event.description}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDistanceToNow(new Date(event.startDate), {
                              addSuffix: true,
                            })}
                          </span>
                          <span
                            className={`flex items-center gap-1 ${getEventTypeColor(
                              event.type
                            )}`}
                          >
                            <MapPin className="w-3 h-3" />
                            {event.type.replace("_", " ")}
                          </span>
                        </div>
                        {isAuthenticated && (
                          <div className="flex items-center gap-2 mt-2">
                            {event.isParticipant ? (
                              <span className="text-xs bg-green-900/30 text-green-200 px-2 py-1 rounded-full">
                                Joined
                              </span>
                            ) : event.canJoin ? (
                              <span className="text-xs bg-blue-900/30 text-blue-200 px-2 py-1 rounded-full">
                                Can Join
                              </span>
                            ) : null}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Skull className="w-5 h-5 text-red-400" />
            Dark Realm Stats
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">
                {active.length + upcoming.length}
              </div>
              <div className="text-xs text-muted-foreground">Active Events</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {communities.length}
              </div>
              <div className="text-xs text-muted-foreground">My Circles</div>
            </div>
          </div>
        </div>
        {/* Quick Stats */}
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Skull className="w-5 h-5 text-red-400" />
            Dark Realm Stats
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">
                {active.length + upcoming.length}
              </div>
              <div className="text-xs text-muted-foreground">Active Events</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {communities.length}
              </div>
              <div className="text-xs text-muted-foreground">My Circles</div>
            </div>
          </div>
        </div>
        {/* Quick Stats */}
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Skull className="w-5 h-5 text-red-400" />
            Dark Realm Stats
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">
                {active.length + upcoming.length}
              </div>
              <div className="text-xs text-muted-foreground">Active Events</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {communities.length}
              </div>
              <div className="text-xs text-muted-foreground">My Circles</div>
            </div>
          </div>
        </div>
        {/* Quick Stats */}
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Skull className="w-5 h-5 text-red-400" />
            Dark Realm Stats
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">
                {active.length + upcoming.length}
              </div>
              <div className="text-xs text-muted-foreground">Active Events</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {communities.length}
              </div>
              <div className="text-xs text-muted-foreground">My Circles</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightSidebar;
