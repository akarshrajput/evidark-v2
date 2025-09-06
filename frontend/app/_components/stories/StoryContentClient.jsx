"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LogIn, Lock, Eye, EyeOff } from "lucide-react";
import { Roboto_Slab } from "next/font/google";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-hot-toast";
import Link from "next/link";

const merriweather = Roboto_Slab({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
});

export default function StoryContentClient({ initialStory }) {
  const { user, isAuthenticated, loading } = useAuth();
  const [story, setStory] = useState(initialStory);
  const [viewCounted, setViewCounted] = useState(false);
  const [contentLoaded, setContentLoaded] = useState(
    !!initialStory.content && !initialStory.requiresAuth
  );
  const [fetchingContent, setFetchingContent] = useState(false);

  // If story already has content and doesn't require auth, show it immediately
  const shouldShowContent = story.content && !story.requiresAuth;

  // For authenticated users, if we have content or are in the process of fetching it
  const shouldShowContentForAuth =
    !loading && isAuthenticated && (shouldShowContent || fetchingContent);

  // Set content as loaded once auth state is resolved
  useEffect(() => {
    if (!loading) {
      setContentLoaded(true);
    }
  }, [loading]);

  // Track view for authenticated users only
  useEffect(() => {
    if (
      !loading &&
      isAuthenticated &&
      !viewCounted &&
      story?._id &&
      shouldShowContent
    ) {
      const trackView = async () => {
        try {
          const baseUrl =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";
          const token = localStorage.getItem("token");

          const response = await fetch(
            `${baseUrl}/api/v1/stories/${story._id}/view`,
            {
              method: "POST",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            console.log("View tracking result:", data);
            setViewCounted(true);
          }
        } catch (error) {
          console.error("Error tracking view:", error);
        }
      };

      // Delay view tracking to ensure user actually viewed the content
      const timer = setTimeout(trackView, 3000);
      return () => clearTimeout(timer);
    }
  }, [loading, isAuthenticated, viewCounted, story?._id, shouldShowContent]);

  // Show content immediately if available
  if (shouldShowContent || shouldShowContentForAuth) {
    return (
      <div className="bg-background/30 backdrop-blur-sm rounded-lg p-8 mb-8">
        {shouldShowContent && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sm text-green-400">
              <Eye className="w-4 h-4" />
            </div>
            {viewCounted && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <EyeOff className="w-3 h-3" />
                <span>View counted</span>
              </div>
            )}
          </div>
        )}

        {fetchingContent && !shouldShowContent ? (
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted/20 rounded w-3/4"></div>
            <div className="h-4 bg-muted/20 rounded w-1/2"></div>
            <div className="h-4 bg-muted/20 rounded w-5/6"></div>
          </div>
        ) : (
          <article
            className={`${merriweather.className} prose prose-invert prose-lg max-w-none leading-relaxed text-lg`}
            dangerouslySetInnerHTML={{ __html: story.content }}
          />
        )}
      </div>
    );
  }

  // Don't show anything until we know the auth status to prevent flash
  if (
    loading ||
    isAuthenticated === undefined ||
    (!contentLoaded && !fetchingContent)
  ) {
    return (
      <div className="bg-background/30 backdrop-blur-sm rounded-lg p-8 mb-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted/20 rounded w-3/4"></div>
          <div className="h-4 bg-muted/20 rounded w-1/2"></div>
          <div className="h-4 bg-muted/20 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  // User is confirmed not authenticated - show login prompt
  if (!loading && !isAuthenticated) {
    return (
      <div className="bg-background/30 backdrop-blur-sm rounded-lg p-8 mb-8">
        {/* Show preview content */}
        {story.contentPreview && (
          <div
            className={`${merriweather.className} prose prose-invert prose-lg max-w-none leading-relaxed text-lg mb-6`}
          >
            <div dangerouslySetInnerHTML={{ __html: story.contentPreview }} />
          </div>
        )}

        {/* Authentication required overlay */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent z-10 flex items-center justify-center">
            <div className="bg-red-950/30 backdrop-blur-sm border border-red-600/30 rounded-lg p-6 text-center">
              <Lock className="w-12 h-12 mx-auto mb-4 text-red-400" />
              <h3 className="text-xl font-bold mb-2 text-red-200">
                Dark Content Locked
              </h3>
              <p className="text-red-300/80 mb-4">
                Sign in to read the full dark tale and unlock all features
              </p>
              <div className="flex gap-3 justify-center">
                <Link href="/login">
                  <Button className="bg-red-600 hover:bg-red-700 text-white border-none">
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    variant="outline"
                    className="border-red-600/50 text-red-200 hover:bg-red-950/30"
                  >
                    Join EviDark
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Blurred content behind */}
          <div className="filter blur-sm pointer-events-none select-none">
            <div
              className={`${merriweather.className} prose prose-invert prose-lg max-w-none leading-relaxed text-lg opacity-30`}
            >
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua...
              </p>
              <p>
                Duis aute irure dolor in reprehenderit in voluptate velit esse
                cillum dolore eu fugiat nulla pariatur...
              </p>
              <p>
                Sed ut perspiciatis unde omnis iste natus error sit voluptatem
                accusantium doloremque laudantium...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // This should not be reached, but fallback just in case
  return null;
}
