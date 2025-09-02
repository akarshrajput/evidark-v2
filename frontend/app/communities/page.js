"use client";

import { useState, useEffect } from "react";
import { useQuery, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Users, 
  Plus, 
  Crown, 
  Skull, 
  Flame, 
  Eye, 
  MessageCircle,
  Calendar,
  TrendingUp,
  Filter,
  Search,
  Sparkles,
  Zap,
  Moon,
  Star
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { SpookyStoryCardSkeleton } from "@/app/_components/ui/SpookySkeleton";

// Community type icons and colors
const communityTypes = {
  circle: { icon: Users, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
  challenge: { icon: Zap, color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20" },
  ritual: { icon: Moon, color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20" },
  coven: { icon: Crown, color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/20" }
};

// Community Card Component
function CommunityCard({ community, onJoin, onLeave }) {
  const { isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const typeConfig = communityTypes[community.type];
  const TypeIcon = typeConfig.icon;

  const handleJoinLeave = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to join communities");
      return;
    }

    setIsLoading(true);
    try {
      if (community.isMember) {
        await onLeave(community._id);
      } else {
        await onJoin(community._id);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="professional-card border-none transition-all duration-300 hover:shadow-lg hover:shadow-red-500/10 group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${typeConfig.bg} ${typeConfig.border} border`}>
              <TypeIcon className={`w-6 h-6 ${typeConfig.color}`} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg text-foreground group-hover:text-red-400 transition-colors">
                  {community.name}
                </h3>
                {community.featured && (
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="capitalize">{community.type}</span>
                <span>•</span>
                <span>{community.memberCount} members</span>
              </div>
            </div>
          </div>
          
          <Button
            onClick={handleJoinLeave}
            disabled={isLoading}
            variant={community.isMember ? "outline" : "default"}
            size="sm"
            className={`
              transition-all duration-200 border-none shadow-sm shadow-black/30
              ${community.isMember 
                ? "bg-red-600/20 text-red-400 hover:bg-red-600/30 hover:text-red-300" 
                : "spooky-glow hover:shadow-md hover:shadow-red-500/30"
              }
            `}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : community.isMember ? (
              "Leave"
            ) : (
              "Join"
            )}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {community.description}
        </p>
        
        {/* Tags */}
        {community.tags && community.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {community.tags.slice(0, 3).map((tag, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="text-xs bg-muted/50 text-muted-foreground border-none"
              >
                #{tag}
              </Badge>
            ))}
            {community.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs bg-muted/50 text-muted-foreground border-none">
                +{community.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
        
        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <MessageCircle className="w-3 h-3" />
              {community.stats?.postCount || 0} posts
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {community.stats?.activeMembers || 0} active
            </div>
          </div>
          
          {/* Creator */}
          <div className="flex items-center gap-1">
            <Avatar className="w-4 h-4">
              <AvatarImage src={community.creator?.avatar} />
              <AvatarFallback className="text-xs bg-muted">
                {community.creator?.name?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs">by {community.creator?.username || 'Unknown'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function CommunitiesPage() {
  const { isAuthenticated, loading } = useAuth();
  const queryClient = useQueryClient();
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch communities
  const {
    data: communitiesData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: communitiesLoading,
    error: communitiesError,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["communities", activeFilter, searchQuery],
    queryFn: async ({ pageParam = 1 }) => {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";
      const token = localStorage.getItem("token");
      
      let url = `${baseUrl}/api/v1/communities?page=${pageParam}&limit=12`;
      if (activeFilter !== 'all') url += `&type=${activeFilter}`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;
      
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      
      const response = await fetch(url, { headers });
      if (!response.ok) throw new Error("Failed to fetch communities");
      return response.json();
    },
    getNextPageParam: (lastPage, pages) => {
      return lastPage.data.length === 12 ? pages.length + 1 : undefined;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Join community handler
  const handleJoinCommunity = async (communityId) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/communities/${communityId}/join`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        
        // Update cache optimistically
        queryClient.setQueryData(['communities', activeFilter, searchQuery], (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map(page => ({
              ...page,
              data: page.data.map(community => 
                community._id === communityId 
                  ? { ...community, isMember: true, memberCount: community.memberCount + 1 }
                  : community
              )
            }))
          };
        });
      }
    } catch (error) {
      toast.error("Failed to join community");
    }
  };

  // Leave community handler
  const handleLeaveCommunity = async (communityId) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/communities/${communityId}/leave`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        
        // Update cache optimistically
        queryClient.setQueryData(['communities', activeFilter, searchQuery], (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map(page => ({
              ...page,
              data: page.data.map(community => 
                community._id === communityId 
                  ? { ...community, isMember: false, memberCount: community.memberCount - 1 }
                  : community
              )
            }))
          };
        });
      }
    } catch (error) {
      toast.error("Failed to leave community");
    }
  };

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop !==
          document.documentElement.offsetHeight ||
        isFetchingNextPage
      ) {
        return;
      }
      if (hasNextPage) {
        fetchNextPage();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // Flatten communities from all pages
  const communities = communitiesData?.pages?.flatMap((page) => page.data) || [];

  const filterOptions = [
    { key: 'all', label: 'All Circles', icon: Sparkles },
    { key: 'circle', label: 'Discussion Circles', icon: Users },
    { key: 'challenge', label: 'Writing Challenges', icon: Zap },
    { key: 'ritual', label: 'Dark Rituals', icon: Moon },
    { key: 'coven', label: 'Elite Covens', icon: Crown }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 rounded-xl bg-red-600/10 border border-red-600/20">
                  <Users className="w-8 h-8 text-red-400" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-foreground">Dark Circles</h1>
                  <p className="text-muted-foreground">
                    Join communities of horror storytellers and dark minds
                  </p>
                </div>
              </div>
            </div>
            
            {isAuthenticated && (
              <Link href="/communities/create">
                <Button className="spooky-glow border-none shadow-lg shadow-red-500/20">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Circle
                </Button>
              </Link>
            )}
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search dark circles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
              />
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-2">
              {filterOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <Button
                    key={option.key}
                    variant={activeFilter === option.key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveFilter(option.key)}
                    className={`
                      whitespace-nowrap transition-all duration-200 border-none shadow-sm shadow-black/30
                      ${activeFilter === option.key 
                        ? "spooky-glow" 
                        : "bg-card hover:bg-muted text-muted-foreground hover:text-foreground"
                      }
                    `}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {option.label}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Communities Grid */}
        {communitiesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <SpookyStoryCardSkeleton key={i} />
            ))}
          </div>
        ) : communitiesError ? (
          <div className="text-center py-12">
            <Skull className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              The darkness consumed the communities... Try again.
            </p>
            <Button
              variant="outline"
              onClick={() => refetch()}
              className="border-red-600/50 text-red-200 hover:bg-red-950/30"
            >
              Resurrect Communities
            </Button>
          </div>
        ) : communities.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Communities Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery 
                ? `No communities match "${searchQuery}". Try a different search.`
                : "No communities available yet. Be the first to create one!"
              }
            </p>
            {isAuthenticated && (
              <Link href="/communities/create">
                <Button className="spooky-glow border-none">
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Circle
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {communities.map((community, index) => (
              <Link 
                key={`${community._id}-${index}`} 
                href={`/communities/${community._id}`}
                className="block"
              >
                <CommunityCard
                  community={community}
                  onJoin={handleJoinCommunity}
                  onLeave={handleLeaveCommunity}
                />
              </Link>
            ))}
          </div>
        )}

        {/* Loading more indicator */}
        {isFetchingNextPage && (
          <div className="flex justify-center py-8">
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Summoning more circles...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
