"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Lock,
  Eye,
  Users,
  Database,
  Cookie,
  Mail,
  Settings,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Globe,
} from "lucide-react";
import Link from "next/link";

export default function PrivacyPage() {
  const lastUpdated = "September 7, 2025";

  const sections = [
    {
      icon: Database,
      title: "Information We Collect",
      content: [
        {
          subtitle: "Account Information",
          text: "When you create an account, we collect your username, email address, and profile information you choose to provide.",
        },
        {
          subtitle: "Content Data",
          text: "Stories, comments, and other content you create on our platform, including engagement metrics like reading time and interaction history.",
        },
        {
          subtitle: "Usage Analytics",
          text: "How you interact with our platform, including pages visited, features used, and time spent reading, to improve your experience.",
        },
        {
          subtitle: "Technical Data",
          text: "IP address, browser type, device information, and performance data to ensure platform security and functionality.",
        },
      ],
    },
    {
      icon: Eye,
      title: "How We Use Your Information",
      content: [
        {
          subtitle: "Platform Functionality",
          text: "To provide core features like story publishing, reading tracking, engagement systems, and personalized recommendations.",
        },
        {
          subtitle: "Community Features",
          text: "To enable social features like following authors, commenting, community participation, and leaderboards.",
        },
        {
          subtitle: "Communication",
          text: "To send important account notifications, platform updates, and respond to your inquiries.",
        },
        {
          subtitle: "Security & Safety",
          text: "To protect against fraud, abuse, and ensure community guidelines are followed.",
        },
      ],
    },
    {
      icon: Users,
      title: "Information Sharing",
      content: [
        {
          subtitle: "Public Content",
          text: "Stories, comments, and profile information you choose to make public are visible to other users and may appear in search results.",
        },
        {
          subtitle: "Aggregated Data",
          text: "We may share anonymized, aggregated statistics about platform usage, but never personal information that identifies you.",
        },
        {
          subtitle: "Legal Requirements",
          text: "We may disclose information when required by law, to protect our rights, or in response to valid legal processes.",
        },
        {
          subtitle: "Service Providers",
          text: "We work with trusted third-party services for hosting, analytics, and email delivery, all bound by strict privacy agreements.",
        },
      ],
    },
    {
      icon: Lock,
      title: "Data Security",
      content: [
        {
          subtitle: "Encryption",
          text: "All data transmission is encrypted using industry-standard SSL/TLS protocols. Sensitive data is encrypted at rest.",
        },
        {
          subtitle: "Access Controls",
          text: "Strict access controls ensure only authorized personnel can access user data, and all access is logged and monitored.",
        },
        {
          subtitle: "Regular Audits",
          text: "We conduct regular security audits and vulnerability assessments to maintain the highest security standards.",
        },
        {
          subtitle: "Incident Response",
          text: "We have procedures in place to quickly detect, contain, and notify users of any security incidents.",
        },
      ],
    },
    {
      icon: Settings,
      title: "Your Rights & Controls",
      content: [
        {
          subtitle: "Access & Download",
          text: "You can access and download your personal data and content at any time through your account settings.",
        },
        {
          subtitle: "Correction & Updates",
          text: "You can update your profile information, preferences, and account settings whenever needed.",
        },
        {
          subtitle: "Content Control",
          text: "You have full control over your stories and comments - edit, delete, or change visibility settings at any time.",
        },
        {
          subtitle: "Account Deletion",
          text: "You can permanently delete your account and all associated data, though public content may remain for platform integrity.",
        },
      ],
    },
    {
      icon: Cookie,
      title: "Cookies & Tracking",
      content: [
        {
          subtitle: "Essential Cookies",
          text: "Required for basic platform functionality like authentication, security, and remembering your preferences.",
        },
        {
          subtitle: "Analytics Cookies",
          text: "Help us understand how users interact with our platform to improve features and user experience.",
        },
        {
          subtitle: "Personalization",
          text: "Store your reading preferences, theme settings, and other customization choices.",
        },
        {
          subtitle: "Cookie Management",
          text: "You can control cookie preferences through your browser settings, though some features may be limited.",
        },
      ],
    },
  ];

  const principles = [
    {
      icon: Shield,
      title: "Privacy by Design",
      description:
        "Privacy considerations are built into every feature from the ground up",
    },
    {
      icon: Lock,
      title: "Data Minimization",
      description: "We only collect data necessary for platform functionality",
    },
    {
      icon: Eye,
      title: "Transparency",
      description:
        "Clear information about what data we collect and how it's used",
    },
    {
      icon: Users,
      title: "User Control",
      description: "You maintain control over your data and privacy settings",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Shield className="w-10 h-10 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">Privacy Policy</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Your privacy is fundamental to us. This policy explains how we
          collect, use, and protect your information on EviDark.
        </p>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>Last updated: {lastUpdated}</span>
        </div>
      </div>

      {/* Privacy Principles */}
      <Card className="evidark-card border-border">
        <CardHeader>
          <CardTitle className="text-2xl text-foreground text-center">
            Our Privacy Principles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {principles.map((principle, index) => (
              <div key={index} className="text-center space-y-3">
                <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <principle.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">
                  {principle.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {principle.description}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Summary */}
      <Card className="evidark-card border-border bg-primary/5">
        <CardHeader>
          <CardTitle className="text-xl text-foreground flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-primary" />
            Privacy at a Glance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
              <span className="text-sm text-muted-foreground">
                We never sell your personal data
              </span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
              <span className="text-sm text-muted-foreground">
                You control your content visibility
              </span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
              <span className="text-sm text-muted-foreground">
                End-to-end encryption for sensitive data
              </span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-4 h-4 text-green-500 mt-1 flex-shrink-0" />
              <span className="text-sm text-muted-foreground">
                Right to delete your account anytime
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Sections */}
      <div className="space-y-8">
        {sections.map((section, index) => (
          <Card key={index} className="evidark-card border-border">
            <CardHeader>
              <CardTitle className="text-xl text-foreground flex items-center gap-3">
                <section.icon className="w-6 h-6 text-primary" />
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {section.content.map((item, itemIndex) => (
                <div key={itemIndex} className="space-y-2">
                  <h3 className="font-semibold text-foreground">
                    {item.subtitle}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {item.text}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Children's Privacy */}
      <Card className="evidark-card border-border">
        <CardHeader>
          <CardTitle className="text-xl text-foreground flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-primary" />
            Children&apos;s Privacy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            EviDark is intended for users aged 16 and older due to the mature
            nature of dark fiction content. We do not knowingly collect personal
            information from children under 16. If we become aware that we have
            collected personal information from a child under 16, we will take
            steps to delete such information.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            If you are a parent or guardian and believe your child has provided
            us with personal information, please contact us immediately so we
            can address the situation appropriately.
          </p>
        </CardContent>
      </Card>

      {/* International Users */}
      <Card className="evidark-card border-border">
        <CardHeader>
          <CardTitle className="text-xl text-foreground flex items-center gap-3">
            <Globe className="w-6 h-6 text-primary" />
            International Users
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            EviDark is accessible globally, and we comply with applicable
            privacy laws including GDPR, CCPA, and other regional privacy
            regulations. If you&apos;re located outside our primary
            jurisdiction, your information may be transferred to and processed
            in countries with different privacy laws.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">
                GDPR Rights (EU Users)
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Right to access your data</li>
                <li>• Right to rectification</li>
                <li>• Right to erasure</li>
                <li>• Right to data portability</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground">
                CCPA Rights (California Users)
              </h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Right to know about data collection</li>
                <li>• Right to delete personal information</li>
                <li>• Right to opt-out of data sales</li>
                <li>• Right to non-discrimination</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact & Updates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="evidark-card border-border">
          <CardHeader>
            <CardTitle className="text-lg text-foreground flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              Privacy Questions?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">
              If you have questions about this privacy policy or how we handle
              your data, we&apos;re here to help.
            </p>
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              asChild
            >
              <Link href="/contact">
                <Mail className="w-4 h-4 mr-2" />
                Contact Privacy Team
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="evidark-card border-border">
          <CardHeader>
            <CardTitle className="text-lg text-foreground flex items-center gap-2">
              <Settings className="w-5 h-5 text-primary" />
              Manage Your Privacy
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">
              Control your privacy settings, download your data, or delete your
              account.
            </p>
            <Button
              variant="outline"
              className="w-full border-primary/20 text-foreground hover:bg-primary/10"
              asChild
            >
              <Link href="/user/settings">
                <Settings className="w-4 h-4 mr-2" />
                Privacy Settings
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Policy Updates */}
      <Card className="evidark-card border-yellow-500/20 bg-yellow-500/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Calendar className="w-6 h-6 text-yellow-500 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Policy Updates
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                We may update this privacy policy from time to time to reflect
                changes in our practices or legal requirements. When we make
                significant changes, we&apos;ll notify you via email or through
                a prominent notice on our platform. Your continued use of
                EviDark after such changes constitutes acceptance of the updated
                policy.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
