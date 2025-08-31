"use client";

import { Eye, Users, Bookmark } from "lucide-react";
import { Creepster } from "next/font/google";

const creepster = Creepster({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-creepster",
});

export default function HeroSection({ stats, isLoading }) {
  if (isLoading) {
    return (
      <div className="relative overflow-hidden bg-background border-b border-border">
        <div className="container mx-auto px-6 py-16 relative">
          <div className="text-center mb-8 animate-pulse">
            <div className="h-16 bg-muted/20 rounded-lg mb-4 mx-auto max-w-md"></div>
            <div className="h-8 bg-muted/20 rounded-lg mb-6 mx-auto max-w-lg"></div>
            <div className="h-6 bg-muted/20 rounded-lg mb-8 mx-auto max-w-2xl"></div>
            <div className="flex items-center justify-center gap-6">
              <div className="h-4 bg-muted/20 rounded w-20"></div>
              <div className="h-4 bg-muted/20 rounded w-24"></div>
              <div className="h-4 bg-muted/20 rounded w-20"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-background border-b border-border">
      <div className="container mx-auto px-6 py-16 relative">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-red-500 via-orange-500 to-red-600 bg-clip-text text-transparent">
            EviDark
          </h1>
          <p className={`text-xl md:text-2xl mb-6 text-red-400 ${creepster.className}`}>
            Where Evidence Meets Darkness
          </p>
          <p className="text-lg text-muted-foreground mb-8">
            Uncover mysteries, share evidence-based narratives, and explore the shadows of truth
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span>{stats?.data?.totalViews?.toLocaleString() || "0"} Views</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>{stats?.data?.totalUsers?.toLocaleString() || "0"} Members</span>
            </div>
            <div className="flex items-center gap-2">
              <Bookmark className="w-4 h-4" />
              <span>{stats?.data?.totalStories?.toLocaleString() || "0"} Stories</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
