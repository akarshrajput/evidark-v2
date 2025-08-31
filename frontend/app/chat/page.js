"use client";

import { useEffect } from "react";
import { redirect } from "next/navigation";
import ChatInterface from "@/app/_components/chat/ChatInterface";
import { useAuth } from "@/contexts/AuthContext";

export default function ChatPage() {
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      redirect("/login");
    }
  }, [isAuthenticated, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="bg-background">
      <ChatInterface />
    </div>
  );
}
