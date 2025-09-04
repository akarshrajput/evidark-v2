"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow, format } from "date-fns";
import { 
  Calendar, 
  Users, 
  Clock, 
  MapPin, 
  Trophy, 
  Eye, 
  Filter,
  Search,
  ArrowRight,
  Zap,
  Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";

export default function EventsPage() {
  const { isAuthenticated } = useAuth();
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch events
  const { data: eventsData, isLoading } = useQuery({
    queryKey: ['events', statusFilter, typeFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (typeFilter !== 'all') params.append('type', typeFilter);
      params.append('limit', '20');
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/events?${params}`, {
        headers: isAuthenticated ? {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        } : {}
      });
      if (!response.ok) throw new Error('Failed to fetch events');
      return response.json();
    },
    staleTime: 2 * 60 * 1000
  });

  const events = eventsData?.data || [];

  // Filter events by search query
  const filteredEvents = events.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getEventTypeIcon = (type) => {
    switch (type) {
      case 'writing_challenge': return '✍️';
      case 'dark_ritual': return '🕯️';
      case 'community_gathering': return '👥';
      case 'horror_showcase': return '🎭';
      case 'midnight_reading': return '📖';
      case 'story_contest': return '🏆';
      default: return '📅';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-900/30 text-blue-200 border-blue-600/30';
      case 'active': return 'bg-green-900/30 text-green-200 border-green-600/30';
      case 'completed': return 'bg-gray-900/30 text-gray-200 border-gray-600/30';
      case 'cancelled': return 'bg-red-900/30 text-red-200 border-red-600/30';
      default: return 'bg-gray-900/30 text-gray-200 border-gray-600/30';
    }
  };

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'writing_challenge': return 'text-blue-400';
      case 'dark_ritual': return 'text-purple-400';
      case 'community_gathering': return 'text-green-400';
      case 'horror_showcase': return 'text-red-400';
      case 'midnight_reading': return 'text-yellow-400';
      case 'story_contest': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-6 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-muted rounded w-1/3"></div>
            <div className="grid gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-48 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4 flex items-center gap-3">
            <Calendar className="w-8 h-8 text-red-400" />
            Dark Events
          </h1>
          <p className="text-muted-foreground text-lg">
            Join spine-chilling events, participate in dark rituals, and compete in horror challenges
          </p>
        </div>

        {/* Filters */}
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 mb-8 shadow-lg">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background/50"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48 bg-background/50">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-48 bg-background/50">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="writing_challenge">Writing Challenge</SelectItem>
                <SelectItem value="dark_ritual">Dark Ritual</SelectItem>
                <SelectItem value="community_gathering">Community Gathering</SelectItem>
                <SelectItem value="horror_showcase">Horror Showcase</SelectItem>
                <SelectItem value="midnight_reading">Midnight Reading</SelectItem>
                <SelectItem value="story_contest">Story Contest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">No Events Found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? 'Try adjusting your search or filters' : 'No events match your current filters'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredEvents.map((event) => (
              <Link key={event._id} href={`/events/${event._id}`}>
                <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-red-600/30 group cursor-pointer">
                  <div className="flex items-start gap-6">
                    {/* Event Icon */}
                    <div className="text-4xl flex-shrink-0">
                      {getEventTypeIcon(event.type)}
                    </div>

                    {/* Event Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <Badge className={getStatusColor(event.status)}>
                          {event.status === 'active' && <Zap className="w-3 h-3 mr-1" />}
                          {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                        </Badge>
                        <Badge variant="outline" className={`${getEventTypeColor(event.type)} border-current/30`}>
                          {event.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </Badge>
                        {event.isParticipant && (
                          <Badge className="bg-green-900/30 text-green-200 border-green-600/30">
                            <Star className="w-3 h-3 mr-1" />
                            Joined
                          </Badge>
                        )}
                      </div>

                      <h2 className="text-xl font-bold text-foreground mb-2 group-hover:text-red-200 transition-colors">
                        {event.title}
                      </h2>
                      
                      <p className="text-muted-foreground mb-4 line-clamp-2">
                        {event.description}
                      </p>

                      {/* Event Meta */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4 text-blue-400" />
                          <span>{format(new Date(event.startDate), 'MMM d')}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4 text-green-400" />
                          <span>{formatDistanceToNow(new Date(event.startDate), { addSuffix: true })}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="w-4 h-4 text-purple-400" />
                          <span>{event.participants?.length || 0} joined</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Eye className="w-4 h-4 text-yellow-400" />
                          <span>{event.stats?.views || 0} views</span>
                        </div>
                      </div>

                      {/* Rewards */}
                      {event.rewards?.points > 0 && (
                        <div className="flex items-center gap-2 text-sm">
                          <Trophy className="w-4 h-4 text-yellow-400" />
                          <span className="text-yellow-200">
                            Earn {event.rewards.points} points
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action Arrow */}
                    <div className="flex-shrink-0">
                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-red-400 transition-colors" />
                    </div>
                  </div>

                  {/* Progress Bar for Active Events */}
                  {event.status === 'active' && (
                    <div className="mt-4 pt-4 border-t border-border/50">
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                        <span>Event Progress</span>
                        <span>Ends {formatDistanceToNow(new Date(event.endDate), { addSuffix: true })}</span>
                      </div>
                      <div className="w-full bg-background/50 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-600 to-emerald-600 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(100, ((new Date() - new Date(event.startDate)) / (new Date(event.endDate) - new Date(event.startDate))) * 100)}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Load More */}
        {filteredEvents.length > 0 && eventsData?.pagination?.pages > 1 && (
          <div className="text-center mt-8">
            <Button variant="outline" className="border-red-600/50 text-red-200 hover:bg-red-950/30">
              Load More Events
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
