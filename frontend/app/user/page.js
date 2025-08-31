"use client";

import { useEffect } from "react";
import { redirect } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function UserPage() {
  const { user, isAuthenticated, loading } = useAuth();
  
  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        redirect("/login");
      } else if (user?.username) {
        redirect(`/user/${user.username}`);
      } else if (user?.email) {
        redirect(`/user/${user.email.split('@')[0]}`);
      }
    }
  }, [user, isAuthenticated, loading]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }
  
  return null;
}