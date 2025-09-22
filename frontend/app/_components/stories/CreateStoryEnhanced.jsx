"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import api from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import TiptapEditor from "../editor/TipTapEditor";
import TagInput from "../ui/TagInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  PenTool,
  Save,
  Eye,
  Skull,
  Ghost,
  Crown,
  Star,
  AlertTriangle,
  Clock,
  Users,
  Zap,
  BookOpen,
  Shield,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";

const CreateStoryEnhanced = () => {
  const { user, isAuthenticated } = useAuth();
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesError, setCategoriesError] = useState("");
  const [tags, setTags] = useState([]);
  // Status is now always 'published' by default, no user selection needed
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Enhanced state for new features
  const [ageRating, setAgeRating] = useState("13+");
  const [contentWarnings, setContentWarnings] = useState([]);
  const [readingTime, setReadingTime] = useState("");
  const [isOriginal, setIsOriginal] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [customThumbnail, setCustomThumbnail] = useState("");
  const [seriesName, setSeriesName] = useState("");
  const [episodeNumber, setEpisodeNumber] = useState("");

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      setCategoriesError("");
      try {
        const res = await api.get("/api/v1/categories");
        const items = res.data?.categories || [];
        setCategories(items);
        // if selected category no longer exists, reset
        if (
          category &&
          !items.some((c) => c.name?.toLowerCase() === category)
        ) {
          setCategory("");
        }
      } catch (e) {
        console.error("Failed to load categories:", e);
        setCategoriesError("Failed to load categories");
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const availableTags = [
    "ghost",
    "murder",
    "haunted",
    "mystery",
    "dark",
    "suspense",
    "blood",
    "nightmare",
    "demon",
    "witch",
    "vampire",
    "zombie",
    "serial-killer",
    "possession",
    "curse",
    "death",
    "revenge",
    "cult",
    "ritual",
    "madness",
    "isolation",
    "betrayal",
    "survival",
  ];

  const contentWarningOptions = [
    "Violence",
    "Gore",
    "Sexual Content",
    "Strong Language",
    "Suicide/Self-harm",
    "Substance Abuse",
    "Mental Health",
    "Child Endangerment",
    "Animal Cruelty",
    "Torture",
    "Cannibalism",
  ];

  const ageRatings = [
    { value: "13+", label: "13+ (Teen)", desc: "Suitable for ages 13 and up" },
    { value: "16+", label: "16+ (Mature)", desc: "Contains mature themes" },
    { value: "18+", label: "18+ (Adult)", desc: "Adult content only" },
  ];

  // Calculate reading time based on content
  useEffect(() => {
    if (content) {
      const wordCount = content.replace(/<[^>]*>/g, "").split(/\s+/).length;
      const estimatedTime = Math.ceil(wordCount / 200); // Average reading speed
      setReadingTime(estimatedTime.toString());
    }
  }, [content]);

  const handleContentChange = (value) => {
    if (value.length <= 1000000) setContent(value);
  };

  const toggleTag = (tag) => {
    if (tags.length >= 15 && !tags.includes(tag)) {
      toast.error("Maximum 15 tags allowed");
      return;
    }
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const toggleContentWarning = (warning) => {
    setContentWarnings((prev) =>
      prev.includes(warning)
        ? prev.filter((w) => w !== warning)
        : [...prev, warning]
    );
  };

  const handleSubmit = async () => {
    if (!isAuthenticated || !user) {
      setError("You must be logged in to create a story.");
      return;
    }

    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
      return;
    }

    if (!category) {
      setError("Please select a category.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const storyData = {
        title: title.trim(),
        content,
        description: description.trim(),
        category,
        tags,
        status: "published",
        author: user._id,
        ageRating,
        contentWarnings,
        readingTime: parseInt(readingTime) || null,
        customThumbnail: customThumbnail.trim(),
        seriesName: seriesName.trim(),
        episodeNumber: episodeNumber ? parseInt(episodeNumber) : null,
      };

      // Admin-only features
      if (user.role === "admin") {
        storyData.isOriginal = isOriginal;
        storyData.isFeatured = isFeatured;
      }

      const response = await api.post("/api/v1/stories", storyData);

      if (response.status === 201) {
        setSuccess("Story created successfully!");
        toast.success("Story created successfully!");

        // Reset form
        setTitle("");
        setContent("");
        setDescription("");
        setCategory("");
        setTags([]);
        // Status is always published, no need to reset
        setAgeRating("13+");
        setContentWarnings([]);
        setCustomThumbnail("");
        setSeriesName("");
        setEpisodeNumber("");
        setIsOriginal(false);
        setIsFeatured(false);
      }
    } catch (error) {
      console.error("Error creating story:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Failed to create story. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = user?.role === "admin";

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto py-2 lg:p-6 mt-4 space-y-8">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="xl:col-span-3 space-y-6">
            {/* Title & Basic Info */}
            <Card className="professional-card border-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <BookOpen className="w-6 h-6 text-red-500" />
                  Story Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-base font-medium">
                    Title *
                  </Label>
                  <Input
                    id="title"
                    placeholder="Enter your captivating story title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-lg font-medium h-12 bg-background/50"
                    maxLength={100}
                  />
                  <p className="text-xs text-muted-foreground">
                    {title.length}/100 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="description"
                    className="text-base font-medium"
                  >
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Write a compelling description that will hook your readers..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="min-h-[100px] bg-background/50 resize-none"
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground">
                    {description.length}/500 characters
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-base font-medium">Category *</Label>
                    <Select value={category} onValueChange={setCategory}>
                      <SelectTrigger className="h-12 bg-background/50">
                        <SelectValue
                          placeholder={
                            categoriesLoading
                              ? "Loading categories..."
                              : "Select a category"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.length === 0 && !categoriesLoading && (
                          <SelectItem value="no-categories" disabled>
                            No categories available
                          </SelectItem>
                        )}
                        {categories.map((cat) => {
                          const value = (cat.name || "").toLowerCase();
                          // Skip categories with empty names
                          if (!value) return null;
                          return (
                            <SelectItem key={cat._id || value} value={value}>
                              <div className="flex items-center gap-2">
                                <Skull className="w-4 h-4 text-red-500" />
                                {cat.displayName || cat.name}
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    {categoriesError && (
                      <p className="text-xs text-red-400 mt-1">
                        {categoriesError}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-base font-medium">Age Rating</Label>
                    <Select value={ageRating} onValueChange={setAgeRating}>
                      <SelectTrigger className="h-12 bg-background/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ageRatings.map((rating) => (
                          <SelectItem key={rating.value} value={rating.value}>
                            <div className="space-y-1">
                              <div className="font-medium">{rating.label}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Content Editor */}
            <Card className="professional-card border-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <PenTool className="w-6 h-6 text-red-500" />
                  Story Content *
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Craft your dark tale with our professional editor
                </p>
              </CardHeader>
              <CardContent>
                <div className="border border-border rounded-lg bg-background/30">
                  <TiptapEditor
                    content={content}
                    onChange={handleContentChange}
                    placeholder="Begin your dark story here... Let your imagination run wild in the shadows."
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {content.replace(/<[^>]*>/g, "").split(/\s+/).length} words
                  </span>
                  <span>Estimated reading time: {readingTime} min</span>
                </div>
              </CardContent>
            </Card>

            {/* Content Warnings */}
            <Card className="professional-card border-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  Content Warnings
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Help readers make informed decisions
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {contentWarningOptions.map((warning) => (
                    <Badge
                      key={warning}
                      variant={
                        contentWarnings.includes(warning)
                          ? "destructive"
                          : "outline"
                      }
                      className={`cursor-pointer transition-all duration-200 ${
                        contentWarnings.includes(warning)
                          ? "bg-orange-600 hover:bg-orange-700"
                          : "hover:bg-orange-600/10 hover:border-orange-600/50"
                      }`}
                      onClick={() => toggleContentWarning(warning)}
                    >
                      {warning}
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Selected: {contentWarnings.length} warnings
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            {/* Publishing Options */}
            <Card className="professional-card border-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Save className="w-5 h-5 text-green-500" />
                  Publishing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    Publication Status
                  </Label>
                  <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <p className="text-sm text-green-400 font-medium">
                      Published
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Your story will be published immediately and visible to
                      all users.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Reading Time (minutes)
                  </Label>
                  <Input
                    type="number"
                    value={readingTime}
                    onChange={(e) => setReadingTime(e.target.value)}
                    className="bg-background/50"
                    min="1"
                    placeholder="Auto-calculated"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Admin Only Features */}
            {isAdmin && (
              <Card className="professional-card border-none bg-gradient-to-br from-yellow-500/5 to-orange-500/5">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-yellow-400">
                    <Crown className="w-5 h-5" />
                    Admin Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">
                        EviDark Original
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Mark as official EviDark content
                      </p>
                    </div>
                    <Switch
                      checked={isOriginal}
                      onCheckedChange={setIsOriginal}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium">
                        Featured Story
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Promote on homepage
                      </p>
                    </div>
                    <Switch
                      checked={isFeatured}
                      onCheckedChange={setIsFeatured}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tags */}
            <Card className="professional-card border-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-blue-500" />
                  Tags
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Add custom tags or select from popular ones
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Custom Tag Input */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Custom Tags</Label>
                  <TagInput
                    tags={tags}
                    onTagsChange={setTags}
                    maxTags={15}
                    placeholder="Type and press Enter to add custom tags..."
                  />
                </div>

                <Separator />

                {/* Popular Tags */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Popular Tags</Label>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={tags.includes(tag) ? "default" : "outline"}
                        className={`cursor-pointer transition-all duration-200 ${
                          tags.includes(tag)
                            ? "bg-red-600 hover:bg-red-700 text-white shadow-lg"
                            : "hover:bg-red-600/10 hover:border-red-600/50 hover:scale-105"
                        }`}
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleSubmit}
                disabled={
                  loading || !title.trim() || !content.trim() || !category
                }
                className="w-full h-12 bg-red-600 hover:bg-red-700 text-white font-medium"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating Story...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Create Story
                  </div>
                )}
              </Button>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {success && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <p className="text-sm text-green-400">{success}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateStoryEnhanced;
