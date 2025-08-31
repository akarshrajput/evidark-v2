"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Crown } from "lucide-react";
import Link from "next/link";

export default function TrendingAuthors({ authors, isLoading }) {
  if (isLoading) {
    return (
      <Card className="professional-card border-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Crown className="w-5 h-5 text-yellow-400" />
            Trending Authors
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-2 animate-pulse">
              <div className="w-4 h-4 bg-muted/20 rounded"></div>
              <div className="w-8 h-8 bg-muted/20 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-muted/20 rounded mb-1"></div>
                <div className="h-3 bg-muted/20 rounded w-16"></div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="professional-card border-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Crown className="w-5 h-5 text-yellow-400" />
          Trending Authors
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {authors?.data?.slice(0, 5).map((author, index) => (
          <Link
            key={author._id || `author-${index}`}
            href={`/user/${author.username}`}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-all duration-200 group border-none shadow-sm shadow-black/20 hover:shadow-md hover:shadow-black/30"
          >
            <div className="text-xs text-muted-foreground font-mono">
              #{index + 1}
            </div>
            <Avatar className="w-8 h-8 border-none shadow-sm shadow-black/30 group-hover:shadow-md group-hover:shadow-black/40 transition-all duration-200">
              <AvatarImage src={author.photo} alt={author.name} />
              <AvatarFallback className="bg-gradient-to-br from-red-500 to-red-700 text-white text-xs">
                {author.name?.[0] || "A"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                {author.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {author.storiesCount || 0} stories
              </p>
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
