import { Suspense } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Ghost, 
  Skull, 
  Moon, 
  Zap, 
  Eye, 
  Heart, 
  BookOpen, 
  Users,
  TrendingUp,
  Clock
} from "lucide-react";

const categories = [
  {
    id: "horror",
    name: "Horror",
    description: "Spine-chilling tales that will haunt your dreams",
    icon: Ghost,
    color: "from-red-600 to-red-800",
    stories: 156,
    followers: 2340
  },
  {
    id: "supernatural",
    name: "Supernatural",
    description: "Beyond the realm of natural explanation",
    icon: Zap,
    color: "from-purple-600 to-purple-800",
    stories: 89,
    followers: 1890
  },
  {
    id: "mystery",
    name: "Mystery",
    description: "Puzzles wrapped in shadows and secrets",
    icon: Eye,
    color: "from-blue-600 to-blue-800",
    stories: 134,
    followers: 1567
  },
  {
    id: "thriller",
    name: "Thriller",
    description: "Heart-pounding suspense and adrenaline",
    icon: Heart,
    color: "from-orange-600 to-orange-800",
    stories: 98,
    followers: 1234
  },
  {
    id: "gothic",
    name: "Gothic",
    description: "Dark romanticism and atmospheric dread",
    icon: Moon,
    color: "from-gray-600 to-gray-800",
    stories: 67,
    followers: 987
  },
  {
    id: "psychological",
    name: "Psychological",
    description: "Mind-bending tales of mental terror",
    icon: Skull,
    color: "from-pink-600 to-pink-800",
    stories: 78,
    followers: 1456
  }
];

function CategoryCard({ category }) {
  const IconComponent = category.icon;
  
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-all duration-300 group cursor-pointer">
      <CardHeader className="pb-4">
        <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
          <IconComponent className="w-6 h-6 text-white" />
        </div>
        <CardTitle className="text-xl group-hover:text-primary transition-colors">
          {category.name}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {category.description}
        </p>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" />
              <span>{category.stories}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{category.followers}</span>
            </div>
          </div>
        </div>
        <Button asChild className="w-full spooky-glow">
          <Link href={`/categories/${category.id}`}>
            Explore {category.name}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function FeaturedStories() {
  const featured = [
    {
      title: "The Midnight Visitor",
      category: "Horror",
      author: "DarkScribe",
      likes: 234,
      views: 1567
    },
    {
      title: "Whispers in the Void",
      category: "Supernatural", 
      author: "ShadowTeller",
      likes: 189,
      views: 1234
    },
    {
      title: "The Last Confession",
      category: "Mystery",
      author: "NightWhisperer", 
      likes: 156,
      views: 987
    }
  ];

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Featured Stories
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {featured.map((story, i) => (
          <div key={i} className="p-4 rounded-lg bg-background/50 hover:bg-background/70 transition-colors cursor-pointer">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-medium hover:text-primary transition-colors">
                {story.title}
              </h4>
              <Badge variant="outline" className="text-xs">
                {story.category}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>by {story.author}</span>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  <span>{story.likes}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>{story.views}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function CategoriesPage() {
  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">
          Story Categories
        </h1>
        <p className="text-muted-foreground">
          Explore different realms of darkness and discover your favorite genre
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>

          <Card className="bg-card/50 backdrop-blur-sm border-border">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { action: "New story in Horror", time: "2 minutes ago", user: "DarkScribe" },
                  { action: "Popular in Supernatural", time: "15 minutes ago", user: "NightWhisperer" },
                  { action: "Trending in Mystery", time: "1 hour ago", user: "ShadowTeller" }
                ].map((activity, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                    <div>
                      <div className="font-medium">{activity.action}</div>
                      <div className="text-sm text-muted-foreground">by {activity.user}</div>
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {activity.time}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <FeaturedStories />

          <Card className="bg-card/50 backdrop-blur-sm border-border">
            <CardHeader>
              <CardTitle className="text-lg">Popular Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {[
                  "vampire", "ghost", "werewolf", "demon", "witch", 
                  "haunted", "cursed", "nightmare", "shadow", "blood"
                ].map((tag) => (
                  <Badge key={tag} variant="outline" className="hover:bg-primary/10 cursor-pointer">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card/50 backdrop-blur-sm border-border">
            <CardHeader>
              <CardTitle className="text-lg">Community Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Stories</span>
                <span className="font-medium">1,234</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Active Writers</span>
                <span className="font-medium">567</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Daily Readers</span>
                <span className="font-medium">8,901</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
