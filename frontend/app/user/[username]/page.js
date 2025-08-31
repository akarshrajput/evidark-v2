"use client";

import { useState, useEffect, use } from "react";
import UserProfile from "@/app/_components/user/UserProfile";
import { notFound } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";


export default function UserPage({ params }) {
  const { user: currentUser, isAuthenticated } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const resolvedParams = use(params);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/username/${resolvedParams.username}`);
        if (!response.ok) {
          notFound();
          return;
        }
        const data = await response.json();
        setProfileUser(data.data);
      } catch (error) {
        console.error("Error fetching user:", error);
        notFound();
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [resolvedParams.username]);

  if (loading) {
    return (
      <div className="min-h-screen horror-gradient flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!profileUser) {
    notFound();
  }

  return (
    <div className="min-h-screen horror-gradient">
      <UserProfile user={profileUser} currentUser={currentUser} isAuthenticated={isAuthenticated} />
    </div>
  );
}
