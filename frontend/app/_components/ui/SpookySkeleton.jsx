"use client";

import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gradient-to-r from-red-900/20 via-gray-800/40 to-red-900/20 bg-[length:200%_100%] animate-shimmer",
        className
      )}
      {...props}
    />
  );
}

function SpookyStoryCardSkeleton() {
  return (
    <div className="bg-card/50 backdrop-blur-sm border border-red-900/20 rounded-lg p-6 space-y-4 animate-pulse">
      <div className="flex items-start gap-4">
        {/* Avatar skeleton */}
        <Skeleton className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500/20 to-red-700/20" />
        
        <div className="flex-1 space-y-3">
          {/* Author info skeleton */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-24 bg-red-900/30" />
            <Skeleton className="h-4 w-4 rounded bg-red-900/30" />
            <Skeleton className="h-4 w-16 bg-red-900/30" />
            <Skeleton className="h-3 w-20 bg-red-900/20" />
          </div>

          {/* Title skeleton */}
          <Skeleton className="h-6 w-3/4 bg-gradient-to-r from-red-900/30 via-gray-800/30 to-red-900/30" />
          
          {/* Content skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-full bg-red-900/20" />
            <Skeleton className="h-4 w-5/6 bg-red-900/20" />
            <Skeleton className="h-4 w-4/6 bg-red-900/20" />
          </div>

          {/* Engagement metrics skeleton */}
          <div className="flex items-center gap-4">
            <Skeleton className="h-4 w-12 bg-red-900/20" />
            <Skeleton className="h-4 w-12 bg-red-900/20" />
            <Skeleton className="h-4 w-12 bg-red-900/20" />
            <Skeleton className="h-4 w-12 bg-red-900/20" />
          </div>

          {/* Tags skeleton */}
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16 rounded-full bg-red-900/20" />
            <Skeleton className="h-6 w-20 rounded-full bg-red-900/20" />
            <Skeleton className="h-6 w-14 rounded-full bg-red-900/20" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SpookySidebarSkeleton() {
  return (
    <div className="space-y-6">
      {/* Trending Authors Skeleton */}
      <div className="bg-card/50 backdrop-blur-sm border border-red-900/20 rounded-lg p-4">
        <Skeleton className="h-6 w-32 mb-4 bg-red-900/30" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-4 w-4 bg-red-900/30" />
              <Skeleton className="w-8 h-8 rounded-full bg-red-900/20" />
              <div className="flex-1">
                <Skeleton className="h-3 w-20 mb-1 bg-red-900/20" />
                <Skeleton className="h-2 w-16 bg-red-900/15" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Categories Skeleton */}
      <div className="bg-card/50 backdrop-blur-sm border border-red-900/20 rounded-lg p-4">
        <Skeleton className="h-6 w-28 mb-4 bg-red-900/30" />
        <div className="grid grid-cols-2 gap-2">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-8 rounded-full bg-red-900/20" />
          ))}
        </div>
      </div>

      {/* Events Skeleton */}
      <div className="bg-card/50 backdrop-blur-sm border border-red-900/20 rounded-lg p-4">
        <Skeleton className="h-6 w-24 mb-4 bg-red-900/30" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-3 rounded-lg bg-background/50 space-y-2">
              <Skeleton className="h-4 w-3/4 bg-red-900/20" />
              <Skeleton className="h-3 w-full bg-red-900/15" />
              <Skeleton className="h-3 w-1/2 bg-red-900/15" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SpookyHeroSkeleton() {
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-red-900/20 via-black/40 to-purple-900/20 border-b border-border animate-pulse">
      <div className="container mx-auto px-6 py-16 relative">
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Skeleton className="w-8 h-8 bg-red-900/30" />
            <Skeleton className="h-12 w-48 bg-gradient-to-r from-red-900/30 via-gray-800/30 to-red-900/30" />
            <Skeleton className="w-8 h-8 bg-red-900/30" />
          </div>
          <Skeleton className="h-6 w-96 mx-auto bg-red-900/20" />
          <div className="flex items-center justify-center gap-6">
            <Skeleton className="h-4 w-24 bg-red-900/20" />
            <Skeleton className="h-4 w-24 bg-red-900/20" />
            <Skeleton className="h-4 w-24 bg-red-900/20" />
          </div>
        </div>
      </div>
    </div>
  );
}

export { 
  Skeleton, 
  SpookyStoryCardSkeleton, 
  SpookySidebarSkeleton, 
  SpookyHeroSkeleton 
};
