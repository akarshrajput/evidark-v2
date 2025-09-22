"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Skull,
  BookOpen,
  Users,
  Shield,
  Zap,
  Target,
  Heart,
  Globe,
  Award,
  Eye,
  MessageCircle,
  Crown,
  Github,
  Twitter,
  Mail,
} from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  const features = [
    {
      icon: BookOpen,
      title: "Dark Storytelling",
      description:
        "Professional platform for horror, mystery, and supernatural narratives",
    },
    {
      icon: Users,
      title: "Community Driven",
      description:
        "Connect with fellow dark fiction enthusiasts and storytellers",
    },
    {
      icon: Shield,
      title: "Safe Environment",
      description: "Moderated content with respect for creative expression",
    },
    {
      icon: Zap,
      title: "Engagement System",
      description:
        "XP, badges, and leaderboards to reward active participation",
    },
    {
      icon: Target,
      title: "Quality Focus",
      description: "Curated content with emphasis on well-crafted stories",
    },
    {
      icon: Globe,
      title: "Global Reach",
      description: "Writers and readers from around the world unite",
    },
  ];

  const stats = [
    { label: "Active Writers", value: "1,337+", icon: Users },
    { label: "Stories Published", value: "666+", icon: BookOpen },
    { label: "Communities", value: "13+", icon: MessageCircle },
    { label: "Monthly Readers", value: "10K+", icon: Eye },
  ];

  const team = [
    {
      name: "The Architect",
      role: "Platform Creator",
      description: "Envisioned EviDark as a sanctuary for dark fiction",
      avatar: "🏗️",
    },
    {
      name: "Shadow Moderators",
      role: "Community Guardians",
      description: "Ensuring quality and safety in our dark corners",
      avatar: "👥",
    },
    {
      name: "The Collective",
      role: "Our Writers",
      description: "The heart and soul of EviDark&apos;s storytelling",
      avatar: "✍️",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Skull className="w-12 h-12 text-primary" />
          <h1 className="text-5xl font-bold text-foreground">EviDark</h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Where Evidence Meets Darkness - A professional platform dedicated to
          the art of dark storytelling, bringing together writers and readers
          who appreciate the beauty in shadows.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Badge
            variant="outline"
            className="text-primary border-primary/20 px-4 py-2"
          >
            <Crown className="w-4 h-4 mr-2" />
            Premium Quality
          </Badge>
          <Badge
            variant="outline"
            className="text-primary border-primary/20 px-4 py-2"
          >
            <Award className="w-4 h-4 mr-2" />
            Community Driven
          </Badge>
          <Badge
            variant="outline"
            className="text-primary border-primary/20 px-4 py-2"
          >
            <Shield className="w-4 h-4 mr-2" />
            Safe Space
          </Badge>
        </div>
      </div>

      {/* Mission Statement */}
      <Card className="evidark-card border-border">
        <CardHeader>
          <CardTitle className="text-2xl text-foreground flex items-center gap-3">
            <Heart className="w-6 h-6 text-primary" />
            Our Mission
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-foreground text-lg leading-relaxed">
            EviDark exists to celebrate the profound art of dark fiction. We
            believe that within shadows lie the most compelling truths, and
            through darkness, we find the light of exceptional storytelling.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Our platform provides a professional, respectful environment where
            writers can craft their darkest tales and readers can discover
            stories that challenge, thrill, and inspire. We&apos;re not just
            another platform - we&apos;re a sanctuary for those who understand
            that the best stories often emerge from the depths.
          </p>
        </CardContent>
      </Card>

      {/* Features Grid */}
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-foreground text-center">
          What Makes Us Special
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="evidark-card border-border hover:border-primary/30 transition-colors"
            >
              <CardContent className="p-6 text-center space-y-4">
                <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Statistics */}
      <Card className="evidark-card border-border">
        <CardHeader>
          <CardTitle className="text-2xl text-foreground text-center">
            Our Growing Community
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center space-y-2">
                <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Team Section */}
      <div className="space-y-6">
        <h2 className="text-3xl font-bold text-foreground text-center">
          The Shadows Behind EviDark
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {team.map((member, index) => (
            <Card key={index} className="evidark-card border-border">
              <CardContent className="p-6 text-center space-y-4">
                <div className="text-4xl">{member.avatar}</div>
                <h3 className="text-lg font-semibold text-foreground">
                  {member.name}
                </h3>
                <Badge
                  variant="outline"
                  className="text-primary border-primary/20"
                >
                  {member.role}
                </Badge>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {member.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Values */}
      <Card className="evidark-card border-border">
        <CardHeader>
          <CardTitle className="text-2xl text-foreground text-center">
            Our Core Values
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">
                Creative Freedom
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                We believe in the power of unrestricted creativity within
                respectful boundaries. Dark fiction thrives when authors feel
                free to explore complex themes.
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">
                Quality Over Quantity
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Every story matters. We focus on fostering well-crafted
                narratives rather than overwhelming readers with volume.
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">
                Community Respect
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Our community is built on mutual respect, constructive feedback,
                and support for fellow storytellers.
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-foreground">
                Continuous Evolution
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                We&apos;re constantly improving our platform based on community
                feedback and emerging storytelling trends.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <Card className="evidark-card border-border bg-gradient-to-r from-primary/5 to-primary/10">
        <CardContent className="p-8 text-center space-y-6">
          <h2 className="text-2xl font-bold text-foreground">
            Join the Darkness
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Ready to share your dark tales or discover stories that will haunt
            your thoughts? Join our growing community of passionate storytellers
            and readers.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <BookOpen className="w-4 h-4 mr-2" />
              Start Writing
            </Button>
            <Button
              variant="outline"
              className="border-primary/20 text-foreground hover:bg-primary/10"
            >
              <Eye className="w-4 h-4 mr-2" />
              Browse Stories
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Contact & Social */}
      <div className="text-center space-y-4">
        <h3 className="text-lg font-semibold text-foreground">
          Connect With Us
        </h3>
        <div className="flex justify-center gap-4">
          <Link
            href="/contact"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <Mail className="w-5 h-5" />
          </Link>
          <Link
            href="#"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <Twitter className="w-5 h-5" />
          </Link>
          <Link
            href="#"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <Github className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
