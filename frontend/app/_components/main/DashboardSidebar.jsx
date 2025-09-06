"use client";
import React from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Home,
  Search,
  Bookmark,
  Users,
  Calendar,
  BookOpen,
  TrendingUp,
  MessageCircle,
  Bell,
  User,
  Settings,
  LogOut,
  PenTool,
  ChevronDown,
  Plus,
  Globe,
  Skull,
  Ghost,
  Eye,
  Crown,
  Zap,
  Moon,
} from "lucide-react";

const DashboardSidebar = () => {
  const { user, isAuthenticated } = useAuth();
  const pathname = usePathname();

  const navigationItems = [
    { href: "/", icon: Home, label: "Home", active: pathname === "/" },
    {
      href: "/trending",
      icon: TrendingUp,
      label: "Popular",
      active: pathname === "/trending",
    },
    {
      href: "/search",
      icon: Search,
      label: "Explore",
      active: pathname === "/search",
    },
    {
      href: "/categories",
      icon: BookOpen,
      label: "Categories",
      active: pathname.startsWith("/categories"),
    },
    {
      href: "/events",
      icon: Calendar,
      label: "Events",
      active: pathname.startsWith("/events"),
    },
  ];

  const personalItems = isAuthenticated
    ? [
        {
          href: "/user",
          icon: User,
          label: "Profile",
          active: pathname === "/user",
        },
        {
          href: "/bookmarks",
          icon: Bookmark,
          label: "Saved",
          active: pathname === "/bookmarks",
        },
        {
          href: "/notifications",
          icon: Bell,
          label: "Notifications",
          active: pathname === "/notifications",
        },
        {
          href: "/chat",
          icon: MessageCircle,
          label: "Messages",
          active: pathname === "/chat",
        },
      ]
    : [];

  // Community type icons map
  const communityTypeIcons = {
    circle: Users,
    challenge: Zap,
    ritual: Moon,
    coven: Crown,
  };

  // Fetch user's joined communities
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

  const joinedCommunities = userCommunities?.data || [];

  return (
    <div className="h-full bg-background">
      <ScrollArea className="h-full">
        <div className="p-4 space-y-6">
          {/* Main Navigation */}
          <div className="space-y-1">
            <h2 className="px-3 mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Navigation
            </h2>
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium ${
                  item.active
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground border border-transparent"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Personal Section (for authenticated users) */}
          {isAuthenticated && (
            <div className="space-y-1">
              <h2 className="px-3 mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Personal
              </h2>
              {personalItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium ${
                    item.active
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground border border-transparent"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          )}

          {/* Communities Section */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-3 mb-3">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Communities
              </h2>
              {isAuthenticated && (
                <Link href="/communities/create">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 hover:bg-accent"
                    title="Create new community"
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </Link>
              )}
            </div>

            {isAuthenticated ? (
              <div className="space-y-1">
                {joinedCommunities.length === 0 ? (
                  <div className="px-3 py-4 text-center">
                    <Skull className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground mb-3">
                      No circles joined yet
                    </p>
                    <Link href="/communities">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full border-red-600/50 text-red-200 hover:bg-red-950/30"
                      >
                        Explore Circles
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <>
                    {joinedCommunities.slice(0, 3).map((community) => {
                      const IconComponent =
                        communityTypeIcons[community.type] || Users;
                      return (
                        <Link
                          key={community._id}
                          href={`/communities/${community._id}`}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 hover:bg-accent border border-transparent hover:border-border group"
                        >
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-900/50 to-purple-900/50 flex items-center justify-center flex-shrink-0">
                            <IconComponent className="w-4 h-4 text-red-200" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate group-hover:text-red-200 transition-colors">
                              {community.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {community.memberCount ||
                                community.stats?.memberCount ||
                                0}{" "}
                              members
                            </p>
                          </div>
                        </Link>
                      );
                    })}

                    {joinedCommunities.length > 3 && (
                      <Link
                        href="/communities"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm text-muted-foreground hover:bg-accent hover:text-foreground border border-transparent"
                      >
                        <Users className="w-4 h-4" />
                        <span>View All ({joinedCommunities.length})</span>
                      </Link>
                    )}

                    <Link
                      href="/communities"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sm text-muted-foreground hover:bg-accent hover:text-foreground border border-transparent"
                    >
                      <Globe className="w-4 h-4" />
                      <span>Explore Communities</span>
                    </Link>
                  </>
                )}
              </div>
            ) : (
              <div className="px-3 py-4 text-center">
                <p className="text-xs text-muted-foreground mb-3">
                  Sign in to join communities and see your personalized feed
                </p>
                <Button asChild size="sm" className="w-full rounded-lg">
                  <Link href="/login">Sign In</Link>
                </Button>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          {/* {isAuthenticated && (
            <div className="pt-4 border-t border-border">
              <Button
                asChild
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg h-10 font-medium"
              >
                <Link
                  href="/create"
                  className="flex items-center justify-center gap-2"
                >
                  <PenTool className="w-4 h-4" />
                  <span>Create Story</span>
                </Link>
              </Button>
            </div>
          )} */}
        </div>
      </ScrollArea>
    </div>
  );
};

export default DashboardSidebar;
