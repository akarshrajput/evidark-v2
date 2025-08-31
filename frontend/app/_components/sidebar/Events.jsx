"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// Safe date formatting helper
const safeFormatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Recently";
    return formatDistanceToNow(date) + " ago";
  } catch (error) {
    return "Recently";
  }
};

export default function Events({ events, isLoading }) {
  if (isLoading) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-400" />
            Upcoming Events
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="p-3 rounded-lg bg-background/50 border border-border/50 animate-pulse"
            >
              <div className="h-4 bg-muted/20 rounded mb-2"></div>
              <div className="h-3 bg-muted/20 rounded mb-2"></div>
              <div className="h-3 bg-muted/20 rounded w-20"></div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-400" />
          Upcoming Events
        </CardTitle>
      </CardHeader>
      {/* <CardContent className="space-y-3">
        {events?.data?.slice(0, 3).map((event) => (
          <div
            key={event._id}
            className="p-3 rounded-lg bg-background/50 border border-border/50 hover:border-red-500/30 transition-colors"
          >
            <h4 className="text-sm font-medium text-foreground mb-1">
              {event.title}
            </h4>
            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
              {event.description}
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span>{safeFormatDate(event.date)}</span>
            </div>
          </div>
        ))}
      </CardContent> */}
    </Card>
  );
}
