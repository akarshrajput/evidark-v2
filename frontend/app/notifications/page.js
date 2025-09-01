"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { 
  Heart, 
  MessageCircle, 
  UserPlus, 
  BookOpen, 
  MoreHorizontal,
  CheckCheck,
  Trash2,
  Bell,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotificationsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, unread, read
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (isAuthenticated === false) {
      router.push("/login");
      return;
    }
    if (isAuthenticated === true) {
      fetchNotifications(1, true);
    }
  }, [isAuthenticated, filter, router]);

  const fetchNotifications = async (pageNum = 1, reset = false) => {
    try {
      setLoading(pageNum === 1);
      const unreadOnly = filter === "unread" ? "&unreadOnly=true" : "";
      const response = await api.get(`/api/v1/notifications?page=${pageNum}&limit=20${unreadOnly}`);

      if (response.data.success) {
        const data = response.data;
        if (reset) {
          setNotifications(data.data || []);
        } else {
          setNotifications(prev => [...prev, ...(data.data || [])]);
        }
        setHasMore(data.pagination.page < data.pagination.pages);
        setPage(pageNum);
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

      setNotifications(prev =>
        prev.map(notif =>
          notificationIds.includes(notif._id)
            ? { ...notif, isRead: true }
            : notif
        )
      );
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.patch('/api/v1/notifications/mark-read', { markAll: true });

      setNotifications(prev =>
        prev.map(notif => ({ ...notif, isRead: true }))
      );
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await api.delete(`/api/v1/notifications/${notificationId}`);

      setNotifications(prev =>
        prev.filter(notif => notif._id !== notificationId)
      );
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "like":
        return <Heart className="h-5 w-5 text-red-500" />;
      case "comment":
        return <MessageCircle className="h-5 w-5 text-blue-500" />;
      case "follow":
        return <UserPlus className="h-5 w-5 text-green-500" />;
      case "story_published":
        return <BookOpen className="h-5 w-5 text-purple-500" />;
      default:
        return <MoreHorizontal className="h-5 w-5 text-gray-500" />;
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
    const { actor, type, message, isAggregated, aggregatedCount, lastActors } = notification;

    if (isAggregated && aggregatedCount > 1) {
      return (
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-3 mb-2">
            <div className="flex -space-x-2">
              {lastActors.slice(0, 3).map((user, index) => (
                <Avatar key={user._id} className="h-8 w-8 border-2 border-background">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="text-xs bg-red-900/50">
                    {user.name[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
            <div>
              <span className="text-sm text-red-100 font-medium">
                {lastActors[0]?.name}
              </span>
              <p className="text-sm text-gray-400">{message}</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-3 mb-1">
          <Avatar className="h-8 w-8 border border-red-500/30">
            <AvatarImage src={actor.avatar} />
            <AvatarFallback className="text-xs bg-red-900/50">
              {actor.name[0]?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-red-100 font-medium">
                {actor.name}
              </span>
              {actor.role && (
                <Badge className="text-xs bg-red-900/50 text-red-300">
                  {actor.role}
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-400">{message}</p>
          </div>
        </div>
      </div>
    );
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="text-red-300 hover:text-red-100 hover:bg-red-900/20"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold text-red-100 font-creepster">
              Dark Notifications
            </h1>
          </div>

          <div className="flex items-center space-x-2">
            {notifications.some(n => !n.isRead) && (
              <Button
                variant="outline"
                size="sm"
                onClick={markAllAsRead}
                className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
              >
                <CheckCheck className="h-4 w-4 mr-2" />
                Mark all read
              </Button>
            )}
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 mb-6">
          {["all", "unread", "read"].map((filterType) => (
            <Button
              key={filterType}
              variant={filter === filterType ? "default" : "ghost"}
              size="sm"
              onClick={() => setFilter(filterType)}
              className={
                filter === filterType
                  ? "bg-red-600 text-white"
                  : "text-red-300 hover:text-red-100 hover:bg-red-900/20"
              }
            >
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
            </Button>
          ))}
        </div>

        {/* Notifications List */}
        <Card className="professional-card border-none">
          {loading && notifications.length === 0 ? (
            <div className="p-8">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 animate-pulse">
                    <div className="h-10 w-10 bg-gray-700 rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-700 rounded mb-2"></div>
                      <div className="h-3 bg-gray-800 rounded w-3/4"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center">
              <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-red-900/20 flex items-center justify-center">
                <Bell className="h-8 w-8 text-red-500/50" />
              </div>
              <h3 className="text-lg font-semibold text-red-100 mb-2">
                No notifications yet
              </h3>
              <p className="text-gray-400 mb-4">
                You&apos;ll see notifications here when something happens
              </p>
            </div>
          ) : (
            <div className="divide-y divide-red-900/20">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`
                    p-4 transition-colors hover:bg-red-900/10
                    ${!notification.isRead ? 'bg-red-900/5' : ''}
                  `}
                >
                  <div className="flex items-start space-x-4">
                    {/* Notification Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <Link
                      href={getNotificationLink(notification)}
                      onClick={() => {
                        if (!notification.isRead) {
                          markAsRead([notification._id]);
                        }
                      }}
                      className="flex-1 min-w-0"
                    >
                      {renderNotificationContent(notification)}
                    </Link>

                    {/* Actions */}
                    <div className="flex-shrink-0 flex items-center space-x-2">
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </span>
                      {!notification.isRead && (
                        <div className="h-2 w-2 bg-red-500 rounded-full"></div>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault();
                          deleteNotification(notification._id);
                        }}
                        className="h-8 w-8 p-0 text-gray-500 hover:text-red-400 hover:bg-red-900/20"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Load More */}
          {hasMore && notifications.length > 0 && (
            <div className="p-4 border-t border-red-900/20">
              <Button
                variant="outline"
                onClick={() => fetchNotifications(page + 1, false)}
                disabled={loading}
                className="w-full text-red-300 hover:text-red-100 hover:bg-red-900/20"
              >
                {loading ? "Loading..." : "Load More"}
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
