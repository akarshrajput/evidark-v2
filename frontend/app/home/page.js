import Hero from "../_components/main/Hero";
import StoryFeed from "../_components/stories/StoryFeed";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Clock, Star } from "lucide-react";

export const dynamic = 'force-dynamic';

async function getTrendingStories() {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/v1/stories/trending?limit=10`, {
      cache: 'no-store'
    });
    if (response.ok) {
      const data = await response.json();
      return data.data || [];
    }
  } catch (error) {
    console.error('Failed to fetch trending stories:', error);
  }
  return [];
}

async function getFeaturedStories() {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/v1/stories/featured?limit=3`, {
      cache: 'no-store'
    });
    if (response.ok) {
      const data = await response.json();
      return data.data || [];
    }
  } catch (error) {
    console.error('Failed to fetch featured stories:', error);
  }
  return [];
}

export default async function Home() {
  const [trendingStories, featuredStories] = await Promise.all([
    getTrendingStories(),
    getFeaturedStories()
  ]);

  return (
    <main className="min-h-screen">
      <Hero />
      
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-primary" />
                Trending Dark Tales
              </h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Clock className="w-4 h-4 mr-2" />
                  Recent
                </Button>
                <Button variant="outline" size="sm">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Hot
                </Button>
              </div>
            </div>
            
            <StoryFeed initialStories={trendingStories} feedType="trending" />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Featured Stories */}
            <Card className="bg-card/50 backdrop-blur-sm border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary" />
                  Featured Tales
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {featuredStories.map((story, index) => (
                  <div key={story._id} className="flex items-start gap-3 p-3 rounded-lg bg-background/50 hover:bg-background/70 transition-colors">
                    <div className="text-primary font-bold text-lg">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm line-clamp-2 hover:text-primary cursor-pointer">
                        {story.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span>{story.author?.name}</span>
                        <span>•</span>
                        <span>{story.views || 0} views</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Community Stats */}
            <Card className="bg-card/50 backdrop-blur-sm border-border">
              <CardHeader>
                <CardTitle>Community</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">1.2K</div>
                    <div className="text-xs text-muted-foreground">Writers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">5.8K</div>
                    <div className="text-xs text-muted-foreground">Stories</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">12K</div>
                    <div className="text-xs text-muted-foreground">Readers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">89K</div>
                    <div className="text-xs text-muted-foreground">Views</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
