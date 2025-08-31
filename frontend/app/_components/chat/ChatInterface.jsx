"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { io } from "socket.io-client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import OnlineAvatar from "@/app/_components/ui/OnlineAvatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  MessageCircle,
  Send,
  Search,
  Plus,
  MoreVertical,
  Smile,
  Phone,
  Video,
  Paperclip,
} from "lucide-react";
import ChatList from "./ChatList";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import UserSearch from "./UserSearch";

export default function ChatInterface() {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [loading, setLoading] = useState(true);

  // Handle URL parameters for direct chat access
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const chatId = urlParams.get("chatId");

    if (chatId && chats.length > 0) {
      const targetChat = chats.find((chat) => chat._id === chatId);
      if (targetChat) {
        handleChatSelect(targetChat);
      }
    }
  }, [chats]);

  // Initialize socket connection
  useEffect(() => {
    if (user?.id) {
      const token = localStorage.getItem('token');
      const newSocket = io(
        process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5050",
        {
          auth: {
            token: token,
            userId: user.id,
          },
          forceNew: true,
          reconnection: true,
          timeout: 20000,
          transports: ["websocket"],
        }
      );

      newSocket.on("connect", () => {
        console.log(
          "🔌 SOCKET CONNECTED - User:",
          user.name,
          "ID:",
          user.id
        );
        setSocket(newSocket);

        // Rejoin active chat room if exists
        if (activeChat?._id) {
          console.log("🔄 REJOINING active chat room:", activeChat._id);
          newSocket.emit("join_chat", { chatId: activeChat._id });
        }
      });

      newSocket.on("new_message", (message) => {
        console.log("📨 RECEIVED MESSAGE via socket:", {
          messageId: message._id,
          content: message.content,
          sender: message.sender?.name,
          senderId: message.sender?._id,
          chatId: message.chat,
          currentUserId: user.id,
          activeChat: activeChat?._id,
          isForActiveChat: activeChat && message.chat === activeChat._id,
        });

        // Always update chat list with new message
        updateChatLastMessage(message);

        // Add to messages if this is the active chat
        if (activeChat && message.chat === activeChat._id) {
          console.log("✅ Adding message to active chat UI");
          setMessages((prev) => {
            // Remove any temp message with same content from same sender
            const filteredPrev = prev.filter(
              (msg) =>
                !(
                  msg.isTemp &&
                  msg.content === message.content &&
                  msg.sender._id === message.sender._id
                )
            );

            // Check if real message already exists
            const exists = filteredPrev.some((msg) => msg._id === message._id);
            if (exists) {
              console.log("⚠️ Message already exists, skipping");
              return filteredPrev;
            }

            console.log("✨ Adding new message to UI");
            const newMessages = [...filteredPrev, message];

            // Auto-scroll to bottom after state update
            setTimeout(() => {
              const container = document.getElementById("messages-container");
              if (container) {
                container.scrollTop = container.scrollHeight;
                console.log("📜 Auto-scrolled to bottom for new message");
              }
            }, 100);

            return newMessages;
          });
        } else {
          console.log("❌ Message not for active chat or no active chat");
        }

        // Only add chat to recipient's list when they receive a message (not when creating chat)
        if (message.sender._id !== user.id) {
          console.log("👤 Message from other user, checking chat list");
          setChats((prev) => {
            const chatExists = prev.some((c) => c._id === message.chat);
            if (!chatExists) {
              console.log(
                "🆕 New chat detected from incoming message, fetching details"
              );
              // Fetch chat details for new conversation
              const token = localStorage.getItem('token');
              fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5050'}/api/v1/chats/${message.chat}`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              })
                .then((res) => res.json())
                .then((data) => {
                  if (data.chat) {
                    console.log("✅ Added new chat to recipient's list");
                    setChats((prevChats) => [data.chat, ...prevChats]);
                  }
                });
            }
            return prev;
          });
        }
      });

      newSocket.on("user_typing", ({ userId, userName, chatId }) => {
        if (
          activeChat &&
          chatId === activeChat._id &&
          userId !== user.id
        ) {
          setTypingUsers((prev) => new Set([...prev, userName]));
        }
      });

      newSocket.on("user_stop_typing", ({ userId, userName, chatId }) => {
        if (
          activeChat &&
          chatId === activeChat._id &&
          userId !== user.id
        ) {
          setTypingUsers((prev) => {
            const newSet = new Set(prev);
            newSet.delete(userName);
            return newSet;
          });
        }
      });

      // Listen for user status changes
      newSocket.on("user_status_change", ({ userId, isOnline }) => {
        setChats((prev) =>
          prev.map((chat) => ({
            ...chat,
            participants: chat.participants?.map((participant) =>
              participant.user._id === userId
                ? {
                    ...participant,
                    user: { ...participant.user, isOnline },
                  }
                : participant
            ),
          }))
        );
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user, activeChat]);

  // Load user's chats
  useEffect(() => {
    if (user?.id) {
      loadChats();
    }
  }, [user]);

  const loadChats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5050'}/api/v1/chats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      setChats(data.chats || []);
      setLoading(false);
    } catch (error) {
      console.error("Error loading chats:", error);
      setLoading(false);
    }
  };

  const loadMessages = async (chatId) => {
    try {
      console.log("📥 LOADING MESSAGES for chat:", chatId);
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5050'}/api/v1/chats/${chatId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error(
          "❌ Failed to load messages:",
          response.status,
          response.statusText
        );
        return;
      }

      const data = await response.json();
      console.log("✅ MESSAGES LOADED:", {
        count: data.messages?.length || 0,
        messages: data.messages
          ?.slice(0, 3)
          .map((m) => ({ id: m._id, content: m.content.substring(0, 20) })),
      });

      setMessages(data.messages || []);
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const handleChatSelect = (chat) => {
    console.log("🎯 SELECTING CHAT:", {
      chatId: chat._id,
      chatName: chat.name || "Private Chat",
      previousActiveChat: activeChat?._id,
      socketConnected: !!socket,
    });

    if (activeChat?._id !== chat._id) {
      setActiveChat(chat);
      loadMessages(chat._id).then(() => {
        // Auto-scroll to bottom after loading messages
        setTimeout(() => {
          const container = document.getElementById("messages-container");
          if (container) {
            container.scrollTop = container.scrollHeight;
            console.log("📜 Auto-scrolled to bottom after loading messages");
          }
        }, 200);
      });

      // Join chat room
      if (socket) {
        if (activeChat) {
          console.log("🚪 LEAVING previous chat room:", activeChat._id);
          socket.emit("leave_chat", { chatId: activeChat._id });
        }
        console.log("🚪 JOINING chat room:", chat._id);
        socket.emit("join_chat", { chatId: chat._id });
      } else {
        console.log("❌ No socket connection for room joining");
      }
    }
  };

  const handleSendMessage = async (content, type = "text") => {
    console.log("📤 SENDING MESSAGE:", {
      content: content.trim(),
      chatId: activeChat?._id,
      socketConnected: !!socket,
      activeChat: !!activeChat,
      userId: user.id,
      userName: user.name,
    });

    if (!activeChat || !content.trim() || !socket) {
      console.log("❌ SEND BLOCKED:", {
        noActiveChat: !activeChat,
        noContent: !content.trim(),
        noSocket: !socket,
      });
      return;
    }

    // First emit via socket for real-time delivery
    console.log("🚀 EMITTING send_message via socket to chat:", activeChat._id);
    socket.emit("send_message", {
      chatId: activeChat._id,
      content: content.trim(),
      type,
    });

    // Add optimistic message to UI
    const tempMessage = {
      _id: `temp_${Date.now()}`,
      content: content.trim(),
      sender: {
        _id: user.id,
        name: user.name,
        avatar: user.avatar,
        role: user.role,
      },
      chat: activeChat._id,
      type,
      createdAt: new Date().toISOString(),
      isTemp: true,
    };

    console.log("💭 Adding temp message to UI:", tempMessage._id);
    setMessages((prev) => {
      const newMessages = [...prev, tempMessage];

      // Auto-scroll to bottom for sent message
      setTimeout(() => {
        const container = document.getElementById("messages-container");
        if (container) {
          container.scrollTop = container.scrollHeight;
          console.log("📜 Auto-scrolled to bottom for sent message");
        }
      }, 100);

      return newMessages;
    });

    // Add chat to list if it's the first message
    const chatExists = chats.some((c) => c._id === activeChat._id);
    if (!chatExists) {
      console.log("🆕 Adding chat to list (first message)");
      setChats((prev) => [activeChat, ...prev]);
    }
  };

  const handleCreateChat = async (
    participantIds,
    type = "private",
    selectedUser = null
  ) => {
    try {
      // First check if chat already exists
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5050'}/api/v1/chats`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          type,
          participantIds,
          name: "",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Chat created successfully - set as active but don't add to list yet
        setActiveChat(data.chat);
        setMessages([]); // Clear messages for new chat
        setShowUserSearch(false);

        if (socket) {
          socket.emit("join_chat", { chatId: data.chat._id });
        }
      } else if (response.status === 409) {
        // Chat already exists, switch to it
        const existingChat = chats.find((c) => c._id === data.chatId);
        if (existingChat) {
          handleChatSelect(existingChat);
        } else {
          // If chat exists but not in our list, load it
          loadChats();
        }
        setShowUserSearch(false);
      }
    } catch (error) {
      console.error("Error creating chat:", error);
    }
  };

  const updateChatLastMessage = (message) => {
    setChats((prev) =>
      prev
        .map((chat) =>
          chat._id === message.chat
            ? { ...chat, lastMessage: message, lastActivity: new Date() }
            : chat
        )
        .sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity))
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <MessageCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <p className="text-gray-400">Please sign in to access chat</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-red-900/20 to-black mt-16">
      <div className="h-full flex flex-col">
        <div className="flex-1 overflow-hidden">
          <div className="h-full max-w-7xl mx-auto p-4">
            <div className="grid grid-cols-12 gap-4 h-full">
              {/* Chat List Sidebar */}
              <div className="col-span-4 lg:col-span-3">
                <Card className="h-full bg-black/40 border-red-900/30 backdrop-blur-sm flex flex-col">
                  <div className="p-4 border-b border-red-900/30">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-red-100 font-creepster">
                        Dark Chats
                      </h2>
                      <Button
                        size="sm"
                        onClick={() => setShowUserSearch(true)}
                        className="bg-red-900/50 hover:bg-red-800/50 text-red-100 border-red-700/50"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search conversations..."
                        className="pl-10 bg-gray-900/50 border-red-900/30 text-red-100 placeholder-gray-500"
                      />
                    </div>
                  </div>

                  <ScrollArea className="flex-1">
                    <ChatList
                      chats={chats}
                      activeChat={activeChat}
                      onChatSelect={handleChatSelect}
                      currentUserId={user.id}
                      loading={loading}
                    />
                  </ScrollArea>
                </Card>
              </div>

              {/* Main Chat Area */}
              <div className="col-span-8 lg:col-span-9">
                {activeChat ? (
                  <Card className="h-full bg-black/40 border-red-900/30 backdrop-blur-sm flex flex-col p-0 overflow-hidden">
                    {/* Chat Header - Fixed */}
                    <div className="flex-shrink-0 p-4 border-b border-red-900/30 bg-black/20 backdrop-blur-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <OnlineAvatar
                            src={
                              activeChat.participants?.find(
                                (p) => p.user._id !== user.id
                              )?.user.avatar
                            }
                            alt={
                              activeChat.type === "private"
                                ? activeChat.participants?.find(
                                    (p) => p.user._id !== user.id
                                  )?.user.name
                                : activeChat.name
                            }
                            fallback={
                              activeChat.type === "private"
                                ? activeChat.participants?.find(
                                    (p) => p.user._id !== user.id
                                  )?.user.name?.[0]
                                : activeChat.name?.[0] || "G"
                            }
                            isOnline={
                              activeChat.type === "private"
                                ? activeChat.participants?.find(
                                    (p) => p.user._id !== user.id
                                  )?.user.isOnline
                                : false
                            }
                            className="border-2 border-red-500/30 shadow-lg shadow-red-500/20"
                          />

                          <div>
                            <h3 className="font-semibold text-red-100 text-lg">
                              {activeChat.type === "private"
                                ? activeChat.participants?.find(
                                    (p) => p.user._id !== user.id
                                  )?.user.name
                                : activeChat.name}
                            </h3>
                            <div className="flex items-center space-x-2">
                              <div className="flex items-center space-x-1">
                                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-xs text-green-400 font-medium">
                                  Online
                                </span>
                              </div>
                              {typingUsers.size > 0 && (
                                <span className="text-xs text-red-400 animate-pulse font-medium">
                                  {Array.from(typingUsers).join(", ")} typing...
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-300 hover:text-red-100 hover:bg-red-900/30"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Messages Area - Scrollable */}
                    <div className="flex-1 min-h-0 relative">
                      <div
                        className="absolute inset-0 overflow-y-auto overflow-x-hidden"
                        id="messages-container"
                      >
                        <MessageList
                          messages={messages}
                          currentUserId={user.id}
                          socket={socket}
                        />
                      </div>
                    </div>

                    {/* Message Input - Fixed at Bottom */}
                    <div className="flex-shrink-0 p-4 border-t border-red-900/30 bg-black/20 backdrop-blur-sm">
                      <MessageInput
                        onSendMessage={handleSendMessage}
                        socket={socket}
                        chatId={activeChat._id}
                      />
                    </div>
                  </Card>
                ) : (
                  <Card className="h-full bg-black/40 border-red-900/30 backdrop-blur-sm flex items-center justify-center">
                    <div className="text-center">
                      <MessageCircle className="h-16 w-16 mx-auto mb-4 text-red-500/50" />
                      <h3 className="text-xl font-semibold text-red-100 mb-2 font-creepster">
                        Welcome to Dark Chat
                      </h3>
                      <p className="text-gray-400 mb-4">
                        Select a conversation or start a new one to begin
                        chatting
                      </p>
                      <Button
                        onClick={() => setShowUserSearch(true)}
                        className="bg-red-900/50 hover:bg-red-800/50 text-red-100 border-red-700/50"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Start New Chat
                      </Button>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* User Search Modal */}
      {showUserSearch && (
        <UserSearch
          onClose={() => setShowUserSearch(false)}
          onCreateChat={handleCreateChat}
        />
      )}
    </div>
  );
}
