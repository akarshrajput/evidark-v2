"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Crown, Trophy, Medal, Star, Calendar, Infinity } from "lucide-react";
import Link from "next/link";

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState("weekly");

  const { data: weeklyData, isLoading: weeklyLoading } = useQuery({
    queryKey: ["leaderboard-weekly"],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/engagement/leaderboard/weekly?limit=25`
      );
      if (!response.ok) throw new Error("Failed to fetch weekly leaderboard");
      return response.json();
    },
    enabled: activeTab === "weekly",
  });

  const { data: allTimeData, isLoading: allTimeLoading } = useQuery({
    queryKey: ["leaderboard-alltime"],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/engagement/leaderboard/alltime?limit=25`
      );
      if (!response.ok) throw new Error("Failed to fetch all-time leaderboard");
      return response.json();
    },
    enabled: activeTab === "alltime",
  });

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-400" />;
      case 2:
        return <Trophy className="w-5 h-5 text-gray-300" />;
      case 3:
        return <Medal className="w-5 h-5 text-orange-400" />;
      default:
        return <Star className="w-5 h-5 text-blue-400" />;
    }
  };

  const getRankBg = (rank) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-900/20 to-yellow-800/20 border-yellow-400/30";
      case 2:
        return "bg-gradient-to-r from-gray-900/20 to-gray-800/20 border-gray-400/30";
      case 3:
        return "bg-gradient-to-r from-orange-900/20 to-orange-800/20 border-orange-400/30";
      default:
        return "evidark-card border-border";
    }
  };

  const currentData = activeTab === "weekly" ? weeklyData : allTimeData;
  const isLoading = activeTab === "weekly" ? weeklyLoading : allTimeLoading;
  const leaders = currentData?.data || [];

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-foreground">Leaderboard</h1>
        <p className="text-muted-foreground">See who's leading the darkness</p>

        {/* Tabs */}
        <div className="flex justify-center gap-2">
          <Button
            variant={activeTab === "weekly" ? "default" : "outline"}
            onClick={() => setActiveTab("weekly")}
            className="flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            Weekly
          </Button>
          <Button
            variant={activeTab === "alltime" ? "default" : "outline"}
            onClick={() => setActiveTab("alltime")}
            className="flex items-center gap-2"
          >
            <Infinity className="w-4 h-4" />
            All Time
          </Button>
        </div>
      </div>

      {/* Leaderboard */}
      <Card className="evidark-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Crown className="w-5 h-5 text-primary" />
            {activeTab === "weekly" ? "Weekly Champions" : "All-Time Legends"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 bg-secondary/30 rounded-lg animate-pulse"
                >
                  <div className="w-8 h-8 bg-secondary rounded-full"></div>
                  <div className="w-12 h-12 bg-secondary rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="w-32 h-4 bg-secondary rounded"></div>
                    <div className="w-24 h-3 bg-secondary rounded"></div>
                  </div>
                  <div className="w-16 h-4 bg-secondary rounded"></div>
                </div>
              ))}
            </div>
          ) : leaders.length > 0 ? (
            <div className="space-y-3">
              {leaders.map((leader, index) => {
                const rank = index + 1;
                const user = leader.user;
                const xp =
                  activeTab === "weekly" ? leader.weeklyXP : leader.totalXP;

                return (
                  <div
                    key={leader._id}
                    className={`flex items-center gap-4 p-4 rounded-lg border transition-all hover:bg-secondary/50 ${getRankBg(
                      rank
                    )}`}
                  >
                    {/* Rank */}
                    <div className="flex items-center justify-center w-8 h-8">
                      {rank <= 3 ? (
                        getRankIcon(rank)
                      ) : (
                        <span className="text-lg font-bold text-muted-foreground">
                          #{rank}
                        </span>
                      )}
                    </div>

                    {/* User Avatar */}
                    <Link href={`/user/${user.username}`}>
                      <Avatar className="h-12 w-12 border-2 border-border hover:border-primary/40 transition-colors">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback className="bg-secondary text-foreground">
                          {user.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                    </Link>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <Link href={`/user/${user.username}`} className="group">
                        <div className="flex items-center gap-2">
                          <h3 className="text-foreground font-semibold group-hover:text-primary transition-colors truncate">
                            {user.name}
                          </h3>
                          {user.verified && (
                            <Badge
                              variant="outline"
                              className="text-xs px-1.5 py-0 h-5 text-primary border-primary/20"
                            >
                              ✓
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground text-sm truncate">
                          @{user.username}
                        </p>
                      </Link>
                    </div>

                    {/* Stats */}
                    <div className="text-right">
                      <div className="text-foreground font-bold text-lg">
                        {xp.toLocaleString()}
                      </div>
                      <div className="text-muted-foreground text-sm">
                        {activeTab === "weekly" ? "Weekly XP" : "Total XP"}
                      </div>
                      {activeTab === "alltime" && leader.level && (
                        <div className="text-primary text-xs">
                          Level {leader.level}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Crown className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-muted-foreground text-lg mb-2">
                No rankings yet
              </h3>
              <p className="text-muted-foreground/70">
                {activeTab === "weekly"
                  ? "Be the first to earn XP this week!"
                  : "Be the first to join the leaderboard!"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
