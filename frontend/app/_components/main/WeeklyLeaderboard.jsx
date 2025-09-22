"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Crown, Trophy, Medal, Star, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Arrow } from "@radix-ui/react-dropdown-menu";

const WeeklyLeaderboard = () => {
  const { data: leaderboardData, isLoading } = useQuery({
    queryKey: ["weekly-leaderboard"],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/engagement/leaderboard/weekly?limit=3`
      );
      if (!response.ok) throw new Error("Failed to fetch leaderboard");
      return response.json();
    },
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000,
  });

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="w-4 h-4 text-primary" />;
      case 2:
        return <Trophy className="w-4 h-4 text-foreground" />;
      case 3:
        return <Medal className="w-4 h-4 text-muted-foreground" />;
      default:
        return <Star className="w-4 h-4 text-primary" />;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return "text-primary border-primary/20";
      case 2:
        return "text-foreground border-border";
      case 3:
        return "text-muted-foreground border-border";
      default:
        return "text-primary border-primary/20";
    }
  };

  if (isLoading) {
    return (
      <Card className="evidark-card border-none rounded-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Crown className="w-4 h-4 text-primary" />
            Weekly Leaders
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-8 h-8 bg-secondary rounded-full animate-pulse"></div>
              <div className="flex-1 space-y-1">
                <div className="w-20 h-3 bg-secondary rounded animate-pulse"></div>
                <div className="w-16 h-2 bg-secondary rounded animate-pulse"></div>
              </div>
              <div className="w-8 h-4 bg-secondary rounded animate-pulse"></div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const leaders = leaderboardData?.data || [];

  if (leaders.length === 0) {
    return (
      <Card className="evidark-card border-none rounded-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Crown className="w-4 h-4 text-primary" />
            Weekly Leaders
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-6">
          <p className="text-xs text-muted-foreground">
            No weekly activity yet
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Be the first to earn XP this week!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="evidark-card border-none rounded-xl">
      <CardHeader className="pb-0">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <Crown className="w-4 h-4 text-primary" />
          Weekly Leaders
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {leaders.map((leader, index) => {
          const rank = index + 1;
          const user = leader.user;

          return (
            <Link
              key={leader._id}
              href={`/user/${user.username}`}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors group"
            >
              <div className="flex items-center justify-center w-6 h-6">
                {getRankIcon(rank)}
              </div>

              <Avatar className="h-8 w-8 border border-border group-hover:border-primary/40 transition-colors">
                <AvatarImage src={user.avatar} />
                <AvatarFallback className="bg-secondary text-xs">
                  {user.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium text-foreground truncate">
                    {user.name}
                  </span>
                  {user.verified && (
                    <Badge
                      variant="outline"
                      className="text-xs px-1 py-0 h-4 text-primary border-primary/20"
                    >
                      ✓
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  @{user.username}
                </p>
              </div>

              <div className="text-right">
                <div className="text-xs font-medium text-foreground">
                  {leader.weeklyXP.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">XP</div>
              </div>
            </Link>
          );
        })}

        {/* View all link */}
        <div className="pt-2">
          <Link
            href="/leaderboard"
            className="block text-xs text-red-500 hover:underline transition-colors"
          >
            View Full Leaderboard
            <ArrowRight className="inline-block w-4 h-4 ml-1" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeeklyLeaderboard;
