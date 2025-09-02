"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import useInfiniteScroll from "@/hooks/useInfiniteScroll";
import StoryCard from "@/app/_components/stories/StoryCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  Flame, 
  Eye, 
  Heart, 
  MessageCircle, 
  Clock,
  Users,
  BookOpen,
  Crown,
  Calendar,
  Filter
} from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050';

// Time period options
const TIME_PERIODS = [
  { value: 'day', label: 'Today', icon: Clock },
  { value: 'week', label: 'This Week', icon: Calendar },
  { value: 'month', label: 'This Month', icon: TrendingUp },
  { value: 'all', label: 'All Time', icon: Crown }
];

// Category tabs
const CATEGORIES = [
  { id: 'overview', label: 'Overview', icon: TrendingUp },
  { id: 'stories', label: 'Stories', icon: BookOpen },
  { id: 'authors', label: 'Authors', icon: Users },
  { id: 'categories', label: 'Categories', icon: Filter },
  { id: 'communities', label: 'Communities', icon: MessageCircle }
];

function TrendingHeader({ activeCategory, setActiveCategory, timePeriod, setTimePeriod }) {
  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">
            Trending in the Darkness
          </h1>
          <p className="text-muted-foreground">
            Discover what&apos;s captivating our community of horror enthusiasts
          </p>
        </div>
        
        {/* Time Period Selector */}
        <div className="flex gap-2">
          {TIME_PERIODS.map((period) => {
            const Icon = period.icon;
            return (
              <Button
                key={period.value}
                variant={timePeriod === period.value ? "default" : "outline"}
                size="sm"
                onClick={() => setTimePeriod(period.value)}
                className={timePeriod === period.value ? "spooky-glow" : ""}
              >
                <Icon className="w-4 h-4 mr-2" />
                {period.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((category) => {
          const Icon = category.icon;
          return (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? "default" : "outline"}
              onClick={() => setActiveCategory(category.id)}
              className={`${activeCategory === category.id ? "spooky-glow" : ""} transition-all`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {category.label}
            </Button>
          );
        })}
      </div>
    </div>
  );
}

function TrendingStories({ timePeriod, token }) {
  const {
    data: stories,
    isLoading,
    isFetchingNextPage,
    lastElementRef,
    hasNextPage
  } = useInfiniteScroll({
    queryKey: ['trending-stories-infinite', timePeriod],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/trending/stories?period=${timePeriod}&page=${pageParam}&limit=10`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch trending stories');
      }
      
      const result = await response.json();
      return {
        data: result,
        nextPage: result.length === 10 ? pageParam + 1 : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="bg-card/50 backdrop-blur-sm border-border animate-pulse">
            <CardContent className="p-6">
              <div className="h-6 bg-muted rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {stories?.map((story, index) => (
        <div 
          key={`${story._id}-${index}`} 
          className="relative"
          ref={index === stories.length - 1 ? lastElementRef : null}
        >
          <div className="absolute -left-4 top-4 bg-gradient-to-r from-red-500 to-red-700 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
            #{index + 1}
          </div>
          <StoryCard story={story} />
        </div>
      ))}
      
      {isFetchingNextPage && (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="bg-card/50 backdrop-blur-sm border-border animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-muted rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-muted rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {!hasNextPage && stories?.length > 0 && (
        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardContent className="p-8 text-center">
            <div className="text-muted-foreground">
              You&apos;ve reached the end of trending stories
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function TrendingAuthors({ timePeriod, token }) {
  const {
    data: authors,
    isLoading,
    isFetchingNextPage,
    lastElementRef,
    hasNextPage
  } = useInfiniteScroll({
    queryKey: ['trending-authors-infinite', timePeriod],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await fetch(
        `${API_BASE_URL}/api/v1/trending/authors?period=${timePeriod}&page=${pageParam}&limit=15`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch trending authors');
      }
      
      const result = await response.json();
      return {
        data: result,
        nextPage: result.length === 15 ? pageParam + 1 : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(10)].map((_, i) => (
          <Card key={i} className="bg-card/50 backdrop-blur-sm border-border animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-muted rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/3"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {authors?.map((author, index) => (
        <Card 
          key={`${author._id}-${index}`} 
          className="bg-card/50 backdrop-blur-sm border-border hover:bg-card/70 transition-all"
          ref={index === authors.length - 1 ? lastElementRef : null}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-700 rounded-full flex items-center justify-center text-white font-bold">
                  #{index + 1}
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{author.name}</h3>
                  {author.verified && <Crown className="w-4 h-4 text-yellow-500" />}
                </div>
                <div className="text-sm text-muted-foreground">
                  @{author.username}
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-primary">{author.totalScore}</div>
                <div className="text-xs text-muted-foreground">trending score</div>
              </div>
            </div>
            <div className="mt-3 flex gap-4 text-sm text-muted-foreground">
              <span>{author.storyCount} stories</span>
              <span>{author.totalLikes} likes</span>
              <span>{author.totalViews} views</span>
              <span>{author.followerCount} followers</span>
            </div>
          </CardContent>
        </Card>
      ))}
      
      {isFetchingNextPage && (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="bg-card/50 backdrop-blur-sm border-border animate-pulse">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-muted rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/3"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {!hasNextPage && authors?.length > 0 && (
        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardContent className="p-8 text-center">
            <div className="text-muted-foreground">
              You&apos;ve reached the end of trending authors
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function TrendingPage() {
  const { user, token } = useAuth();
  const [activeCategory, setActiveCategory] = useState('overview');
  const [timePeriod, setTimePeriod] = useState('week');

  // Fetch trending data based on active category
  const { data, isLoading, error } = useQuery({
    queryKey: ['trending', activeCategory, timePeriod],
    queryFn: async () => {
      const endpoint = activeCategory === 'overview' ? 'overview' : activeCategory;
      const response = await fetch(
        `${API_BASE_URL}/api/v1/trending/${endpoint}?period=${timePeriod}&limit=20`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch trending data');
      }
      
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  const renderContent = () => {
    if (error) {
      return (
        <Card className="bg-card/50 backdrop-blur-sm border-border">
          <CardContent className="p-8 text-center">
            <div className="text-muted-foreground">
              Failed to load trending data. Please try again later.
            </div>
          </CardContent>
        </Card>
      );
    }

    switch (activeCategory) {
      case 'overview':
        return (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {isLoading ? (
                [...Array(4)].map((_, i) => (
                  <Card key={i} className="bg-card/50 backdrop-blur-sm border-border animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-16 bg-muted rounded mb-4"></div>
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                [
                  { title: "Trending Stories", count: data?.stories?.length || 0, icon: BookOpen, color: "text-red-500" },
                  { title: "Hot Authors", count: data?.authors?.length || 0, icon: Users, color: "text-orange-500" },
                  { title: "Active Categories", count: data?.categories?.length || 0, icon: Filter, color: "text-purple-500" },
                  { title: "Buzzing Communities", count: data?.communities?.length || 0, icon: MessageCircle, color: "text-blue-500" }
                ].map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <Card key={i} className="bg-card/50 backdrop-blur-sm border-border hover:bg-card/70 transition-all">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <Icon className={`w-8 h-8 ${stat.color}`} />
                          <div className="text-2xl font-bold">{stat.count}</div>
                        </div>
                        <div className="text-sm text-muted-foreground">{stat.title}</div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
            {data?.stories && (
              <div>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Flame className="w-6 h-6 text-red-500" />
                  Top Stories
                </h2>
                <div className="space-y-6">
                  {data.stories.slice(0, 5).map((story, index) => (
                    <div key={story._id} className="relative">
                      <div className="absolute -left-4 top-4 bg-gradient-to-r from-red-500 to-red-700 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
                        #{index + 1}
                      </div>
                      <StoryCard story={story} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      case 'stories':
        return <TrendingStories timePeriod={timePeriod} token={token} />;
      case 'authors':
        return <TrendingAuthors timePeriod={timePeriod} token={token} />;
      default:
        return (
          <Card className="bg-card/50 backdrop-blur-sm border-border">
            <CardContent className="p-8 text-center">
              <div className="text-muted-foreground">
                This section is coming soon...
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <TrendingHeader
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        timePeriod={timePeriod}
        setTimePeriod={setTimePeriod}
      />
      
      {renderContent()}
    </div>
  );
}
