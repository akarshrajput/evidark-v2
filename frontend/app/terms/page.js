"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Scale,
  Users,
  Shield,
  AlertTriangle,
  BookOpen,
  MessageCircle,
  Ban,
  Crown,
  Eye,
  Lock,
  Calendar,
  Mail,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";

export default function TermsPage() {
  const lastUpdated = "September 7, 2025";
  const effectiveDate = "September 7, 2025";

  const keyTerms = [
    {
      icon: Users,
      title: "User Responsibilities",
      description: "What we expect from our community members",
    },
    {
      icon: BookOpen,
      title: "Content Guidelines",
      description: "Rules for creating and sharing stories",
    },
    {
      icon: Shield,
      title: "Platform Security",
      description: "How we protect our community",
    },
    {
      icon: Scale,
      title: "Legal Compliance",
      description: "Your rights and our obligations",
    },
  ];

  const prohibitedActions = [
    "Harassment, bullying, or threatening other users",
    "Sharing content that promotes violence or illegal activities",
    "Attempting to hack, spam, or disrupt platform functionality",
    "Creating multiple accounts to manipulate engagement systems",
    "Sharing copyrighted content without proper authorization",
    "Posting content that violates privacy rights of others",
    "Using the platform for commercial spam or unauthorized advertising",
    "Impersonating other users or creating fake profiles",
  ];

  const contentGuidelines = [
    {
      allowed: true,
      title: "Dark Fiction & Horror",
      description:
        "Original stories exploring dark themes, supernatural elements, and psychological horror",
    },
    {
      allowed: true,
      title: "Mystery & Thriller",
      description:
        "Suspenseful narratives, crime stories, and investigative fiction",
    },
    {
      allowed: true,
      title: "Mature Themes",
      description:
        "Content dealing with complex adult themes, properly tagged and age-appropriate",
    },
    {
      allowed: false,
      title: "Explicit Violence",
      description:
        "Gratuitous violence, gore, or content that glorifies real-world harm",
    },
    {
      allowed: false,
      title: "Hate Content",
      description:
        "Content promoting discrimination, hate speech, or targeting specific groups",
    },
    {
      allowed: false,
      title: "Personal Information",
      description:
        "Sharing personal details, contact information, or private data of real individuals",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Scale className="w-10 h-10 text-primary" />
          <h1 className="text-4xl font-bold text-foreground">
            Terms of Service
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          These terms govern your use of EviDark and establish the foundation
          for our community.
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Last updated: {lastUpdated}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Effective: {effectiveDate}</span>
          </div>
        </div>
      </div>

      {/* Key Terms Overview */}
      <Card className="evidark-card border-border">
        <CardHeader>
          <CardTitle className="text-2xl text-foreground text-center">
            Terms Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {keyTerms.map((term, index) => (
              <div key={index} className="text-center space-y-3">
                <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <term.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">{term.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {term.description}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Acceptance of Terms */}
      <Card className="evidark-card border-border">
        <CardHeader>
          <CardTitle className="text-xl text-foreground flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-primary" />
            Acceptance of Terms
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            By accessing or using EviDark, you agree to be bound by these Terms
            of Service and all applicable laws and regulations. If you do not
            agree with any of these terms, you are prohibited from using or
            accessing this platform.
          </p>
          <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
            <p className="text-sm text-foreground">
              <strong>Important:</strong> These terms constitute a legally
              binding agreement between you and EviDark. Please read them
              carefully before using our platform.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* User Accounts */}
      <Card className="evidark-card border-border">
        <CardHeader>
          <CardTitle className="text-xl text-foreground flex items-center gap-3">
            <Users className="w-6 h-6 text-primary" />
            User Accounts & Responsibilities
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-foreground mb-2">
                Account Creation
              </h3>
              <p className="text-muted-foreground">
                You must be at least 16 years old to create an account. You are
                responsible for maintaining the confidentiality of your account
                credentials and for all activities that occur under your
                account.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">
                Account Security
              </h3>
              <p className="text-muted-foreground">
                You must immediately notify us of any unauthorized use of your
                account. We are not liable for any losses resulting from
                unauthorized access to your account.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">
                Accurate Information
              </h3>
              <p className="text-muted-foreground">
                You agree to provide accurate, current, and complete information
                during registration and to update such information to keep it
                accurate, current, and complete.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Guidelines */}
      <Card className="evidark-card border-border">
        <CardHeader>
          <CardTitle className="text-xl text-foreground flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-primary" />
            Content Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">
            EviDark welcomes creative dark fiction while maintaining community
            standards. Here&apos;s what is and isn&apos;t allowed:
          </p>

          <div className="space-y-4">
            {contentGuidelines.map((guideline, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-4 rounded-lg border border-border"
              >
                {guideline.allowed ? (
                  <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                )}
                <div>
                  <h3 className="font-semibold text-foreground">
                    {guideline.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {guideline.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-yellow-500/5 p-4 rounded-lg border border-yellow-500/20">
            <p className="text-sm text-foreground">
              <strong>Note:</strong> Content that falls into gray areas will be
              reviewed by our moderation team. When in doubt, err on the side of
              community safety and creative expression within our guidelines.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Prohibited Activities */}
      <Card className="evidark-card border-border">
        <CardHeader>
          <CardTitle className="text-xl text-foreground flex items-center gap-3">
            <Ban className="w-6 h-6 text-primary" />
            Prohibited Activities
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The following activities are strictly prohibited and may result in
            account suspension or termination:
          </p>

          <div className="space-y-2">
            {prohibitedActions.map((action, index) => (
              <div key={index} className="flex items-start gap-3">
                <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-muted-foreground">{action}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Intellectual Property */}
      <Card className="evidark-card border-border">
        <CardHeader>
          <CardTitle className="text-xl text-foreground flex items-center gap-3">
            <Crown className="w-6 h-6 text-primary" />
            Intellectual Property Rights
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-foreground mb-2">
                Your Content
              </h3>
              <p className="text-muted-foreground">
                You retain all rights to content you create and publish on
                EviDark. By posting content, you grant us a non-exclusive
                license to display, distribute, and promote your content on our
                platform.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">
                Platform Rights
              </h3>
              <p className="text-muted-foreground">
                EviDark&apos;s platform, design, features, and functionality are
                owned by us and protected by intellectual property laws. You may
                not copy, modify, or distribute any part of our platform without
                permission.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">
                Copyright Compliance
              </h3>
              <p className="text-muted-foreground">
                We respect intellectual property rights and expect users to do
                the same. We will respond to valid copyright notices and may
                remove infringing content and suspend repeat offenders.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Privacy & Data */}
      <Card className="evidark-card border-border">
        <CardHeader>
          <CardTitle className="text-xl text-foreground flex items-center gap-3">
            <Lock className="w-6 h-6 text-primary" />
            Privacy & Data Protection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            Your privacy is important to us. Our collection, use, and protection
            of your personal information is governed by our Privacy Policy,
            which is incorporated into these terms by reference.
          </p>
          <Button
            variant="outline"
            className="border-primary/20 text-foreground hover:bg-primary/10"
            asChild
          >
            <Link href="/privacy">
              <Eye className="w-4 h-4 mr-2" />
              Read Privacy Policy
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Enforcement & Consequences */}
      <Card className="evidark-card border-border">
        <CardHeader>
          <CardTitle className="text-xl text-foreground flex items-center gap-3">
            <Shield className="w-6 h-6 text-primary" />
            Enforcement & Consequences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-foreground mb-2">
                Violation Consequences
              </h3>
              <p className="text-muted-foreground">
                Violations of these terms may result in warnings, content
                removal, temporary suspensions, or permanent account
                termination, depending on the severity and frequency of
                violations.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">
                Appeal Process
              </h3>
              <p className="text-muted-foreground">
                If you believe an enforcement action was taken in error, you may
                appeal through our contact form within 30 days of the action.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">
                Immediate Termination
              </h3>
              <p className="text-muted-foreground">
                We reserve the right to immediately terminate accounts for
                severe violations including illegal activities, threats of
                violence, or repeated harassment.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimers & Limitations */}
      <Card className="evidark-card border-border">
        <CardHeader>
          <CardTitle className="text-xl text-foreground flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-primary" />
            Disclaimers & Limitations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-foreground mb-2">
                Service Availability
              </h3>
              <p className="text-muted-foreground">
                We strive to maintain continuous service but cannot guarantee
                uninterrupted access. We may temporarily suspend the service for
                maintenance or updates.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">
                Content Disclaimer
              </h3>
              <p className="text-muted-foreground">
                User-generated content represents the views of individual
                authors, not EviDark. We do not endorse or guarantee the
                accuracy of user content.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">
                Limitation of Liability
              </h3>
              <p className="text-muted-foreground">
                To the maximum extent permitted by law, EviDark shall not be
                liable for any indirect, incidental, special, or consequential
                damages arising from your use of the platform.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Changes to Terms */}
      <Card className="evidark-card border-border">
        <CardHeader>
          <CardTitle className="text-xl text-foreground flex items-center gap-3">
            <Calendar className="w-6 h-6 text-primary" />
            Changes to These Terms
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            We may modify these terms from time to time to reflect changes in
            our services, legal requirements, or community needs. When we make
            significant changes, we will notify users via email or platform
            notice.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Your continued use of EviDark after changes take effect constitutes
            acceptance of the new terms. If you disagree with changes, you may
            terminate your account before they take effect.
          </p>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="evidark-card border-border">
          <CardHeader>
            <CardTitle className="text-lg text-foreground flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              Questions About Terms?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">
              If you have questions about these terms or need clarification on
              any policies, contact our support team.
            </p>
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              asChild
            >
              <Link href="/contact">
                <Mail className="w-4 h-4 mr-2" />
                Contact Support
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="evidark-card border-border">
          <CardHeader>
            <CardTitle className="text-lg text-foreground flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              Community Guidelines
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground text-sm">
              Learn more about our community standards and best practices for
              engaging on EviDark.
            </p>
            <Button
              variant="outline"
              className="w-full border-primary/20 text-foreground hover:bg-primary/10"
              asChild
            >
              <Link href="/help#guidelines">
                <BookOpen className="w-4 h-4 mr-2" />
                Community Guidelines
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Governing Law */}
      <Card className="evidark-card border-yellow-500/20 bg-yellow-500/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Scale className="w-6 h-6 text-yellow-500 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Governing Law & Jurisdiction
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                These terms are governed by applicable laws without regard to
                conflict of law principles. Any disputes arising from these
                terms or your use of EviDark will be resolved through binding
                arbitration or in courts of competent jurisdiction. By using our
                platform, you consent to the exclusive jurisdiction of these
                courts.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
