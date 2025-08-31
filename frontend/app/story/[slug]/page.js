import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Eye,
  Clock,
  User,
  ArrowUp,
  ArrowDown,
  Reply,
  MoreHorizontal,
  Skull,
  Ghost,
} from "lucide-react";
import { Roboto_Slab } from "next/font/google";
import Link from "next/link";
import React from "react";
import CommentSection from "@/app/_components/comments/CommentSection";
import { formatDistanceToNow } from "date-fns";

const merriweather = Roboto_Slab({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
});

const fetchStoryData = async (slug) => {
  if (!slug) return null;

  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";
    const res = await fetch(
      `${baseUrl}/api/v1/stories/slug/${slug}`,
      { 
        cache: "no-store",
        next: { revalidate: 0 }
      }
    );

    if (!res.ok) {
      console.error("Fetch failed:", res.status, res.statusText);
      return null;
    }

    const data = await res.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error("Error fetching story:", error);
    return null;
  }
};

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const story = await fetchStoryData(slug);

  if (!story) {
    return {
      title: "Story Not Found - EviDark",
      description: "The dark tale you seek has vanished into the void.",
      robots: "noindex, nofollow",
    };
  }

  const imageUrl = story.media?.length > 0 
    ? story.media[0].url 
    : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/default-story.png`;

  return {
    title: `${story.title} - EviDark`,
    description: story.description || `A dark tale by ${story.author?.name || 'Unknown Author'}`,
    keywords: [
      story.title,
      'dark stories',
      'horror',
      'thriller',
      'EviDark',
      story.author?.name,
      ...(story.categories?.map(cat => cat.name) || []),
      ...(story.tags?.map(tag => tag.name) || [])
    ].filter(Boolean).join(', '),
    authors: [{ name: story.author?.name || 'Unknown Author' }],
    creator: story.author?.name || 'Unknown Author',
    publisher: 'EviDark',
    category: story.categories?.[0]?.name || 'Dark Stories',
    openGraph: {
      title: story.title,
      description: story.description || `A dark tale by ${story.author?.name || 'Unknown Author'}`,
      type: 'article',
      publishedTime: story.createdAt,
      modifiedTime: story.updatedAt || story.createdAt,
      authors: [story.author?.name || 'Unknown Author'],
      section: story.categories?.[0]?.name || 'Dark Stories',
      tags: story.tags?.map(tag => tag.name) || [],
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: story.title,
        }
      ],
      url: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/story/${slug}`,
      siteName: 'EviDark',
    },
    twitter: {
      card: "summary_large_image",
      title: story.title,
      description: story.description || `A dark tale by ${story.author?.name || 'Unknown Author'}`,
      images: [imageUrl],
      creator: `@${story.author?.username || 'evidark'}`,
      site: '@evidark',
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/story/${slug}`,
    },
    other: {
      'article:author': story.author?.name || 'Unknown Author',
      'article:published_time': story.createdAt,
      'article:modified_time': story.updatedAt || story.createdAt,
      'article:section': story.categories?.[0]?.name || 'Dark Stories',
      'article:tag': story.tags?.map(tag => tag.name).join(', ') || '',
    }
  };
}

const Page = async ({ params }) => {
  const { slug } = await params;
  const story = await fetchStoryData(slug);

  if (!story) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="bg-card/50 backdrop-blur-sm border-border text-center p-8">
          <Ghost className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-2xl font-bold mb-2">Story Lost in the Void</h2>
          <p className="text-muted-foreground">
            The tale you seek has vanished into darkness.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background/90">
      {/* Spooky Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-red-950/20 via-red-900/10 to-red-950/20 border-b border-border/50">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNkYzI2MjYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50"></div>
        <div className="container mx-auto px-6 py-12 relative">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-4 bg-red-600/10 text-red-400 border-red-600/20">
              <Skull className="w-3 h-3 mr-1" />
              EVIDARK ORIGINAL
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-red-400 via-red-500 to-red-600 bg-clip-text text-transparent leading-tight">
              {story.title}
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              {story.description}
            </p>

            {/* Author & Meta */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12 border-2 border-primary/30">
                  <AvatarImage
                    src={story.author?.photo}
                    alt={story.author?.name}
                  />
                  <AvatarFallback className="bg-gradient-to-br from-red-500 to-red-700 text-white">
                    {story.author?.name?.[0] || "A"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-foreground">
                    {story.author?.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    @{story.author?.username}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>
                    {formatDistanceToNow(new Date(story.createdAt))} ago
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{story.views || 0} views</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <Card className="bg-card/50 backdrop-blur-sm border-border mb-8">
              <CardContent className="p-8">
                <article
                  className={`${merriweather.className} prose prose-invert prose-lg max-w-none leading-relaxed text-lg`}
                  dangerouslySetInnerHTML={{ __html: story.content }}
                />
              </CardContent>
            </Card>

            {/* Media Evidence */}
            {story.media?.length > 0 && (
              <Card className="bg-card/50 backdrop-blur-sm border-border mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Ghost className="w-5 h-5 text-primary" />
                    Dark Evidence
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {story.media.map((m) => (
                      <div
                        key={m._id}
                        className="overflow-hidden rounded-lg border border-border/50 shadow-lg hover:shadow-xl transition-all duration-300 group"
                      >
                        <Image
                          src={m.url}
                          alt={m.type}
                          width={400}
                          height={256}
                          className="object-cover w-full h-64 group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Categories & Tags */}
            <Card className="bg-card/50 backdrop-blur-sm border-border mb-8">
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-2">
                  {story.categories?.map((cat) => (
                    <Badge
                      key={cat._id}
                      variant="default"
                      className="spooky-glow"
                    >
                      {cat.name}
                    </Badge>
                  ))}
                  {story.tags?.map((tag) => (
                    <Badge key={tag._id} variant="outline">
                      #{tag.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Comments Section */}
            <CommentSection storyId={story._id} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Story Actions */}
            <Card className="bg-card/50 backdrop-blur-sm border-border sticky top-24 z-10">
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 hover:bg-red-500/10 hover:border-red-500/50"
                  >
                    <Heart className="w-4 h-4" />
                    <span>{story.likes || 0}</span>
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    <span>{story.commentsCount || 0}</span>
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Bookmark className="w-4 h-4" />
                    Save
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Share2 className="w-4 h-4" />
                    Share
                  </Button>
                </div>

                <div className="text-center text-sm text-muted-foreground">
                  <p className="mb-2">Enjoyed this dark tale?</p>
                  <Button className="w-full spooky-glow">
                    Follow {story.author?.name}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Story Stats */}
            <Card className="bg-card/50 backdrop-blur-sm border-border">
              <CardHeader>
                <CardTitle className="text-lg">Story Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Views</span>
                  <span className="font-medium">{story.views || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Likes</span>
                  <span className="font-medium">{story.likes || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Comments</span>
                  <span className="font-medium">
                    {story.commentsCount || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reading Time</span>
                  <span className="font-medium">
                    {Math.ceil((story.content?.length || 0) / 1000)} min
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Related Stories */}
            <Card className="bg-card/50 backdrop-blur-sm border-border">
              <CardHeader>
                <CardTitle className="text-lg">More Dark Tales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    title: "The Midnight Visitor",
                    author: "DarkScribe",
                    likes: 234,
                  },
                  {
                    title: "Whispers in the Void",
                    author: "ShadowTeller",
                    likes: 189,
                  },
                  {
                    title: "The Last Confession",
                    author: "NightWhisperer",
                    likes: 156,
                  },
                ].map((relatedStory, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-lg bg-background/50 hover:bg-background/70 transition-colors cursor-pointer"
                  >
                    <h4 className="font-medium text-sm hover:text-primary transition-colors mb-1">
                      {relatedStory.title}
                    </h4>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>by {relatedStory.author}</span>
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        <span>{relatedStory.likes}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
