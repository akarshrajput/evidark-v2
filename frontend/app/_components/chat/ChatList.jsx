"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import OnlineAvatar from "@/app/_components/ui/OnlineAvatar";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { MessageCircle, Users } from "lucide-react";

export default function ChatList({
  chats,
  activeChat,
  onChatSelect,
  currentUserId,
  loading,
}) {
  if (loading) {
    return (
      <div className="p-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="flex items-center space-x-3 p-3 mb-2 animate-pulse"
          >
            <div className="h-12 w-12 bg-gray-700 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-700 rounded mb-2"></div>
              <div className="h-3 bg-gray-800 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="p-8 text-center">
        <MessageCircle className="h-12 w-12 mx-auto mb-4 text-red-500/50" />
        <p className="text-gray-400 mb-2">No conversations yet</p>
        <p className="text-sm text-gray-500">Start a new chat to begin</p>
      </div>
    );
  }

  const getChatDisplayInfo = (chat) => {
    if (chat.type === "private") {
      const otherUser = chat.participants?.find(
        (p) => p.user._id !== currentUserId
      )?.user;
      return {
        name: otherUser?.name || "Unknown User",
        avatar: otherUser?.photo,
        isOnline: otherUser?.isOnline,
      };
    } else {
      return {
        name: chat.name || "Group Chat",
        avatar: null,
        isOnline: false,
      };
    }
  };

  const getLastMessagePreview = (message) => {
    if (!message) return "No messages yet";

    if (message.type === "image") return "📷 Image";
    if (message.type === "file") return "📎 File";

    return message.content.length > 50
      ? message.content.substring(0, 50) + "..."
      : message.content;
  };

  return (
    <div className="p-2">
      {chats.map((chat) => {
        const { name, avatar, isOnline } = getChatDisplayInfo(chat);
        const isActive = activeChat?._id === chat._id;

        return (
          <div
            key={chat._id}
            onClick={() => onChatSelect(chat)}
            className={`
              flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200
              hover:bg-red-900/20
              ${isActive ? "bg-red-900/30" : ""}
            `}
          >
            <OnlineAvatar
              src={avatar}
              alt={name}
              fallback={
                chat.type === "group" ? (
                  <Users className="h-5 w-5" />
                ) : (
                  name[0]?.toUpperCase()
                )
              }
              isOnline={isOnline && chat.type === "private"}
              size="lg"
              className="border-2 border-red-500/30"
            />

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-semibold text-red-100 truncate">{name}</h4>

                <div className="flex items-center space-x-2">
                  {chat.unreadCount > 0 && (
                    <Badge className="bg-red-600 text-white text-xs px-2 py-1 min-w-[20px] h-5 flex items-center justify-center">
                      {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
                    </Badge>
                  )}

                  {chat.lastActivity && (
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(chat.lastActivity), {
                        addSuffix: true,
                      })}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400 truncate">
                  {chat.lastMessage?.sender?._id === currentUserId && (
                    <span className="text-red-400">You: </span>
                  )}
                  {getLastMessagePreview(chat.lastMessage)}
                </p>

                {chat.type === "group" && (
                  <Badge
                    variant="outline"
                    className="text-xs border-red-700/50 text-red-300"
                  >
                    {chat.participantCount} members
                  </Badge>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
