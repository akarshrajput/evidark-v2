"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, Zap, Crown, Target, TrendingUp } from "lucide-react";
import Link from "next/link";

const UserRankIndicator = () => {
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const { data: engagementData, isLoading } = useQuery({
    queryKey: ["user-engagement"],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/engagement/me`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch engagement data");
      return response.json();
    },
    enabled: isAuthenticated,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  if (!isAuthenticated || isLoading || !engagementData?.data) {
    return null;
  }

  const engagement = engagementData.data;
  const level = engagement.level || 1;
  const weeklyRank = engagement.weeklyRank;
  const totalXP = engagement.totalXP || 0;
  const weeklyXP = engagement.weeklyXP || 0;

  // Calculate next level XP
  const nextLevelXP = Math.pow(level, 2) * 100;
  const currentLevelXP = Math.pow(level - 1, 2) * 100;
  const progressToNextLevel =
    ((totalXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

  // Get highest badge
  const getHighestBadge = () => {
    if (!engagement.badges || engagement.badges.length === 0) return null;

    const badgeHierarchy = {
      platinum: 4,
      gold: 3,
      silver: 2,
      bronze: 1,
      special: 5,
    };

    return engagement.badges.reduce((highest, badge) => {
      const currentLevel = badgeHierarchy[badge.type] || 1;
      const highestLevel = badgeHierarchy[highest?.type] || 0;
      return currentLevel > highestLevel ? badge : highest;
    }, null);
  };

  const highestBadge = getHighestBadge();

  // Determine what to show as main indicator
  const getMainIndicator = () => {
    if (weeklyRank && weeklyRank <= 10) {
      return {
        type: "rank",
        value: weeklyRank,
        icon: Crown,
        color:
          weeklyRank === 1
            ? "text-primary"
            : weeklyRank <= 3
            ? "text-foreground"
            : "text-muted-foreground",
        bg:
          weeklyRank === 1
            ? "bg-primary/10"
            : weeklyRank <= 3
            ? "bg-secondary/50"
            : "bg-secondary/30",
      };
    }

    if (highestBadge) {
      const badgeColors = {
        platinum: { color: "text-primary", bg: "bg-primary/10" },
        gold: { color: "text-primary", bg: "bg-primary/10" },
        silver: { color: "text-foreground", bg: "bg-secondary/50" },
        bronze: { color: "text-muted-foreground", bg: "bg-secondary/30" },
        special: { color: "text-primary", bg: "bg-primary/10" },
      };

      return {
        type: "badge",
        badge: highestBadge,
        icon: Star,
        ...badgeColors[highestBadge.type],
      };
    }

    // Default to level
    return {
      type: "level",
      value: level,
      icon: Zap,
      color: "text-primary",
      bg: "bg-primary/10",
    };
  };

  const mainIndicator = getMainIndicator();
  const IconComponent = mainIndicator.icon;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`evidark-btn-secondary h-8 px-2 gap-1.5 ${mainIndicator.bg} ${mainIndicator.color} border border-border hover:border-primary/40 transition-all rounded-lg`}
        >
          <IconComponent className="w-3.5 h-3.5" />
          {mainIndicator.type === "rank" && (
            <span className="text-xs font-bold">#{mainIndicator.value}</span>
          )}
          {mainIndicator.type === "level" && (
            <span className="text-xs font-medium">L{mainIndicator.value}</span>
          )}
          {mainIndicator.type === "badge" && (
            <span className="text-xs font-medium">
              {mainIndicator.badge.icon}
            </span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-80 p-4 evidark-card border-border"
        align="end"
      >
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-foreground">Your Progress</h3>
              <p className="text-xs text-muted-foreground">
                Level {level} • {totalXP.toLocaleString()} XP
              </p>
            </div>
            <Link href="/progress" onClick={() => setIsOpen(false)}>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:text-primary/80"
              >
                View Details
              </Button>
            </Link>
          </div>

          {/* Weekly Rank */}
          {weeklyRank && (
            <div className="flex items-center justify-between py-2 px-3 bg-secondary/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">
                  Weekly Rank
                </span>
              </div>
              <Badge
                variant="outline"
                className="text-primary border-primary/20"
              >
                #{weeklyRank}
              </Badge>
            </div>
          )}

          {/* Level Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Level Progress</span>
              <span className="text-muted-foreground">
                {totalXP - currentLevelXP}/{nextLevelXP - currentLevelXP} XP
              </span>
            </div>
            <Progress
              value={Math.min(100, Math.max(0, progressToNextLevel))}
              className="h-2 bg-secondary"
            />
          </div>

          {/* Weekly Stats */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-secondary/30 p-2 rounded">
              <div className="text-primary font-semibold">{weeklyXP}</div>
              <div className="text-muted-foreground">Weekly XP</div>
            </div>
            <div className="bg-secondary/30 p-2 rounded">
              <div className="text-primary font-semibold">
                {engagement.weeklyStoriesCreated || 0}
              </div>
              <div className="text-muted-foreground">Stories Created</div>
            </div>
          </div>

          {/* Latest Badge */}
          {highestBadge && (
            <div className="flex items-center gap-2 py-2 px-3 bg-secondary/30 rounded-lg">
              <span className="text-lg">{highestBadge.icon}</span>
              <div>
                <div className="text-sm font-medium text-foreground">
                  {highestBadge.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {highestBadge.description}
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex gap-2 pt-2 border-t border-border">
            <Link
              href="/create"
              className="flex-1"
              onClick={() => setIsOpen(false)}
            >
              <Button size="sm" className="w-full evidark-btn-primary">
                <Target className="w-3.5 h-3.5 mr-1" />
                Create Story
              </Button>
            </Link>
            <Link href="/trending" onClick={() => setIsOpen(false)}>
              <Button
                variant="outline"
                size="sm"
                className="evidark-btn-secondary border-border"
              >
                <TrendingUp className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default UserRankIndicator;
