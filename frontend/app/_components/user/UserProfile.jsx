"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import OnlineAvatar from "@/app/_components/ui/OnlineAvatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  BookOpen, 
  Eye, 
  Heart, 
  Calendar, 
  MapPin, 
  Mail,
  UserPlus,
  UserMinus,
  Settings,
  Crown,
  Skull,
  Ghost,
  TrendingUp,
  MessageCircle
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function UserProfile({ user, currentUser, isAuthenticated }) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  const handleStartChat = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to start a chat");
      return;
    }

    try {
      console.log('Starting chat with user:', user._id);
      console.log('Current user:', currentUser);
      
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";
      const token = localStorage.getItem('token');
      
      const requestData = {
        type: 'private',
        participantIds: [user._id.toString()]
      };
      console.log('Sending request data:', requestData);
      
      const response = await fetch(`${baseUrl}/api/v1/chats`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestData)
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Chat API response:', data);
      
      if (response.ok) {
        // Redirect to chat with this user
        toast.success('Opening chat...');
        const chatData = data.success ? data.data : data;
        window.location.href = `/chat?chatId=${chatData._id || chatData.chat?._id}`;
      } else if (response.status === 409) {
        // Chat already exists, redirect to it
        toast.success('Opening existing chat...');
        window.location.href = `/chat?chatId=${data.chatId}`;
      } else {
        console.error('Chat API error:', data);
        toast.error(data.error || 'Failed to start chat');
      }
    } catch (error) {
      console.error('Error starting chat:', error);
      toast.error('Failed to start chat');
    }
  };

  const isCurrentUser = currentUser?.id === user._id.toString();

  const handleFollow = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to follow users");
      return;
    }

    setFollowLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${baseUrl}/api/v1/users/${user._id}/follow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: currentUser.id }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsFollowing(data.following);
        toast.success(data.message);
      }
    } catch (error) {
      toast.error("Failed to follow user");
    } finally {
      setFollowLoading(false);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <Crown className="w-4 h-4 text-yellow-400" />;
      case 'guide': return <Ghost className="w-4 h-4 text-purple-400" />;
      case 'user': return <Eye className="w-4 h-4 text-muted-foreground" />;
      default: return <Eye className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      guide: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      user: "bg-gray-500/10 text-gray-400 border-gray-500/20"
    };
    return colors[role] || colors.user;
  };

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Profile Header */}
      <Card className="professional-card border-none mb-8">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <OnlineAvatar
                src={user.photo}
                alt={user.name}
                fallback={user.name?.[0] || user.username?.[0] || 'U'}
                isOnline={user.isOnline}
                size="2xl"
                className="border-4 border-primary/20"
              />
              {user.role === 'admin' && (
                <div className="absolute -top-2 -right-2 bg-yellow-500 rounded-full p-2">
                  <Crown className="w-4 h-4 text-black" />
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">{user.name || user.username}</h1>
                  <Badge variant="outline" className={getRoleBadgeColor(user.role)}>
                    {getRoleIcon(user.role)}
                    <span className="ml-1 capitalize">{user.role}</span>
                  </Badge>
                  {user.verified && (
                    <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                      Verified
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground">@{user.username}</p>
                {user.bio && (
                  <p className="text-foreground mt-2">{user.bio}</p>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4 text-primary" />
                  <span className="font-semibold">{user.storiesCount || 0}</span>
                  <span className="text-muted-foreground">Stories</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="font-semibold">{user.followersCount || 0}</span>
                  <span className="text-muted-foreground">Followers</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="font-semibold">{user.followingCount || 0}</span>
                  <span className="text-muted-foreground">Following</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4 text-primary" />
                  <span className="font-semibold">{user.totalViews || 0}</span>
                  <span className="text-muted-foreground">Views</span>
                </div>
              </div>

              {/* Meta Info */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {formatDistanceToNow(new Date(user.createdAt))} ago</span>
                </div>
                {user.address && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{user.address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {isCurrentUser ? (
                <Link href="/settings">
                  <Button variant="outline" className="spooky-glow">
                    <Settings className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </Link>
              ) : (
                <>
                  <Button
                    onClick={handleFollow}
                    disabled={followLoading}
                    className={isFollowing ? "bg-destructive hover:bg-destructive/90" : "spooky-glow"}
                  >
                    {followLoading ? (
                      "Loading..."
                    ) : isFollowing ? (
                      <>
                        <UserMinus className="w-4 h-4 mr-2" />
                        Unfollow
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Follow
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleStartChat}
                    className="spooky-glow border-red-600/60 bg-red-950/30 text-red-200 hover:bg-red-900/50 hover:text-red-100 hover:border-red-500/80 transition-all duration-200 shadow-lg hover:shadow-red-900/20"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Dark Chat
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="stories">Stories</TabsTrigger>
          <TabsTrigger value="followers">Followers</TabsTrigger>
          <TabsTrigger value="following">Following</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Stats Cards */}
            <Card className="professional-card border-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{user.totalViews || 0}</div>
                    <div className="text-xs text-muted-foreground">Total Views</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{user.totalLikes || 0}</div>
                    <div className="text-xs text-muted-foreground">Total Likes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{user.xp || 0}</div>
                    <div className="text-xs text-muted-foreground">XP Points</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{user.creatorScore || 0}</div>
                    <div className="text-xs text-muted-foreground">Creator Score</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Info */}
            <Card className="professional-card border-none">
              <CardHeader>
                <CardTitle>Account Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Account Type:</span>
                  <span>{user.accountType || 'Personal'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span>{user.status || 'Active'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subscription:</span>
                  <Badge variant={user.subscription ? "default" : "secondary"}>
                    {user.subscription ? "Premium" : "Free"}
                  </Badge>
                </div>
                {user.email && isCurrentUser && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="text-sm">{user.email}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="stories" className="mt-6">
          <Card className="professional-card border-none">
            <CardHeader>
              <CardTitle>Published Stories</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                Stories will be displayed here once implemented.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="followers" className="mt-6">
          <Card className="professional-card border-none">
            <CardHeader>
              <CardTitle>Followers ({user.followersCount || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                Followers list will be displayed here once implemented.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="following" className="mt-6">
          <Card className="professional-card border-none">
            <CardHeader>
              <CardTitle>Following ({user.followingCount || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                Following list will be displayed here once implemented.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
