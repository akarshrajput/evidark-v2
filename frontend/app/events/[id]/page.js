"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useParams, useRouter } from "next/navigation";
import { formatDistanceToNow, format } from "date-fns";
import {
  Calendar,
  Users,
  Clock,
  MapPin,
  Trophy,
  Eye,
  ArrowLeft,
  UserPlus,
  UserMinus,
  Send,
  Star,
  Award,
  Target,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import Link from "next/link";

export default function EventPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [submissionContent, setSubmissionContent] = useState("");

  // Fetch event details
  const {
    data: eventData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/events/${id}`,
        {
          headers: isAuthenticated
            ? {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              }
            : {},
        }
      );
      if (!response.ok) throw new Error("Failed to fetch event");
      return response.json();
    },
    enabled: !!id,
  });

  // Join event mutation
  const joinEventMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/events/${id}/join`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) throw new Error("Failed to join event");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["event", id]);
      toast.success("Successfully joined the event!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to join event");
    },
  });

  // Leave event mutation
  const leaveEventMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/events/${id}/leave`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!response.ok) throw new Error("Failed to leave event");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["event", id]);
      toast.success("Successfully left the event");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to leave event");
    },
  });

  // Submit to event mutation
  const submitMutation = useMutation({
    mutationFn: async (content) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/events/${id}/submit`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content }),
        }
      );
      if (!response.ok) throw new Error("Failed to submit");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["event", id]);
      setSubmissionContent("");
      toast.success("Submission successful!");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit");
    },
  });

  const event = eventData?.data;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-64 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Event Not Found
          </h1>
          <p className="text-muted-foreground mb-6">
            The event you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </p>
          <Link href="/events">
            <Button>Browse Events</Button>
          </Link>
        </div>
      </div>
    );
  }

  const getEventTypeIcon = (type) => {
    switch (type) {
      case "writing_challenge":
        return "✍️";
      case "dark_ritual":
        return "🕯️";
      case "community_gathering":
        return "👥";
      case "horror_showcase":
        return "🎭";
      case "midnight_reading":
        return "📖";
      case "story_contest":
        return "🏆";
      default:
        return "📅";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "upcoming":
        return "bg-blue-900/30 text-blue-200";
      case "active":
        return "bg-green-900/30 text-green-200";
      case "completed":
        return "bg-gray-900/30 text-gray-200";
      case "cancelled":
        return "bg-red-900/30 text-red-200";
      default:
        return "bg-gray-900/30 text-gray-200";
    }
  };

  const canSubmit =
    event.status === "active" && event.isParticipant && !event.userSubmission;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="h-6 w-px bg-border"></div>
          <Link href="/events">
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
            >
              All Events
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Header */}
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-8 shadow-lg">
              <div className="flex items-start gap-4 mb-6">
                <div className="text-4xl">{getEventTypeIcon(event.type)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className={getStatusColor(event.status)}>
                      {event.status.charAt(0).toUpperCase() +
                        event.status.slice(1)}
                    </Badge>
                    <Badge variant="outline" className="text-muted-foreground">
                      {event.type
                        .replace("_", " ")
                        .replace(/\b\w/g, (l) => l.toUpperCase())}
                    </Badge>
                  </div>
                  <h1 className="text-3xl font-bold text-foreground mb-3">
                    {event.title}
                  </h1>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    {event.description}
                  </p>
                </div>
              </div>

              {/* Event Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-3 bg-background/50 rounded-lg">
                  <Users className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                  <div className="text-lg font-semibold text-foreground">
                    {event.participants?.length || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Participants
                  </div>
                </div>
                <div className="text-center p-3 bg-background/50 rounded-lg">
                  <Send className="w-5 h-5 text-green-400 mx-auto mb-1" />
                  <div className="text-lg font-semibold text-foreground">
                    {event.submissions?.length || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Submissions
                  </div>
                </div>
                <div className="text-center p-3 bg-background/50 rounded-lg">
                  <Eye className="w-5 h-5 text-purple-400 mx-auto mb-1" />
                  <div className="text-lg font-semibold text-foreground">
                    {event.stats?.views || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Views</div>
                </div>
                <div className="text-center p-3 bg-background/50 rounded-lg">
                  <Trophy className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                  <div className="text-lg font-semibold text-foreground">
                    {event.rewards?.points || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Points</div>
                </div>
              </div>

              {/* Action Buttons */}
              {isAuthenticated && (
                <div className="flex gap-3">
                  {event.isParticipant ? (
                    <Button
                      variant="outline"
                      onClick={() => leaveEventMutation.mutate()}
                      disabled={leaveEventMutation.isPending}
                      className="border-red-600/50 text-red-200 hover:bg-red-950/30"
                    >
                      <UserMinus className="w-4 h-4 mr-2" />
                      {leaveEventMutation.isPending
                        ? "Leaving..."
                        : "Leave Event"}
                    </Button>
                  ) : event.canJoin ? (
                    <Button
                      onClick={() => joinEventMutation.mutate()}
                      disabled={joinEventMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      {joinEventMutation.isPending
                        ? "Joining..."
                        : "Join Event"}
                    </Button>
                  ) : (
                    <Button disabled variant="outline">
                      Event Full
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Event Details */}
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                Event Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-green-400" />
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Start Date
                      </div>
                      <div className="font-medium text-foreground">
                        {format(new Date(event.startDate), "PPP p")}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-red-400" />
                    <div>
                      <div className="text-sm text-muted-foreground">
                        End Date
                      </div>
                      <div className="font-medium text-foreground">
                        {format(new Date(event.endDate), "PPP p")}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-purple-400" />
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Max Participants
                      </div>
                      <div className="font-medium text-foreground">
                        {event.maxParticipants || "Unlimited"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-yellow-400" />
                    <div>
                      <div className="text-sm text-muted-foreground">
                        Created By
                      </div>
                      <div className="font-medium text-foreground">
                        {event.createdBy?.fullName || event.createdBy?.username}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Requirements */}
              {event.requirements && (
                <div className="mt-6 p-4 bg-background/50 rounded-lg">
                  <h3 className="font-semibold text-foreground mb-2">
                    Requirements
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {event.requirements.description ||
                      "No specific requirements"}
                  </p>
                  {event.requirements.minReputation > 0 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Minimum reputation: {event.requirements.minReputation}
                    </p>
                  )}
                </div>
              )}

              {/* Rewards */}
              {event.rewards && (
                <div className="mt-4 p-4 bg-gradient-to-r from-yellow-950/20 to-orange-950/20 border border-yellow-800/30 rounded-lg">
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-yellow-400" />
                    Rewards
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {event.rewards.description ||
                      `Earn ${event.rewards.points} points for participation`}
                  </p>
                </div>
              )}
            </div>

            {/* Submission Section */}
            {canSubmit && (
              <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 shadow-lg">
                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Send className="w-5 h-5 text-green-400" />
                  Submit Your Entry
                </h2>

                <div className="space-y-4">
                  <Textarea
                    placeholder="Enter your submission content here..."
                    value={submissionContent}
                    onChange={(e) => setSubmissionContent(e.target.value)}
                    className="min-h-32 bg-background/50"
                  />
                  <Button
                    onClick={() => submitMutation.mutate(submissionContent)}
                    disabled={
                      !submissionContent.trim() || submitMutation.isPending
                    }
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {submitMutation.isPending
                      ? "Submitting..."
                      : "Submit Entry"}
                  </Button>
                </div>
              </div>
            )}

            {/* User's Submission */}
            {event.userSubmission && (
              <div className="bg-card/50 backdrop-blur-sm border border-green-600/30 rounded-xl p-6 shadow-lg">
                <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-green-400" />
                  Your Submission
                </h2>

                <div className="bg-background/50 rounded-lg p-4">
                  <p className="text-foreground whitespace-pre-wrap">
                    {event.userSubmission.content}
                  </p>
                  <div className="mt-3 text-sm text-muted-foreground">
                    Submitted{" "}
                    {formatDistanceToNow(
                      new Date(event.userSubmission.submittedAt),
                      { addSuffix: true }
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Participants */}
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                Participants ({event.participants?.length || 0})
              </h3>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {event.participants?.slice(0, 10).map((participant) => (
                  <div
                    key={participant.user._id}
                    className="flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-900/50 to-purple-900/50 flex items-center justify-center">
                      <span className="text-xs font-bold text-blue-200">
                        {participant.user.fullName?.charAt(0) ||
                          participant.user.username?.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-foreground truncate">
                        {participant.user.fullName || participant.user.username}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Joined{" "}
                        {formatDistanceToNow(new Date(participant.joinedAt), {
                          addSuffix: true,
                        })}
                      </div>
                    </div>
                  </div>
                ))}

                {event.participants?.length > 10 && (
                  <div className="text-center text-sm text-muted-foreground">
                    +{event.participants.length - 10} more participants
                  </div>
                )}
              </div>
            </div>

            {/* Recent Submissions */}
            {event.submissions?.length > 0 && (
              <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Send className="w-5 h-5 text-green-400" />
                  Recent Submissions
                </h3>

                <div className="space-y-3">
                  {event.submissions.slice(0, 5).map((submission, index) => (
                    <div
                      key={index}
                      className="p-3 bg-background/50 rounded-lg"
                    >
                      <div className="font-medium text-sm text-foreground mb-1">
                        {submission.user.fullName || submission.user.username}
                      </div>
                      <div className="text-xs text-muted-foreground line-clamp-2">
                        {submission.content}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(submission.submittedAt), {
                          addSuffix: true,
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
