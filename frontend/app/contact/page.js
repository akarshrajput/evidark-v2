"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  MessageCircle,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Shield,
  Bug,
  Lightbulb,
  Users,
  Heart,
} from "lucide-react";
import { toast } from "sonner";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    category: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contactReasons = [
    {
      icon: HelpCircle,
      title: "General Support",
      description: "Questions about using EviDark",
      category: "support",
    },
    {
      icon: Bug,
      title: "Bug Report",
      description: "Found something that&apos;s not working?",
      category: "bug",
    },
    {
      icon: Lightbulb,
      title: "Feature Request",
      description: "Ideas to improve our platform",
      category: "feature",
    },
    {
      icon: Shield,
      title: "Content Moderation",
      description: "Report inappropriate content",
      category: "moderation",
    },
    {
      icon: Users,
      title: "Partnership",
      description: "Business and collaboration inquiries",
      category: "business",
    },
    {
      icon: Heart,
      title: "Feedback",
      description: "Share your thoughts about EviDark",
      category: "feedback",
    },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCategorySelect = (category, title) => {
    setFormData((prev) => ({
      ...prev,
      category,
      subject: title,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success("Message sent successfully!", {
        description: "We&apos;ll get back to you within 24 hours.",
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        subject: "",
        category: "",
        message: "",
      });
    } catch (error) {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">Get in Touch</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Have questions, feedback, or need support? We&apos;re here to help you
          navigate the darkness.
        </p>
      </div>

      {/* Contact Reasons */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground text-center">
          How Can We Help?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {contactReasons.map((reason, index) => (
            <Card
              key={index}
              className={`evidark-card border-border cursor-pointer transition-all hover:border-primary/30 ${
                formData.category === reason.category
                  ? "border-primary/50 bg-primary/5"
                  : ""
              }`}
              onClick={() =>
                handleCategorySelect(reason.category, reason.title)
              }
            >
              <CardContent className="p-4 text-center space-y-3">
                <div className="w-10 h-10 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                  <reason.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">
                  {reason.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {reason.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Contact Form */}
        <div className="lg:col-span-2">
          <Card className="evidark-card border-border">
            <CardHeader>
              <CardTitle className="text-2xl text-foreground flex items-center gap-3">
                <MessageCircle className="w-6 h-6 text-primary" />
                Send Us a Message
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Name *
                    </label>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Your name"
                      className="bg-secondary border-border text-foreground"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Email *
                    </label>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your.email@example.com"
                      className="bg-secondary border-border text-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Subject
                  </label>
                  <Input
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder="What's this about?"
                    className="bg-secondary border-border text-foreground"
                  />
                </div>

                {formData.category && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Category
                    </label>
                    <Badge
                      variant="outline"
                      className="text-primary border-primary/20"
                    >
                      {
                        contactReasons.find(
                          (r) => r.category === formData.category
                        )?.title
                      }
                    </Badge>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">
                    Message *
                  </label>
                  <Textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Tell us more about your inquiry..."
                    rows={6}
                    className="bg-secondary border-border text-foreground resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Contact Information */}
        <div className="space-y-6">
          {/* Response Time */}
          <Card className="evidark-card border-border">
            <CardHeader>
              <CardTitle className="text-lg text-foreground flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Response Time
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-muted-foreground">
                  General inquiries: 24 hours
                </span>
              </div>
              <div className="flex items-center gap-3">
                <AlertCircle className="w-4 h-4 text-orange-500" />
                <span className="text-sm text-muted-foreground">
                  Urgent issues: 4-6 hours
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-red-500" />
                <span className="text-sm text-muted-foreground">
                  Content reports: 2 hours
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Contact Methods */}
          <Card className="evidark-card border-border">
            <CardHeader>
              <CardTitle className="text-lg text-foreground">
                Other Ways to Reach Us
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Email</p>
                  <p className="text-sm text-muted-foreground">
                    support@evidark.com
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MessageCircle className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Community
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Join our Discord server
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Location
                  </p>
                  <p className="text-sm text-muted-foreground">
                    The Shadow Realm
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* FAQ Quick Links */}
          <Card className="evidark-card border-border">
            <CardHeader>
              <CardTitle className="text-lg text-foreground">
                Quick Help
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="ghost"
                className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                asChild
              >
                <a href="/help">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Help Center
                </a>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                asChild
              >
                <a href="/help#faq">
                  <MessageCircle className="w-4 h-4 mr-2" />
                  FAQ
                </a>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                asChild
              >
                <a href="/help#guidelines">
                  <Shield className="w-4 h-4 mr-2" />
                  Community Guidelines
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Emergency Contact */}
      <Card className="evidark-card border-red-500/20 bg-red-500/5">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-red-500 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Emergency & Safety
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                If you encounter content that violates our community guidelines
                or poses safety concerns, please report it immediately using our
                built-in reporting system or contact us directly. We take all
                safety reports seriously and respond within 2 hours.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
