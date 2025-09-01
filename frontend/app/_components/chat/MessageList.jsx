"use client";

import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import OnlineAvatar from "@/app/_components/ui/OnlineAvatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow, format } from "date-fns";
import {
  Reply,
  MoreVertical,
  Heart,
  Smile,
  Copy,
  Edit,
  Trash2,
} from "lucide-react";

export default function MessageList({ messages, currentUserId, socket }) {
  const scrollAreaRef = useRef(null);
  const [hoveredMessage, setHoveredMessage] = useState(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleReaction = (messageId, emoji) => {
    if (socket) {
      socket.emit("add_reaction", { messageId, emoji });
    }
  };

  const handleMarkAsRead = (messageId) => {
    if (socket) {
      socket.emit("mark_as_read", { messageId });
    }
  };

  const isConsecutiveMessage = (currentMsg, prevMsg) => {
    if (!prevMsg || !currentMsg.sender || !prevMsg.sender) return false;

    const timeDiff =
      new Date(currentMsg.createdAt) - new Date(prevMsg.createdAt);
    const isSameSender = currentMsg.sender._id === prevMsg.sender._id;
    const isWithinTimeLimit = timeDiff < 5 * 60 * 1000; // 5 minutes

    return isSameSender && isWithinTimeLimit;
  };

  const renderMessage = (message, index) => {
    // Handle temporary messages without sender
    const isOwn = message.sender?._id === currentUserId || message.isTemp;
    const prevMessage = index > 0 ? messages[index - 1] : null;
    const isConsecutive =
      message.sender && prevMessage?.sender
        ? isConsecutiveMessage(message, prevMessage)
        : false;
    const showAvatar = !isConsecutive || !isOwn;

    return (
      <div
        className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-${
          isConsecutive ? "1" : "4"
        } group`}
        onMouseEnter={() => setHoveredMessage(message._id)}
        onMouseLeave={() => setHoveredMessage(null)}
      >
        <div
          className={`flex max-w-[70%] ${
            isOwn ? "flex-row-reverse" : "flex-row"
          } items-end space-x-2`}
        >
          {/* Avatar */}
          {showAvatar && !isOwn && message.sender && (
            <OnlineAvatar
              src={message.sender.avatar || message.sender.photo}
              alt={message.sender.name || "User"}
              fallback={message.sender.name?.[0]?.toUpperCase() || "U"}
              isOnline={message.sender.isOnline || false}
              size="sm"
              className="border border-red-500/30"
            />
          )}

          {/* Message Content */}
          <div className={`relative ${isOwn ? "mr-2" : "ml-2"}`}>
            {/* Sender name and timestamp */}
            {!isConsecutive && (
              <div
                className={`flex items-center space-x-2 mb-1 ${
                  isOwn ? "justify-end" : "justify-start"
                }`}
              >
                {/* {!isOwn && message.sender && (
                  <span className="text-sm font-medium text-red-300">
                    {message.sender.name || 'User'}
                  </span>
                )}
                {message.sender?.role && (
                  <Badge 
                    variant="outline" 
                    className="text-xs border-red-700/30 text-red-400 bg-transparent"
                  >
                    {message.sender.role}
                  </Badge>
                )} */}
                {/* <span className="text-xs text-gray-500">
                  {message.createdAt
                    ? format(new Date(message.createdAt), "HH:mm")
                    : "Now"}
                </span> */}
              </div>
            )}

            {/* Message bubble */}
            <div
              className={`
                relative px-4 py-2 rounded-2xl
                ${
                  isOwn
                    ? "bg-red-600 text-white"
                    : "bg-gray-800/80 text-red-100"
                }
                ${
                  isConsecutive
                    ? isOwn
                      ? "rounded-tr-md"
                      : "rounded-tl-md"
                    : ""
                }
              `}
            >
              {/* Message content */}
              <div className="break-words">
                <p className="text-sm leading-relaxed">
                  {message.content || "Message content missing"}
                </p>
              </div>
            </div>

            {/* Reactions */}
            {message.reactions && message.reactions.length > 0 && (
              <div
                className={`flex flex-wrap gap-1 mt-1 ${
                  isOwn ? "justify-end" : "justify-start"
                }`}
              >
                {message.reactions
                  .reduce((acc, reaction) => {
                    const existing = acc.find(
                      (r) => r.emoji === reaction.emoji
                    );
                    if (existing) {
                      existing.count++;
                      existing.users.push(reaction.user);
                    } else {
                      acc.push({
                        emoji: reaction.emoji,
                        count: 1,
                        users: [reaction.user],
                      });
                    }
                    return acc;
                  }, [])
                  .map((reaction, idx) => (
                    <Button
                      key={idx}
                      size="sm"
                      variant="ghost"
                      className="h-6 px-2 bg-red-900/30 hover:bg-red-800/40 text-xs border border-red-700/30"
                      onClick={() =>
                        handleReaction(message._id, reaction.emoji)
                      }
                    >
                      {reaction.emoji} {reaction.count}
                    </Button>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 mx-auto mb-4 rounded-full bg-red-900/20 flex items-center justify-center">
            <Smile className="h-8 w-8 text-red-500/50" />
          </div>
          <p className="text-gray-400 mb-2">No messages yet</p>
          <p className="text-sm text-gray-500">Start the conversation!</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex-1 p-4 overflow-y-auto overflow-x-hidden"
      ref={scrollAreaRef}
    >
      <div className="space-y-1">
        {messages.map((message, index) => (
          <div key={message._id || `temp_${index}`}>
            {renderMessage(message, index)}
          </div>
        ))}
      </div>
    </div>
  );
}
