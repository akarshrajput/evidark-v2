"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { Calendar, Clock, Users, Trophy, ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Link from "next/link";

export default function CreateEventPage() {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "",
    startDate: "",
    endDate: "",
    maxParticipants: "",
    requirements: {
      minReputation: 0,
      description: ""
    },
    rewards: {
      points: 0,
      description: ""
    },
    settings: {
      isPublic: true,
      allowLateJoining: true,
      requireApproval: false,
      enableChat: true,
      enableVoting: false
    },
    tags: ""
  });

  // Check if user is admin
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">You need admin privileges to create events.</p>
          <Link href="/events">
            <Button>Browse Events</Button>
          </Link>
        </div>
      </div>
    );
  }

  const createEventMutation = useMutation({
    mutationFn: async (eventData) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/events`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventData)
      });
      if (!response.ok) throw new Error('Failed to create event');
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['events']);
      toast.success('Event created successfully!');
      router.push(`/events/${data.data._id}`);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create event');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const eventData = {
      ...formData,
      maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null,
      requirements: {
        ...formData.requirements,
        minReputation: parseInt(formData.requirements.minReputation) || 0
      },
      rewards: {
        ...formData.rewards,
        points: parseInt(formData.rewards.points) || 0
      },
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
    };

    createEventMutation.mutate(eventData);
  };

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.back()}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="h-6 w-px bg-border"></div>
          <Link href="/events">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              All Events
            </Button>
          </Link>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4 flex items-center gap-3">
              <Plus className="w-8 h-8 text-red-400" />
              Create Dark Event
            </h1>
            <p className="text-muted-foreground text-lg">
              Craft a spine-chilling event for the EviDark community
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-400" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Essential details about your event
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Event Title *</Label>
                    <Input
                      id="title"
                      placeholder="Enter event title..."
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      required
                      className="bg-background/50"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="type">Event Type *</Label>
                    <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                      <SelectTrigger className="bg-background/50">
                        <SelectValue placeholder="Select event type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="writing_challenge">✍️ Writing Challenge</SelectItem>
                        <SelectItem value="dark_ritual">🕯️ Dark Ritual</SelectItem>
                        <SelectItem value="community_gathering">👥 Community Gathering</SelectItem>
                        <SelectItem value="horror_showcase">🎭 Horror Showcase</SelectItem>
                        <SelectItem value="midnight_reading">📖 Midnight Reading</SelectItem>
                        <SelectItem value="story_contest">🏆 Story Contest</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your event in detail..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    required
                    className="min-h-32 bg-background/50"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date & Time *</Label>
                    <Input
                      id="startDate"
                      type="datetime-local"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange('startDate', e.target.value)}
                      required
                      className="bg-background/50"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date & Time *</Label>
                    <Input
                      id="endDate"
                      type="datetime-local"
                      value={formData.endDate}
                      onChange={(e) => handleInputChange('endDate', e.target.value)}
                      required
                      className="bg-background/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    placeholder="horror, writing, contest, dark..."
                    value={formData.tags}
                    onChange={(e) => handleInputChange('tags', e.target.value)}
                    className="bg-background/50"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Participation Settings */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-400" />
                  Participation Settings
                </CardTitle>
                <CardDescription>
                  Configure who can join and how
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="maxParticipants">Max Participants</Label>
                    <Input
                      id="maxParticipants"
                      type="number"
                      placeholder="Leave empty for unlimited"
                      value={formData.maxParticipants}
                      onChange={(e) => handleInputChange('maxParticipants', e.target.value)}
                      className="bg-background/50"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="minReputation">Min Reputation Required</Label>
                    <Input
                      id="minReputation"
                      type="number"
                      placeholder="0"
                      value={formData.requirements.minReputation}
                      onChange={(e) => handleInputChange('requirements.minReputation', e.target.value)}
                      className="bg-background/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requirementsDesc">Requirements Description</Label>
                  <Textarea
                    id="requirementsDesc"
                    placeholder="Describe any special requirements..."
                    value={formData.requirements.description}
                    onChange={(e) => handleInputChange('requirements.description', e.target.value)}
                    className="bg-background/50"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="allowLateJoining"
                      checked={formData.settings.allowLateJoining}
                      onCheckedChange={(checked) => handleInputChange('settings.allowLateJoining', checked)}
                    />
                    <Label htmlFor="allowLateJoining">Allow Late Joining</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="requireApproval"
                      checked={formData.settings.requireApproval}
                      onCheckedChange={(checked) => handleInputChange('settings.requireApproval', checked)}
                    />
                    <Label htmlFor="requireApproval">Require Approval</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rewards & Features */}
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  Rewards & Features
                </CardTitle>
                <CardDescription>
                  Set up rewards and enable features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="rewardPoints">Reward Points</Label>
                    <Input
                      id="rewardPoints"
                      type="number"
                      placeholder="0"
                      value={formData.rewards.points}
                      onChange={(e) => handleInputChange('rewards.points', e.target.value)}
                      className="bg-background/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rewardsDesc">Rewards Description</Label>
                  <Textarea
                    id="rewardsDesc"
                    placeholder="Describe the rewards participants can earn..."
                    value={formData.rewards.description}
                    onChange={(e) => handleInputChange('rewards.description', e.target.value)}
                    className="bg-background/50"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enableChat"
                      checked={formData.settings.enableChat}
                      onCheckedChange={(checked) => handleInputChange('settings.enableChat', checked)}
                    />
                    <Label htmlFor="enableChat">Enable Chat</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="enableVoting"
                      checked={formData.settings.enableVoting}
                      onCheckedChange={(checked) => handleInputChange('settings.enableVoting', checked)}
                    />
                    <Label htmlFor="enableVoting">Enable Voting</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isPublic"
                      checked={formData.settings.isPublic}
                      onCheckedChange={(checked) => handleInputChange('settings.isPublic', checked)}
                    />
                    <Label htmlFor="isPublic">Public Event</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="border-gray-600/50 text-gray-200 hover:bg-gray-950/30"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createEventMutation.isPending || !formData.title || !formData.description || !formData.type || !formData.startDate || !formData.endDate}
                className="bg-red-600 hover:bg-red-700"
              >
                {createEventMutation.isPending ? 'Creating...' : 'Create Event'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
