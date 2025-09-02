"use client";

import { useState, useEffect } from "react";
import { useQuery, useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
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
  Star,
  Heart,
  Share2,
  MoreVertical,
  Pin,
  Flag,
  Edit,
  Trash2,
  Send,
  Image as ImageIcon,
  Poll,
  Trophy,
  Target
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { SpookyStoryCardSkeleton } from "@/app/_components/ui/SpookySkeleton";
import { formatDistanceToNow } from "date-fns";

// Community type configurations
const communityTypes = {
  circle: { icon: Users, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20", name: "Discussion Circle" },
  challenge: { icon: Zap, color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20", name: "Writing Challenge" },
  ritual: { icon: Moon, color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20", name: "Dark Ritual" },
  coven: { icon: Crown, color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/20", name: "Elite Coven" }
};

// Post type configurations
const postTypes = {
  discussion: { icon: MessageCircle, color: "text-blue-400", label: "Discussion" },
  challenge: { icon: Target, color: "text-yellow-400", label: "Challenge" },
  ritual: { icon: Moon, color: "text-purple-400", label: "Ritual" },
  story_share: { icon: Sparkles, color: "text-green-400", label: "Story Share" },
  question: { icon: Search, color: "text-orange-400", label: "Question" },
  announcement: { icon: Crown, color: "text-red-400", label: "Announcement" }
};

// Post Card Component
function PostCard({ post, onLike, onComment }) {
  const { user, isAuthenticated } = useAuth();
  const [isLiking, setIsLiking] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);
  
  const typeConfig = postTypes[post.type];
  const TypeIcon = typeConfig.icon;

  const handleLike = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to like posts");
      return;
    }
    
    setIsLiking(true);
    try {
      await onLike(post._id);
    } finally {
      setIsLiking(false);
    }
  };

  const handleComment = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to comment");
      return;
    }
    
    if (!commentText.trim()) return;
    
    setIsCommenting(true);
    try {
      await onComment(post._id, commentText);
      setCommentText('');
      setShowComments(true);
    } finally {
      setIsCommenting(false);
    }
  };

  const safeFormatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Recently";
      return formatDistanceToNow(date) + " ago";
    } catch (error) {
      return "Recently";
    }
  };

  return (
    <Card className="professional-card border-none transition-all duration-200 hover:shadow-lg hover:shadow-red-500/10">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={post.author?.avatar} />
              <AvatarFallback className="bg-muted text-muted-foreground">
                {post.author?.name?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-foreground">{post.author?.username || 'Unknown'}</span>
                {post.author?.verified && (
                  <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${typeConfig.color} bg-transparent border-current/20`}
                >
                  <TypeIcon className="w-3 h-3 mr-1" />
                  {typeConfig.label}
                </Badge>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                {safeFormatDate(post.createdAt)}
                {post.status === 'pinned' && (
                  <>
                    <span>•</span>
                    <Pin className="w-3 h-3 text-yellow-400" />
                    <span className="text-yellow-400">Pinned</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="mb-4">
          <h3 className="font-bold text-lg text-foreground mb-2">{post.title}</h3>
          <div className="text-muted-foreground text-sm whitespace-pre-wrap line-clamp-4">
            {post.content}
          </div>
        </div>
        
        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {post.tags.map((tag, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="text-xs bg-muted/50 text-muted-foreground border-none"
              >
                #{tag}
              </Badge>
            ))}
          </div>
        )}
        
        {/* Engagement Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={isLiking}
              className={`
                text-muted-foreground hover:text-red-400 hover:bg-red-400/10 border-none
                ${post.isLiked ? 'text-red-400 bg-red-400/10' : ''}
              `}
            >
              <Heart className={`w-4 h-4 mr-1 ${post.isLiked ? 'fill-current' : ''}`} />
              {post.likesCount || 0}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="text-muted-foreground hover:text-blue-400 hover:bg-blue-400/10 border-none"
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              {post.commentsCount || 0}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-green-400 hover:bg-green-400/10 border-none"
            >
              <Share2 className="w-4 h-4 mr-1" />
              Share
            </Button>
          </div>
          
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Eye className="w-3 h-3" />
            {post.engagement?.views || 0} views
          </div>
        </div>
        
        {/* Comment Section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-border/50">
            {isAuthenticated && (
              <div className="flex gap-3 mb-4">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                    {user?.name?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 flex gap-2">
                  <Textarea
                    placeholder="Share your dark thoughts..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="min-h-[80px] bg-card border-border/50 resize-none"
                  />
                  <Button
                    onClick={handleComment}
                    disabled={isCommenting || !commentText.trim()}
                    size="sm"
                    className="spooky-glow border-none self-end"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
            
            <div className="text-center text-muted-foreground text-sm py-4">
              Comments will appear here once implemented
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Create Post Component
function CreatePostCard({ communityId, onPostCreated }) {
  const { isAuthenticated } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [postData, setPostData] = useState({
    title: '',
    content: '',
    type: 'discussion',
    tags: []
  });
  const [isCreating, setIsCreating] = useState(false);

  const handleCreatePost = async () => {
    if (!postData.title.trim() || !postData.content.trim()) {
      toast.error("Please fill in title and content");
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/communities/${communityId}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(postData)
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        setPostData({ title: '', content: '', type: 'discussion', tags: [] });
        setIsExpanded(false);
        onPostCreated();
      }
    } catch (error) {
      toast.error("Failed to create post");
    } finally {
      setIsCreating(false);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <Card className="professional-card border-none mb-6">
      <CardContent className="pt-6">
        {!isExpanded ? (
          <Button
            onClick={() => setIsExpanded(true)}
            variant="outline"
            className="w-full text-left justify-start bg-muted/30 border-border/50 text-muted-foreground hover:text-foreground"
          >
            <Plus className="w-4 h-4 mr-2" />
            Share something with the circle...
          </Button>
        ) : (
          <div className="space-y-4">
            <input
              type="text"
              placeholder="What's haunting your mind?"
              value={postData.title}
              onChange={(e) => setPostData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 bg-card border border-border/50 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-500/50"
            />
            
            <Textarea
              placeholder="Share your dark thoughts, stories, or questions..."
              value={postData.content}
              onChange={(e) => setPostData(prev => ({ ...prev, content: e.target.value }))}
              className="min-h-[120px] bg-card border-border/50 resize-none"
            />
            
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {Object.entries(postTypes).slice(0, 4).map(([key, config]) => {
                  const Icon = config.icon;
                  return (
                    <Button
                      key={key}
                      variant={postData.type === key ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPostData(prev => ({ ...prev, type: key }))}
                      className={`
                        border-none shadow-sm shadow-black/30
                        ${postData.type === key ? "spooky-glow" : "bg-card hover:bg-muted"}
                      `}
                    >
                      <Icon className="w-4 h-4 mr-1" />
                      {config.label}
                    </Button>
                  );
                })}
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsExpanded(false)}
                  className="border-border/50 text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreatePost}
                  disabled={isCreating || !postData.title.trim() || !postData.content.trim()}
                  className="spooky-glow border-none"
                >
                  {isCreating ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <Send className="w-4 h-4 mr-2" />
                  )}
                  Post
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function CommunityDetailPage() {
  const { isAuthenticated, loading } = useAuth();
  const params = useParams();
  const queryClient = useQueryClient();
  const communityId = params.id;

  // Fetch community details
  const {
    data: community,
    isLoading: communityLoading,
    error: communityError,
    refetch: refetchCommunity
  } = useQuery({
    queryKey: ["community", communityId],
    queryFn: async () => {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";
      const token = localStorage.getItem("token");
      
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      
      const response = await fetch(`${baseUrl}/api/v1/communities/${communityId}`, { headers });
      if (!response.ok) throw new Error("Failed to fetch community");
      const data = await response.json();
      return data.data;
    },
    staleTime: 5 * 60 * 1000,
  });

  // Fetch community posts
  const {
    data: postsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: postsLoading,
    refetch: refetchPosts
  } = useInfiniteQuery({
    queryKey: ["community-posts", communityId],
    queryFn: async ({ pageParam = 1 }) => {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";
      const token = localStorage.getItem("token");
      
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;
      
      const response = await fetch(
        `${baseUrl}/api/v1/communities/${communityId}/posts?page=${pageParam}&limit=10`,
        { headers }
      );
      if (!response.ok) throw new Error("Failed to fetch posts");
      return response.json();
    },
    getNextPageParam: (lastPage, pages) => {
      return lastPage.data.length === 10 ? pages.length + 1 : undefined;
    },
    staleTime: 2 * 60 * 1000,
    enabled: !!communityId
  });

  // Join/Leave handlers
  const handleJoinLeave = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to join communities");
      return;
    }

    try {
      const endpoint = community.isMember ? 'leave' : 'join';
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/communities/${communityId}/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        refetchCommunity();
      }
    } catch (error) {
      toast.error("Failed to update membership");
    }
  };

  // Post interaction handlers
  const handleLikePost = async (postId) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to like posts");
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/community-posts/${postId}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update posts cache optimistically
        queryClient.setQueryData(['community-posts', communityId], (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map(page => ({
              ...page,
              data: page.data.map(post => 
                post._id === postId 
                  ? { 
                      ...post, 
                      isLiked: data.isLiked,
                      likesCount: data.likesCount
                    }
                  : post
              )
            }))
          };
        });
        
        toast.success(data.message);
      }
    } catch (error) {
      toast.error("Failed to like post");
    }
  };

  const handleCommentPost = async (postId, content) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to comment");
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/community-posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ content })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update posts cache to increment comment count
        queryClient.setQueryData(['community-posts', communityId], (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map(page => ({
              ...page,
              data: page.data.map(post => 
                post._id === postId 
                  ? { 
                      ...post, 
                      commentsCount: (post.commentsCount || 0) + 1
                    }
                  : post
              )
            }))
          };
        });
        
        toast.success(data.message);
      }
    } catch (error) {
      toast.error("Failed to add comment");
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

  const posts = postsData?.pages?.flatMap((page) => page.data) || [];

  if (communityLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="grid gap-6 w-full max-w-4xl mx-auto px-6">
          <SpookyStoryCardSkeleton />
          <SpookyStoryCardSkeleton />
          <SpookyStoryCardSkeleton />
        </div>
      </div>
    );
  }

  if (communityError || !community) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Skull className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">Community not found in the darkness...</p>
          <Link href="/communities">
            <Button variant="outline" className="border-red-600/50 text-red-200 hover:bg-red-950/30">
              Return to Communities
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const typeConfig = communityTypes[community.type];
  const TypeIcon = typeConfig.icon;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8 max-w-4xl">
        {/* Community Header */}
        <Card className="professional-card border-none mb-8">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start gap-4">
                <div className={`p-4 rounded-xl ${typeConfig.bg} ${typeConfig.border} border`}>
                  <TypeIcon className={`w-8 h-8 ${typeConfig.color}`} />
                </div>
                
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-foreground">{community.name}</h1>
                    {community.featured && (
                      <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <span className="capitalize">{typeConfig.name}</span>
                    <span>•</span>
                    <span>{community.memberCount} members</span>
                    <span>•</span>
                    <span>{community.stats?.postCount || 0} posts</span>
                  </div>
                  
                  <p className="text-muted-foreground max-w-2xl">{community.description}</p>
                </div>
              </div>
              
              <Button
                onClick={handleJoinLeave}
                variant={community.isMember ? "outline" : "default"}
                className={`
                  transition-all duration-200 border-none shadow-sm shadow-black/30
                  ${community.isMember 
                    ? "bg-red-600/20 text-red-400 hover:bg-red-600/30 hover:text-red-300" 
                    : "spooky-glow hover:shadow-md hover:shadow-red-500/30"
                  }
                `}
              >
                {community.isMember ? "Leave Circle" : "Join Circle"}
              </Button>
            </div>
            
            {/* Tags */}
            {community.tags && community.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {community.tags.map((tag, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="bg-muted/50 text-muted-foreground border-none"
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}
            
            {/* Creator Info */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Created by</span>
              <Avatar className="w-5 h-5">
                <AvatarImage src={community.creator?.avatar} />
                <AvatarFallback className="text-xs bg-muted">
                  {community.creator?.name?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium">{community.creator?.username || 'Unknown'}</span>
            </div>
          </CardContent>
        </Card>

        {/* Create Post */}
        <CreatePostCard 
          communityId={communityId} 
          onPostCreated={() => refetchPosts()} 
        />

        {/* Posts */}
        <div className="space-y-6">
          {postsLoading ? (
            [...Array(3)].map((_, i) => (
              <SpookyStoryCardSkeleton key={i} />
            ))
          ) : posts.length === 0 ? (
            <Card className="professional-card border-none">
              <CardContent className="pt-6 text-center py-12">
                <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Posts Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Be the first to start a conversation in this circle.
                </p>
                {isAuthenticated && community.isMember && (
                  <Button className="spooky-glow border-none">
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Post
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            posts.map((post, index) => (
              <PostCard
                key={`${post._id}-${index}`}
                post={post}
                onLike={handleLikePost}
                onComment={handleCommentPost}
              />
            ))
          )}
        </div>

        {/* Loading more indicator */}
        {isFetchingNextPage && (
          <div className="flex justify-center py-8">
            <div className="flex items-center gap-2 text-muted-foreground">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Loading more posts...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
