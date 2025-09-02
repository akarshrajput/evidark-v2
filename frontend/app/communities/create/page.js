"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Users, 
  Crown, 
  Zap,
  Moon,
  ArrowLeft,
  Plus,
  Eye,
  EyeOff,
  Shield,
  UserCheck,
  Send
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

// Community type configurations
const communityTypes = {
  circle: { 
    icon: Users, 
    color: "text-blue-400", 
    bg: "bg-blue-400/10", 
    border: "border-blue-400/20",
    name: "Discussion Circle",
    description: "Open discussions about horror stories, writing tips, and dark themes"
  },
  challenge: { 
    icon: Zap, 
    color: "text-yellow-400", 
    bg: "bg-yellow-400/10", 
    border: "border-yellow-400/20",
    name: "Writing Challenge",
    description: "Competitive writing events with prompts, deadlines, and winners"
  },
  ritual: { 
    icon: Moon, 
    color: "text-purple-400", 
    bg: "bg-purple-400/10", 
    border: "border-purple-400/20",
    name: "Dark Ritual",
    description: "Themed storytelling ceremonies and atmospheric writing sessions"
  },
  coven: { 
    icon: Crown, 
    color: "text-red-400", 
    bg: "bg-red-400/10", 
    border: "border-red-400/20",
    name: "Elite Coven",
    description: "Exclusive community for experienced writers and high-reputation members"
  }
};

export default function CreateCommunityPage() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'circle',
    tags: [],
    isPrivate: false,
    requireApproval: false,
    allowInvites: true
  });
  
  const [tagInput, setTagInput] = useState('');

  // Redirect if not authenticated
  if (!loading && !isAuthenticated) {
    router.push('/login');
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim().toLowerCase())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim().toLowerCase()]
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.description.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.name.length < 3 || formData.name.length > 50) {
      toast.error("Community name must be between 3-50 characters");
      return;
    }

    if (formData.description.length < 10 || formData.description.length > 500) {
      toast.error("Description must be between 10-500 characters");
      return;
    }

    setIsCreating(true);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/communities`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        router.push(`/communities/${data.data._id}`);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to create community");
      }
    } catch (error) {
      toast.error("Failed to create community");
    } finally {
      setIsCreating(false);
    }
  };

  const selectedType = communityTypes[formData.type];
  const SelectedIcon = selectedType.icon;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/communities">
            <Button variant="ghost" className="mb-4 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Communities
            </Button>
          </Link>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 rounded-xl bg-red-600/10 border border-red-600/20">
              <Plus className="w-6 h-6 text-red-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Create Dark Circle</h1>
              <p className="text-muted-foreground">
                Start your own community of horror storytellers
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <Card className="professional-card border-none">
            <CardHeader>
              <CardTitle className="text-foreground">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Community Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter a haunting name for your circle..."
                  className="w-full px-3 py-2 bg-card border border-border/50 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
                  maxLength={50}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.name.length}/50 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description *
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the dark purpose of your community..."
                  className="min-h-[100px] bg-card border-border/50 resize-none"
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {formData.description.length}/500 characters
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Community Type */}
          <Card className="professional-card border-none">
            <CardHeader>
              <CardTitle className="text-foreground">Circle Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(communityTypes).map(([key, config]) => {
                  const Icon = config.icon;
                  const isSelected = formData.type === key;
                  
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, type: key }))}
                      className={`
                        p-4 rounded-lg border transition-all duration-200 text-left
                        ${isSelected 
                          ? `${config.bg} ${config.border} border-2` 
                          : 'bg-card border-border/50 hover:bg-muted/50'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3 mb-2">
                        <Icon className={`w-5 h-5 ${isSelected ? config.color : 'text-muted-foreground'}`} />
                        <span className={`font-medium ${isSelected ? config.color : 'text-foreground'}`}>
                          {config.name}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {config.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card className="professional-card border-none">
            <CardHeader>
              <CardTitle className="text-foreground">Tags (Optional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  placeholder="Add tags like 'horror', 'gothic', 'supernatural'..."
                  className="flex-1 px-3 py-2 bg-card border border-border/50 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-500/50"
                />
                <Button
                  type="button"
                  onClick={handleAddTag}
                  variant="outline"
                  className="border-border/50 text-muted-foreground hover:text-foreground"
                >
                  Add
                </Button>
              </div>
              
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <Badge 
                      key={index}
                      variant="secondary" 
                      className="bg-muted/50 text-muted-foreground border-none cursor-pointer hover:bg-red-600/20 hover:text-red-400 transition-colors"
                      onClick={() => handleRemoveTag(tag)}
                    >
                      #{tag} ×
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Settings */}
          <Card className="professional-card border-none">
            <CardHeader>
              <CardTitle className="text-foreground">Circle Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                <div className="flex items-center gap-3">
                  {formData.isPrivate ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-muted-foreground" />}
                  <div>
                    <p className="font-medium text-foreground">Private Circle</p>
                    <p className="text-xs text-muted-foreground">Only invited members can see and join</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, isPrivate: !prev.isPrivate }))}
                  className={`
                    w-12 h-6 rounded-full transition-colors duration-200 relative
                    ${formData.isPrivate ? 'bg-red-600' : 'bg-muted'}
                  `}
                >
                  <div className={`
                    w-4 h-4 bg-white rounded-full absolute top-1 transition-transform duration-200
                    ${formData.isPrivate ? 'translate-x-7' : 'translate-x-1'}
                  `} />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">Require Approval</p>
                    <p className="text-xs text-muted-foreground">Members need approval to join</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, requireApproval: !prev.requireApproval }))}
                  className={`
                    w-12 h-6 rounded-full transition-colors duration-200 relative
                    ${formData.requireApproval ? 'bg-red-600' : 'bg-muted'}
                  `}
                >
                  <div className={`
                    w-4 h-4 bg-white rounded-full absolute top-1 transition-transform duration-200
                    ${formData.requireApproval ? 'translate-x-7' : 'translate-x-1'}
                  `} />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <UserCheck className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">Allow Invites</p>
                    <p className="text-xs text-muted-foreground">Members can invite others</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, allowInvites: !prev.allowInvites }))}
                  className={`
                    w-12 h-6 rounded-full transition-colors duration-200 relative
                    ${formData.allowInvites ? 'bg-red-600' : 'bg-muted'}
                  `}
                >
                  <div className={`
                    w-4 h-4 bg-white rounded-full absolute top-1 transition-transform duration-200
                    ${formData.allowInvites ? 'translate-x-7' : 'translate-x-1'}
                  `} />
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-4">
            <Link href="/communities" className="flex-1">
              <Button 
                type="button" 
                variant="outline" 
                className="w-full border-border/50 text-muted-foreground hover:text-foreground"
              >
                Cancel
              </Button>
            </Link>
            <Button 
              type="submit" 
              disabled={isCreating || !formData.name.trim() || !formData.description.trim()}
              className="flex-1 spooky-glow border-none"
            >
              {isCreating ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Create Circle
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
