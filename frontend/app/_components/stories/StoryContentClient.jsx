"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LogIn, Lock, Eye, EyeOff } from "lucide-react";
import { Roboto_Slab } from "next/font/google";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-hot-toast";
import Link from "next/link";

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
            className="prose prose-invert prose-xl max-w-none 
                      leading-[1.65] tracking-[0.01em] text-stone-300
                      [&>*]:mb-6 [&>*:last-child]:mb-0
                      [&>p]:text-[1.125rem] [&>p]:leading-[1.7] [&>p]:mb-6 [&>p]:text-stone-300
                      [&>h1]:text-3xl [&>h1]:font-bold [&>h1]:leading-[1.25] [&>h1]:mb-8 [&>h1]:mt-12 [&>h1:first-child]:mt-0 [&>h1]:text-stone-200
                      [&>h2]:text-2xl [&>h2]:font-semibold [&>h2]:leading-[1.35] [&>h2]:mb-6 [&>h2]:mt-10 [&>h2]:text-stone-200
                      [&>h3]:text-xl [&>h3]:font-medium [&>h3]:leading-[1.45] [&>h3]:mb-4 [&>h3]:mt-8 [&>h3]:text-stone-200
                      [&>h4]:text-lg [&>h4]:font-medium [&>h4]:leading-[1.45] [&>h4]:mb-4 [&>h4]:mt-6 [&>h4]:text-stone-300
                      [&>h5]:text-base [&>h5]:font-medium [&>h5]:leading-[1.55] [&>h5]:mb-3 [&>h5]:mt-5 [&>h5]:text-stone-300
                      [&>h6]:text-sm [&>h6]:font-medium [&>h6]:leading-[1.55] [&>h6]:mb-3 [&>h6]:mt-4 [&>h6]:text-stone-300
                      [&>ul]:mb-6 [&>ol]:mb-6 [&>ul>li]:mb-2 [&>ol>li]:mb-2
                      [&>blockquote]:pl-6 [&>blockquote]:py-2 [&>blockquote]:mb-6
                      [&>blockquote]:italic [&>blockquote]:text-stone-500
                      [&>code]:bg-stone-800/50 [&>code]:px-2 [&>code]:py-1 [&>code]:rounded [&>code]:text-sm [&>code]:text-stone-300
                      [&>pre]:bg-stone-800/30 [&>pre]:p-4 [&>pre]:rounded-lg [&>pre]:mb-6 [&>pre]:overflow-x-auto [&>pre]:text-stone-300
                      [&>img]:rounded-none [&>img]:mb-6 [&>img]:shadow-none [&>img]:border-none [&>img]:outline-none
                      [&>hr]:border-stone-700 [&>hr]:my-8
                      [&>table]:mb-6 [&>table]:border-collapse [&>table]:w-full
                      [&>table_th]:px-4 [&>table_th]:py-2 [&>table_th]:text-stone-300
                      [&>table_td]:px-4 [&>table_td]:py-2 [&>table_td]:text-stone-300
                      [&_strong]:font-semibold [&_strong]:text-stone-200 [&_em]:italic [&_em]:text-stone-300
                      [&_a]:text-blue-500 [&_a]:underline [&_a]:decoration-1 [&_a]:underline-offset-2
                      [&_a:hover]:decoration-2 [&_a:hover]:text-blue-400"
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
            className="prose prose-invert prose-xl max-w-none 
                      leading-[1.65] tracking-[0.01em] text-stone-300
                      [&>*]:mb-6 [&>*:last-child]:mb-0
                      [&>p]:text-[1.125rem] [&>p]:leading-[1.7] [&>p]:mb-6 [&>p]:text-stone-300
                      [&>h1]:text-3xl [&>h1]:font-bold [&>h1]:leading-[1.25] [&>h1]:mb-8 [&>h1]:mt-12 [&>h1:first-child]:mt-0 [&>h1]:text-stone-200
                      [&>h2]:text-2xl [&>h2]:font-semibold [&>h2]:leading-[1.35] [&>h2]:mb-6 [&>h2]:mt-10 [&>h2]:text-stone-200
                      [&>h3]:text-xl [&>h3]:font-medium [&>h3]:leading-[1.45] [&>h3]:mb-4 [&>h3]:mt-8 [&>h3]:text-stone-200
                      [&>h4]:text-lg [&>h4]:font-medium [&>h4]:leading-[1.45] [&>h4]:mb-4 [&>h4]:mt-6 [&>h4]:text-stone-300
                      [&>h5]:text-base [&>h5]:font-medium [&>h5]:leading-[1.55] [&>h5]:mb-3 [&>h5]:mt-5 [&>h5]:text-stone-300
                      [&>h6]:text-sm [&>h6]:font-medium [&>h6]:leading-[1.55] [&>h6]:mb-3 [&>h6]:mt-4 [&>h6]:text-stone-300
                      [&>ul]:mb-6 [&>ol]:mb-6 [&>ul>li]:mb-2 [&>ol>li]:mb-2
                      [&>blockquote]:pl-6 [&>blockquote]:py-2 [&>blockquote]:mb-6
                      [&>blockquote]:italic [&>blockquote]:text-stone-500
                      [&>code]:bg-stone-800/50 [&>code]:px-2 [&>code]:py-1 [&>code]:rounded [&>code]:text-sm [&>code]:text-stone-300
                      [&>pre]:bg-stone-800/30 [&>pre]:p-4 [&>pre]:rounded-lg [&>pre]:mb-6 [&>pre]:overflow-x-auto [&>pre]:text-stone-300
                      [&>img]:rounded-none [&>img]:mb-6 [&>img]:shadow-none [&>img]:border-none [&>img]:outline-none
                      [&>hr]:border-stone-700 [&>hr]:my-8
                      [&>table]:mb-6 [&>table]:border-collapse [&>table]:w-full
                      [&>table_th]:px-4 [&>table_th]:py-2 [&>table_th]:text-stone-300
                      [&>table_td]:px-4 [&>table_td]:py-2 [&>table_td]:text-stone-300
                      [&_strong]:font-semibold [&_strong]:text-stone-200 [&_em]:italic [&_em]:text-stone-300
                      [&_a]:text-blue-500 [&_a]:underline [&_a]:decoration-1 [&_a]:underline-offset-2
                      [&_a:hover]:decoration-2 [&_a:hover]:text-blue-400 mb-6"
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
              className="prose prose-invert prose-xl max-w-none 
                        leading-[1.65] tracking-[0.01em] text-stone-400/30
                        [&>*]:mb-6 [&>*:last-child]:mb-0
                        [&>p]:text-[1.125rem] [&>p]:leading-[1.7] [&>p]:mb-6 [&>p]:text-stone-400/30
                        [&>h1]:text-3xl [&>h1]:font-bold [&>h1]:leading-[1.25] [&>h1]:mb-8 [&>h1]:text-stone-300/30
                        [&>h2]:text-2xl [&>h2]:font-semibold [&>h2]:leading-[1.35] [&>h2]:mb-6 [&>h2]:text-stone-300/30
                        [&>h3]:text-xl [&>h3]:font-medium [&>h3]:leading-[1.45] [&>h3]:mb-4 [&>h3]:text-stone-300/30
                        [&_strong]:font-semibold [&_strong]:text-stone-300/30 [&_em]:italic [&_em]:text-stone-400/30"
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
