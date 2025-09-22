"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  HelpCircle,
  Search,
  BookOpen,
  Users,
  Shield,
  Zap,
  MessageCircle,
  Crown,
  Eye,
  Settings,
  ChevronDown,
  ChevronRight,
  Mail,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSection, setExpandedSection] = useState(null);

  const helpCategories = [
    {
      icon: BookOpen,
      title: "Getting Started",
      description: "New to EviDark? Learn the basics",
      color: "text-blue-400",
    },
    {
      icon: Users,
      title: "Community",
      description: "Connecting with other storytellers",
      color: "text-green-400",
    },
    {
      icon: Shield,
      title: "Safety & Guidelines",
      description: "Keeping our community safe",
      color: "text-red-400",
    },
    {
      icon: Zap,
      title: "Engagement System",
      description: "XP, badges, and leaderboards",
      color: "text-purple-400",
    },
    {
      icon: Settings,
      title: "Account & Privacy",
      description: "Managing your account settings",
      color: "text-orange-400",
    },
  ];

  const faqSections = [
    {
      id: "getting-started",
      title: "Getting Started",
      icon: BookOpen,
      questions: [
        {
          q: "How do I create my first story on EviDark?",
          a: "Click the 'Create Story' button in the top navigation or go to /create. Choose your story category, write your title and content, and click publish. Stories are immediately visible to the community unless you set them to private.",
        },
        {
          q: "What types of stories are welcome on EviDark?",
          a: "We welcome dark fiction, horror, mystery, thriller, supernatural tales, and psychological narratives. Content should be original and follow our community guidelines for mature, respectful storytelling.",
        },
        {
          q: "How do I find stories to read?",
          a: "Browse the home feed for recent stories, check out trending content, or use the search function to find specific topics or authors. You can also explore different categories and communities.",
        },
        {
          q: "Is EviDark free to use?",
          a: "Yes! EviDark is completely free to use. You can create stories, read content, engage with the community, and participate in all platform features without any cost.",
        },
      ],
    },
    {
      id: "community",
      title: "Community & Engagement",
      icon: Users,
      questions: [
        {
          q: "How do I follow other authors?",
          a: "Visit an author's profile and click the 'Follow' button. You'll see their new stories in your personalized feed and receive notifications about their latest content.",
        },
        {
          q: "What's the difference between comments and private messages?",
          a: "Comments are public discussions on stories visible to all readers. Private messages are direct conversations between users. Use comments for story feedback and discussions, messages for private communication.",
        },
        {
          q: "How do I join or create communities?",
          a: "Visit the Communities page to browse existing groups or create your own. Communities are themed spaces for specific types of stories or discussions, like 'Supernatural Horror' or 'Mystery Writers'.",
        },
        {
          q: "Can I collaborate with other writers?",
          a: "While direct collaboration features are planned, you can currently connect with writers through comments, messages, and community discussions to coordinate collaborative projects.",
        },
      ],
    },
    {
      id: "engagement",
      title: "Engagement System",
      icon: Zap,
      questions: [
        {
          q: "How does the XP system work?",
          a: "You earn XP for creating stories (+100 XP), reading stories to completion (+15 XP), and posting thoughtful comments (+10 XP). XP determines your level and position on leaderboards.",
        },
        {
          q: "What are badges and how do I earn them?",
          a: "Badges are achievements that recognize milestones like 'First Story', 'Active Reader', or 'Weekly Champion'. They're earned automatically based on your activities and engagement patterns.",
        },
        {
          q: "How are weekly rankings calculated?",
          a: "Weekly rankings are based on XP earned during the current week (Sunday to Saturday). Rankings reset every Sunday, giving everyone a fresh chance to climb the leaderboard.",
        },
        {
          q: "What counts as 'completing' a story for XP?",
          a: "A story is considered completed when you spend at least 15 seconds reading and scroll near the bottom, or spend 30+ seconds on the page. This ensures you've actually engaged with the content.",
        },
      ],
    },
    {
      id: "safety",
      title: "Safety & Guidelines",
      icon: Shield,
      questions: [
        {
          q: "What content is not allowed on EviDark?",
          a: "We prohibit content promoting real violence, hate speech, harassment, explicit sexual content, spam, or copyright infringement. Dark fiction is welcome, but it should be creative storytelling, not harmful content.",
        },
        {
          q: "How do I report inappropriate content or users?",
          a: "Use the report button on stories, comments, or profiles. You can also contact our moderation team directly through the contact form. All reports are reviewed within 2 hours.",
        },
        {
          q: "What happens if I violate community guidelines?",
          a: "Violations may result in content removal, warnings, temporary suspensions, or account termination depending on severity. We aim to educate rather than punish, but serious violations have immediate consequences.",
        },
        {
          q: "How do you protect user privacy?",
          a: "We use encryption, strict access controls, and never sell user data. You control your content visibility and can delete your account anytime. See our Privacy Policy for full details.",
        },
      ],
    },
    {
      id: "account",
      title: "Account & Privacy",
      icon: Settings,
      questions: [
        {
          q: "How do I change my username or profile information?",
          a: "Go to your account settings (click your profile picture → Settings) to update your username, bio, avatar, and other profile information. Some changes may require email verification.",
        },
        {
          q: "Can I make my profile or stories private?",
          a: "Yes! You can set individual stories to private (visible only to you) or adjust your profile visibility in settings. Private stories don't appear in feeds or search results.",
        },
        {
          q: "How do I delete my account?",
          a: "In account settings, you'll find a 'Delete Account' option. This permanently removes your account and personal data, though public content may remain for platform integrity.",
        },
        {
          q: "I forgot my password. How do I reset it?",
          a: "Click 'Forgot Password' on the login page and enter your email. You'll receive a reset link within minutes. If you don't see it, check your spam folder.",
        },
      ],
    },
  ];

  const quickLinks = [
    { title: "Community Guidelines", href: "/terms#guidelines", icon: Shield },
    { title: "Privacy Policy", href: "/privacy", icon: Eye },
    { title: "Terms of Service", href: "/terms", icon: BookOpen },
    { title: "Contact Support", href: "/contact", icon: Mail },
  ];

  const filteredFAQs = faqSections
    .map((section) => ({
      ...section,
      questions: section.questions.filter(
        (item) =>
          item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.a.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((section) => section.questions.length > 0);

  const toggleSection = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <HelpCircle className="w-10 h-10 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">Help Center</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Find answers to common questions and learn how to make the most of
          EviDark.
        </p>
      </div>

      {/* Search */}
      <Card className="evidark-card border-border">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search help articles and FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-secondary border-border text-foreground"
            />
          </div>
        </CardContent>
      </Card>

      {/* Help Categories */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground text-center">
          Browse by Category
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {helpCategories.map((category, index) => (
            <Card
              key={index}
              className="evidark-card border-border hover:border-primary/30 transition-colors cursor-pointer"
              onClick={() => {
                const element = document.getElementById(faqSections[index]?.id);
                element?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <CardContent className="p-6 text-center space-y-3">
                <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <category.icon className={`w-6 h-6 ${category.color}`} />
                </div>
                <h3 className="font-semibold text-foreground">
                  {category.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {category.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* FAQ Sections */}
      <div className="space-y-6" id="faq">
        <h2 className="text-2xl font-bold text-foreground text-center">
          Frequently Asked Questions
        </h2>

        {(searchQuery ? filteredFAQs : faqSections).map((section) => (
          <Card
            key={section.id}
            id={section.id}
            className="evidark-card border-border"
          >
            <CardHeader
              className="cursor-pointer hover:bg-secondary/30 transition-colors"
              onClick={() => toggleSection(section.id)}
            >
              <CardTitle className="text-xl text-foreground flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <section.icon className="w-6 h-6 text-primary" />
                  {section.title}
                  <Badge
                    variant="outline"
                    className="text-primary border-primary/20"
                  >
                    {section.questions.length} questions
                  </Badge>
                </div>
                {expandedSection === section.id ? (
                  <ChevronDown className="w-5 h-5" />
                ) : (
                  <ChevronRight className="w-5 h-5" />
                )}
              </CardTitle>
            </CardHeader>

            {(expandedSection === section.id || searchQuery) && (
              <CardContent className="space-y-6">
                {section.questions.map((faq, index) => (
                  <div key={index} className="space-y-3">
                    <h3 className="font-semibold text-foreground">{faq.q}</h3>
                    <p className="text-muted-foreground leading-relaxed pl-4 border-l-2 border-primary/20">
                      {faq.a}
                    </p>
                    {index < section.questions.length - 1 && (
                      <hr className="border-border" />
                    )}
                  </div>
                ))}
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Quick Links */}
      <Card className="evidark-card border-border">
        <CardHeader>
          <CardTitle className="text-xl text-foreground text-center">
            Additional Resources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickLinks.map((link, index) => (
              <Button
                key={index}
                variant="ghost"
                className="h-auto p-4 flex flex-col items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                asChild
              >
                <Link href={link.href}>
                  <link.icon className="w-6 h-6" />
                  <span className="text-sm text-center">{link.title}</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Community Guidelines Section */}
      <Card className="evidark-card border-border" id="guidelines">
        <CardHeader>
          <CardTitle className="text-xl text-foreground flex items-center gap-3">
            <Shield className="w-6 h-6 text-primary" />
            Community Guidelines Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground leading-relaxed">
            EviDark thrives on creative freedom within respectful boundaries.
            Here are our core community principles:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-green-400">✓ We Encourage</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Original dark fiction and creative storytelling</li>
                <li>• Constructive feedback and thoughtful discussions</li>
                <li>• Respectful engagement with diverse perspectives</li>
                <li>• Supporting fellow writers and readers</li>
                <li>• Reporting content that violates guidelines</li>
              </ul>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-red-400">✗ We Prohibit</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Harassment, bullying, or personal attacks</li>
                <li>• Content promoting real-world violence or harm</li>
                <li>• Spam, misleading content, or fake profiles</li>
                <li>• Copyright infringement or plagiarism</li>
                <li>• Sharing personal information without consent</li>
              </ul>
            </div>
          </div>

          <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
            <p className="text-sm text-foreground">
              <strong>Remember:</strong> When in doubt, ask yourself if your
              content or behavior contributes positively to our community of
              storytellers. We&apos;re here to support creative expression while
              maintaining a safe, welcoming environment for all.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Still Need Help */}
      <Card className="evidark-card border-border bg-gradient-to-r from-primary/5 to-primary/10">
        <CardContent className="p-8 text-center space-y-6">
          <h2 className="text-2xl font-bold text-foreground">
            Still Need Help?
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Can&apos;t find what you&apos;re looking for? Our support team is
            here to help with any questions, issues, or feedback you might have.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              asChild
            >
              <Link href="/contact">
                <Mail className="w-4 h-4 mr-2" />
                Contact Support
              </Link>
            </Button>
            <Button
              variant="outline"
              className="border-primary/20 text-foreground hover:bg-primary/10"
              asChild
            >
              <Link href="/communities">
                <MessageCircle className="w-4 h-4 mr-2" />
                Ask Community
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
