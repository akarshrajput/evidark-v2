"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
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

export default function StoryContent({ story }) {
  const { user, isAuthenticated } = useAuth();
  const [viewCounted, setViewCounted] = useState(false);

  // Track view for authenticated users only
  useEffect(() => {
    if (isAuthenticated && !viewCounted && story?._id) {
      const trackView = async () => {
        try {
          const baseUrl =
            process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";
          const token = localStorage.getItem("token");

          await fetch(`${baseUrl}/api/v1/stories/${story._id}/view`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          });

          setViewCounted(true);
        } catch (error) {
          console.error("Error tracking view:", error);
        }
      };

      // Delay view tracking slightly to ensure user actually viewed the content
      const timer = setTimeout(trackView, 2000);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, viewCounted, story?._id]);
  console.log(story);

  // If user is not authenticated, show restricted content
  if (!isAuthenticated || story.requiresAuth) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border mb-8">
        <CardContent className="p-8">
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
              <Card className="professional-card border-red-600/30 bg-red-950/20 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <Lock className="w-12 h-12 mx-auto mb-4 text-red-400" />
                  <h3 className="text-xl font-bold mb-2 text-red-200">
                    Dark Content Locked
                  </h3>
                  <p className="text-red-300/80 mb-4">
                    Sign in to read the full dark tale and unlock all features
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Link href="/login">
                      <Button className="bg-red-600 hover:bg-red-700 text-white">
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
                </CardContent>
              </Card>
            </div>

            {/* Blurred content behind */}
            <div className="filter blur-sm pointer-events-none select-none">
              <div
                className={`${merriweather.className} prose prose-invert prose-lg max-w-none leading-relaxed text-lg opacity-30`}
              >
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed
                  do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco
                  laboris nisi ut aliquip ex ea commodo consequat...
                </p>
                <p>
                  Duis aute irure dolor in reprehenderit in voluptate velit esse
                  cillum dolore eu fugiat nulla pariatur. Excepteur sint
                  occaecat cupidatat non proident, sunt in culpa qui officia
                  deserunt mollit anim id est laborum...
                </p>
                <p>
                  Sed ut perspiciatis unde omnis iste natus error sit voluptatem
                  accusantium doloremque laudantium, totam rem aperiam, eaque
                  ipsa quae ab illo inventore veritatis...
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Authenticated user - show full content
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border mb-8">
      <CardContent className="p-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-sm text-green-400">
            <Eye className="w-4 h-4" />
            <span>Full access granted</span>
          </div>
          {viewCounted && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <EyeOff className="w-3 h-3" />
              <span>View counted</span>
            </div>
          )}
        </div>

        <article
          className={`${merriweather.className} prose prose-invert prose-lg max-w-none leading-relaxed text-lg`}
          dangerouslySetInnerHTML={{ __html: story.content }}
        />
      </CardContent>
    </Card>
  );
}
