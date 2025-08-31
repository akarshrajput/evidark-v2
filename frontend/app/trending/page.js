import { Suspense } from "react";
import StoryFeed from "@/app/_components/stories/StoryFeed";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Flame, Eye, Heart, MessageCircle, Clock } from "lucide-react";

export const dynamic = 'force-dynamic';

async function getTrendingStories() {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/v1/stories/trending`, {
      cache: 'no-store'
    });
    if (response.ok) {
      return await response.json();
    }
    return [];
  } catch (error) {
    console.error("Error fetching trending stories:", error);
    return [];
  }
}

function TrendingStats() {
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Flame className="w-5 h-5" />
          Trending in the Darkness
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">🔥</div>
            <div className="text-sm text-muted-foreground">Hot Stories</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">👻</div>
            <div className="text-sm text-muted-foreground">Spooky Tales</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">💀</div>
            <div className="text-sm text-muted-foreground">Dark Legends</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">🌙</div>
            <div className="text-sm text-muted-foreground">Night Stories</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TrendingFilters() {
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border mb-6">
      <CardContent className="pt-6">
        <div className="flex flex-wrap gap-2">
          <Badge variant="default" className="spooky-glow">
            <Clock className="w-3 h-3 mr-1" />
            Last 24 Hours
          </Badge>
          <Badge variant="outline">
            <TrendingUp className="w-3 h-3 mr-1" />
            Most Liked
          </Badge>
          <Badge variant="outline">
            <Eye className="w-3 h-3 mr-1" />
            Most Viewed
          </Badge>
          <Badge variant="outline">
            <MessageCircle className="w-3 h-3 mr-1" />
            Most Discussed
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}

export default async function TrendingPage() {
  const stories = await getTrendingStories();

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">
          Trending Stories
        </h1>
        <p className="text-muted-foreground">
          Discover the most captivating dark tales that are haunting our community
        </p>
      </div>

      <TrendingStats />
      <TrendingFilters />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Suspense fallback={
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="bg-card/50 backdrop-blur-sm border-border animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          }>
            <StoryFeed initialStories={stories} />
          </Suspense>
        </div>

        <div className="space-y-6">
          <Card className="bg-card/50 backdrop-blur-sm border-border">
            <CardHeader>
              <CardTitle className="text-lg">Trending Authors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: "DarkScribe", stories: 12, likes: 1.2 },
                { name: "NightWhisperer", stories: 8, likes: 0.9 },
                { name: "ShadowTeller", stories: 15, likes: 2.1 }
              ].map((author, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                  <div>
                    <div className="font-medium">{author.name}</div>
                    <div className="text-sm text-muted-foreground">{author.stories} stories</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-primary">{author.likes}k</div>
                    <div className="text-xs text-muted-foreground">likes</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border">
            <CardHeader>
              <CardTitle className="text-lg">Popular Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {["horror", "supernatural", "mystery", "thriller", "ghost", "vampire", "werewolf", "demon"].map((tag) => (
                  <Badge key={tag} variant="outline" className="hover:bg-primary/10 cursor-pointer">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
