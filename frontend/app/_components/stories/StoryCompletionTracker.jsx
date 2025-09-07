"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useStoryCompletion } from "@/lib/engagementService";
import { toast } from "sonner";

const StoryCompletionTracker = ({ storyId, children }) => {
  const { isAuthenticated } = useAuth();
  const { trackCompletion } = useStoryCompletion();
  const [hasTrackedCompletion, setHasTrackedCompletion] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(false);
  const contentRef = useRef(null);
  const timeSpentRef = useRef(0);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    if (!isAuthenticated || !storyId) return;

    startTimeRef.current = Date.now();

    const handleScroll = () => {
      if (!contentRef.current) return;

      const element = contentRef.current;
      const scrollTop = element.scrollTop;
      const scrollHeight = element.scrollHeight;
      const clientHeight = element.clientHeight;

      // Check if user is near the bottom (within 100px)
      const nearBottom = scrollTop + clientHeight >= scrollHeight - 100;
      setIsNearBottom(nearBottom);

      // Track completion when user reaches near the bottom and has spent enough time
      if (nearBottom && !hasTrackedCompletion) {
        const timeSpent = (Date.now() - startTimeRef.current) / 1000; // in seconds

        // Only track if user spent at least 15 seconds reading
        if (timeSpent >= 15) {
          handleTrackCompletion();
        }
      }
    };

    const element = contentRef.current;
    if (element) {
      element.addEventListener("scroll", handleScroll, { passive: true });

      // Also track on window scroll for cases where content is in main window
      window.addEventListener("scroll", handleScroll, { passive: true });

      return () => {
        element.removeEventListener("scroll", handleScroll);
        window.removeEventListener("scroll", handleScroll);
      };
    }
  }, [isAuthenticated, storyId, hasTrackedCompletion]);

  // Alternative completion tracking when component unmounts (user leaves page)
  useEffect(() => {
    return () => {
      if (!hasTrackedCompletion && isAuthenticated && storyId) {
        const timeSpent = (Date.now() - startTimeRef.current) / 1000;

        // Track if user spent significant time (30+ seconds) even if didn't scroll to bottom
        if (timeSpent >= 30) {
          trackCompletion(storyId);
        }
      }
    };
  }, [hasTrackedCompletion, isAuthenticated, storyId, trackCompletion]);

  const handleTrackCompletion = async () => {
    if (hasTrackedCompletion || !isAuthenticated) return;

    setHasTrackedCompletion(true);

    try {
      const result = await trackCompletion(storyId);

      if (result?.success && result.xpGained > 0) {
        toast.success(`Story completed! +${result.xpGained} XP earned`, {
          description: `Total XP: ${result.totalXP?.toLocaleString() || "N/A"}`,
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Error tracking story completion:", error);
    }
  };

  return (
    <div ref={contentRef} className="relative">
      {children}

      {/* Visual indicator for completion (optional) */}
      {isAuthenticated && isNearBottom && !hasTrackedCompletion && (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="bg-green-600 text-white px-3 py-2 rounded-lg shadow-lg text-sm animate-pulse">
            📖 Story completion tracked!
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryCompletionTracker;
