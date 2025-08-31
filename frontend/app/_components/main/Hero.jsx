import { Creepster, Inter } from "next/font/google";
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, PenTool, Users, TrendingUp, Ghost, Skull } from "lucide-react";
import Link from "next/link";

const creepster = Creepster({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-creepster",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const Hero = () => {
  const stats = [
    { icon: BookOpen, label: "Dark Stories", value: "1,247" },
    { icon: Users, label: "Storytellers", value: "892" },
    { icon: TrendingUp, label: "Monthly Reads", value: "15.2K" },
  ];

  const categories = [
    { name: "Horror", icon: Ghost, count: 342 },
    { name: "Thriller", icon: Skull, count: 289 },
    { name: "Supernatural", icon: Ghost, count: 156 },
    { name: "Psychological", icon: Skull, count: 203 },
  ];

  return (
    <div className="min-h-screen horror-gradient relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20"></div>
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-transparent to-background/80"></div>
      
      <div className="relative z-10 container mx-auto px-6 py-20">
        {/* Main Hero Section */}
        <div className="text-center mb-16">
          <div className="flex justify-center items-center gap-4 mb-6">
            <Skull className="w-12 h-12 text-primary animate-pulse" />
            <h1 className={`${creepster.className} text-6xl md:text-8xl font-bold text-foreground shadow-text`}>
              EviDark
            </h1>
            <Ghost className="w-12 h-12 text-primary animate-pulse" />
          </div>
          
          <p className={`${inter.className} text-2xl md:text-3xl text-muted-foreground mb-4 shadow-text`}>
            Where Darkness Tells Its Tales
          </p>
          
          <p className={`${inter.className} text-lg text-muted-foreground max-w-2xl mx-auto mb-8`}>
            Dive into the shadows of storytelling. Share your darkest tales, explore spine-chilling narratives, 
            and connect with fellow lovers of the macabre.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="spooky-glow text-lg px-8 py-6">
              <Link href="/explore">
                <BookOpen className="w-5 h-5 mr-2" />
                Explore Stories
              </Link>
            </Button>
            
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              <Link href="/create">
                <PenTool className="w-5 h-5 mr-2" />
                Write Your Tale
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {stats.map((stat, index) => (
            <Card key={index} className="bg-card/50 backdrop-blur-sm border-border hover:bg-card/70 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <stat.icon className="w-8 h-8 text-primary mx-auto mb-3" />
                <div className="text-3xl font-bold text-foreground mb-1">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Categories Section */}
        <div className="text-center mb-12">
          <h2 className={`${inter.className} text-3xl font-bold text-foreground mb-8`}>
            Explore Dark Categories
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category, index) => (
              <Link key={index} href={`/categories/${category.name.toLowerCase()}`}>
                <Card className="bg-card/30 backdrop-blur-sm border-border hover:bg-card/50 hover:border-primary/50 transition-all duration-300 cursor-pointer group">
                  <CardContent className="p-6 text-center">
                    <category.icon className="w-8 h-8 text-primary mx-auto mb-3 group-hover:scale-110 transition-transform duration-300" />
                    <div className="font-semibold text-foreground mb-1">{category.name}</div>
                    <Badge variant="secondary" className="text-xs">
                      {category.count} stories
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="bg-card/20 backdrop-blur-sm border-border max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h3 className={`${inter.className} text-2xl font-bold text-foreground mb-4`}>
                Ready to Share Your Dark Story?
              </h3>
              <p className="text-muted-foreground mb-6">
                Join our community of storytellers and let your imagination run wild in the shadows.
              </p>
              <Button asChild size="lg" className="spooky-glow">
                <Link href="/register">
                  <Users className="w-5 h-5 mr-2" />
                  Join the Darkness
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Hero;
