"use client";

import { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import {
  Heart,
  MessageCircle,
  UserPlus,
  BookOpen,
  MoreHorizontal,
  ExternalLink,
  CheckCheck,
  Bell,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";

export default function NotificationDropdown({
  onMarkAsRead,
  onMarkAllAsRead,
  onClose,
}) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/api/v1/notifications?limit=10');
      
      if (response.data.success) {
        setNotifications(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationIds) => {
    try {
      await api.patch('/api/v1/notifications/mark-read', { notificationIds });

      // Update local state
      setNotifications((prev) =>
        prev.map((notif) =>
          notificationIds.includes(notif._id)
            ? { ...notif, isRead: true }
            : notif
        )
      );

      const unreadCount = notificationIds.filter((id) =>
        notifications.find((n) => n._id === id && !n.isRead)
      ).length;

      onMarkAsRead(unreadCount);
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/api/v1/notifications/mark-read', { markAll: true });

      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true }))
      );

      onMarkAllAsRead();
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "like":
        return <Heart className="h-4 w-4 text-red-500" />;
      case "comment":
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case "follow":
        return <UserPlus className="h-4 w-4 text-green-500" />;
      case "story_published":
        return <BookOpen className="h-4 w-4 text-purple-500" />;
      default:
        return <MoreHorizontal className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNotificationLink = (notification) => {
    switch (notification.targetType) {
      case "Story":
      case "story":
        return `/stories/${notification.targetId}`;
      case "User":
      case "user":
        return `/profile/${notification.actor?._id}`;
      default:
        return "#";
    }
  };

  const renderNotificationContent = (notification) => {
    const { actor, type, message, isAggregated, aggregatedCount, lastActors } =
      notification;

    if (isAggregated && aggregatedCount > 1 && lastActors?.length > 0) {
      return (
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <div className="flex -space-x-1">
              {lastActors.slice(0, 3).map((user, index) => (
                <Avatar
                  key={user?._id || index}
                  className="h-6 w-6 border border-red-500/30"
                >
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="text-xs bg-red-900/50">
                    {user?.name?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            <span className="text-sm text-red-100 font-medium truncate">
              {lastActors[0]?.name || "Unknown"}
            </span>
          </div>
          <p className="text-sm text-gray-400">{message || "No message"}</p>
        </div>
      );
    }

    return (
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-1">
          <span className="text-sm text-red-100 font-medium truncate">
            {actor?.name || "Unknown"}
          </span>
          {actor?.role && (
            <Badge className="text-xs bg-red-900/50 text-red-300">
              {actor.role}
            </Badge>
          )}
        </div>
        <p className="text-sm text-gray-400">{message || "No message"}</p>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-red-100">Notifications</h3>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 animate-pulse">
              <div className="h-8 w-8 bg-gray-700 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-700 rounded mb-1"></div>
                <div className="h-3 bg-gray-800 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-h-96">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-red-900/30">
        <h3 className="font-semibold text-red-100">Notifications</h3>
        {notifications.some((n) => !n.isRead) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={markAllAsRead}
            className="text-xs text-red-400 hover:text-red-300 hover:bg-red-900/20"
          >
            <CheckCheck className="h-3 w-3 mr-1" />
            Mark all read
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <ScrollArea className="max-h-80">
        {notifications.length === 0 ? (
          <div className="p-8 text-center">
            <div className="h-12 w-12 mx-auto mb-4 rounded-full bg-red-900/20 flex items-center justify-center">
              <Bell className="h-6 w-6 text-red-500/50" />
            </div>
            <p className="text-gray-400 mb-2">No notifications yet</p>
            <p className="text-sm text-gray-500">
              You'll see notifications here when something happens
            </p>
          </div>
        ) : (
          <div className="p-2">
            {notifications.map((notification) => (
              <Link
                key={notification._id}
                href={getNotificationLink(notification)}
                onClick={() => {
                  if (!notification.isRead) {
                    markAsRead([notification._id]);
                  }
                  onClose();
                }}
                className={`
                  flex items-start space-x-3 p-3 rounded-lg cursor-pointer transition-colors
                  hover:bg-red-900/20
                  ${!notification.isRead ? "bg-red-900/10" : ""}
                `}
              >
                {/* Notification Icon */}
                <div className="flex-shrink-0 mt-1">
                  {getNotificationIcon(notification.type)}
                </div>

                {/* Avatar */}
                <Avatar className="h-8 w-8 border border-red-500/30">
                  <AvatarImage src={notification.actor?.avatar} />
                  <AvatarFallback className="text-xs bg-red-900/50">
                    {notification.actor?.name?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>

                {/* Content */}
                {renderNotificationContent(notification)}

                {/* Timestamp & Unread Indicator */}
                <div className="flex-shrink-0 flex flex-col items-end space-y-1">
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(notification.createdAt), {
                      addSuffix: true,
                    })}
                  </span>
                  {!notification.isRead && (
                    <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="p-3 border-t border-red-900/30">
          <Link
            href="/notifications"
            onClick={onClose}
            className="flex items-center justify-center text-sm text-red-400 hover:text-red-300 transition-colors"
          >
            <span>View all notifications</span>
            <ExternalLink className="h-3 w-3 ml-1" />
          </Link>
        </div>
      )}
    </div>
  );
}
