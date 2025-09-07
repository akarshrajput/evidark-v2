"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Trophy,
  Star,
  Zap,
  Crown,
  Target,
  TrendingUp,
  BookOpen,
  MessageCircle,
  Eye,
  Calendar,
  Award,
  Activity,
  BarChart3,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

export default function UserProgressPage() {
  const { user, isAuthenticated } = useAuth();

  const { data: progressData, isLoading } = useQuery({
    queryKey: ["user-progress"],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/engagement/progress`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch progress data");
      return response.json();
    },
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="max-w-6xl mx-auto py-8">
        <Card className="evidark-card border-border">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              Please sign in to view your progress.
            </p>
            <Link href="/login" className="text-primary hover:text-primary/80">
              Sign In
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-32 bg-secondary rounded-lg"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-secondary rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!progressData?.data) {
    return (
      <div className="max-w-6xl mx-auto py-8">
        <Card className="evidark-card border-border">
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              Unable to load progress data.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progress = progressData.data;
  const {
    level,
    totalXP,
    weeklyXP,
    weeklyRank,
    totalRank,
    totalUsers,
    badges,
    recentActivities,
  } = progress;

  // Calculate level progress
  const currentLevelXP = level * 1000;
  const nextLevelXP = (level + 1) * 1000;
  const progressToNextLevel = Math.min(
    ((totalXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100,
    100
  );

  const percentile = Math.round(
    ((totalUsers - totalRank + 1) / totalUsers) * 100
  );

  const getBadgeIcon = (type) => {
    switch (type) {
      case "first_story":
        return <BookOpen className="w-4 h-4" />;
      case "story_master":
        return <Crown className="w-4 h-4" />;
      case "active_reader":
        return <Eye className="w-4 h-4" />;
      case "commentator":
        return <MessageCircle className="w-4 h-4" />;
      case "rising_star":
        return <Star className="w-4 h-4" />;
      case "weekly_champion":
        return <Trophy className="w-4 h-4" />;
      case "speed_reader":
        return <Zap className="w-4 h-4" />;
      case "engagement_king":
        return <Award className="w-4 h-4" />;
      default:
        return <Award className="w-4 h-4" />;
    }
  };

  const getBadgeColor = (type) => {
    switch (type) {
      case "first_story":
        return "text-blue-400 bg-blue-400/10 border-blue-400/20";
      case "story_master":
        return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
      case "active_reader":
        return "text-green-400 bg-green-400/10 border-green-400/20";
      case "commentator":
        return "text-purple-400 bg-purple-400/10 border-purple-400/20";
      case "rising_star":
        return "text-pink-400 bg-pink-400/10 border-pink-400/20";
      case "weekly_champion":
        return "text-orange-400 bg-orange-400/10 border-orange-400/20";
      case "speed_reader":
        return "text-cyan-400 bg-cyan-400/10 border-cyan-400/20";
      case "engagement_king":
        return "text-red-400 bg-red-400/10 border-red-400/20";
      default:
        return "text-primary bg-primary/10 border-primary/20";
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-8">
      {/* Main Stats Card */}
      <Card className="evidark-card border-border">
        <CardContent className="p-6">
          <div className="flex items-center gap-6 mb-6">
            <Avatar className="h-20 w-20 border-2 border-border">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="bg-secondary text-foreground text-xl">
                {user?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-2xl font-bold text-foreground">
                  {user?.name}
                </h2>
                {user?.verified && (
                  <Badge
                    variant="outline"
                    className="text-primary border-primary/20"
                  >
                    ✓
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">@{user?.username}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Level {level} Storyteller
              </p>
            </div>
          </div>

          {/* XP and Rank Display */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Zap className="w-5 h-5 text-primary" />
                <span className="text-2xl font-bold text-foreground">
                  {weeklyXP.toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">Weekly XP</p>
            </div>

            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Activity className="w-5 h-5 text-primary" />
                <span className="text-2xl font-bold text-foreground">
                  {totalXP.toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {totalXP.toLocaleString()} XP Total
              </p>
            </div>

            {weeklyRank && (
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Crown className="w-5 h-5 text-primary" />
                  <span className="text-2xl font-bold text-foreground">
                    #{weeklyRank}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">Weekly Rank</p>
              </div>
            )}

            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="text-2xl font-bold text-foreground">
                  Top {percentile}%
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                #{totalRank} of {totalUsers}
              </p>
            </div>
          </div>

          {/* Level Progress */}
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-foreground">
                Progress to Level {level + 1}
              </span>
              <span className="text-muted-foreground">
                {totalXP - currentLevelXP}/{nextLevelXP - currentLevelXP} XP
              </span>
            </div>
            <Progress value={progressToNextLevel} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="evidark-card border-border">
          <CardContent className="p-4 text-center">
            <BookOpen className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">
              {progress?.totalStoriesCreated || 0}
            </div>
            <p className="text-sm text-muted-foreground">Stories Created</p>
          </CardContent>
        </Card>

        <Card className="evidark-card border-border">
          <CardContent className="p-4 text-center">
            <Eye className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">
              {progress?.totalStoriesCompleted || 0}
            </div>
            <p className="text-sm text-muted-foreground">Stories Read</p>
          </CardContent>
        </Card>

        <Card className="evidark-card border-border">
          <CardContent className="p-4 text-center">
            <MessageCircle className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">
              {progress?.totalCommentsPosted || 0}
            </div>
            <p className="text-sm text-muted-foreground">Comments</p>
          </CardContent>
        </Card>

        <Card className="evidark-card border-border">
          <CardContent className="p-4 text-center">
            <Calendar className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">
              {progress?.streakDays || 0}
            </div>
            <p className="text-sm text-muted-foreground">Streak Days</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Badges */}
        <Card className="evidark-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Award className="w-5 h-5 text-primary" />
              Badges ({badges?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {badges && badges.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {badges.map((badge) => (
                  <div
                    key={badge.type}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${getBadgeColor(
                      badge.type
                    )}`}
                  >
                    {getBadgeIcon(badge.type)}
                    <div className="flex-1">
                      <h3 className="font-medium text-sm capitalize">
                        {badge.type.replace("_", " ")}
                      </h3>
                      <p className="text-xs opacity-80">
                        {formatDistanceToNow(new Date(badge.earnedAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Award className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No badges earned yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Start engaging to earn your first badge!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="evidark-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
              <BarChart3 className="w-5 h-5 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-80">
              {recentActivities && recentActivities.length > 0 ? (
                <div className="space-y-3">
                  {recentActivities.slice(0, 10).map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50"
                    >
                      <div className="p-1.5 rounded-full bg-primary/10">
                        {activity.type === "story_created" && (
                          <BookOpen className="w-3 h-3 text-primary" />
                        )}
                        {activity.type === "story_completed" && (
                          <Eye className="w-3 h-3 text-primary" />
                        )}
                        {activity.type === "comment_posted" && (
                          <MessageCircle className="w-3 h-3 text-primary" />
                        )}
                        {activity.type === "badge_earned" && (
                          <Award className="w-3 h-3 text-primary" />
                        )}
                        {activity.type === "level_up" && (
                          <Crown className="w-3 h-3 text-primary" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">
                          {activity.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          +{activity.xpGained} XP •{" "}
                          {formatDistanceToNow(new Date(activity.date), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">No recent activity</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Start creating stories and engaging with the community!
                  </p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
