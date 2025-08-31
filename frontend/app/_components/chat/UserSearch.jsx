'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import OnlineAvatar from '@/app/_components/ui/OnlineAvatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, MessageCircle, Users, X } from 'lucide-react';

export default function UserSearch({ onClose, onCreateChat }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  // Remove group chat functionality - only private chats
  const [groupName, setGroupName] = useState('');

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        searchUsers();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const searchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5050'}/api/v1/users/search?q=${encodeURIComponent(searchQuery)}&limit=20`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      setSearchResults(data.users || []);
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserSelection = (user) => {
    setSelectedUsers(prev => {
      const isSelected = prev.some(u => u._id === user._id);
      if (isSelected) {
        return prev.filter(u => u._id !== user._id);
      } else {
        // Only allow one selection for private chats
        return [user];
      }
    });
  };

  const handleCreateChat = () => {
    if (selectedUsers.length === 1) {
      // Just pass user info to start a draft chat - don't create in database yet
      onCreateChat([selectedUsers[0]._id], 'private', selectedUsers[0]);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-600 text-white';
      case 'guide': return 'bg-purple-600 text-white';
      case 'user': return 'bg-gray-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-black/90 border-red-900/30 text-red-100">
        <DialogHeader>
          <DialogTitle className="text-xl font-creepster text-red-100">
            Start New Dark Conversation
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-900/50 border-red-900/30 text-red-100 placeholder-gray-500"
            />
          </div>

          {/* Selected Users */}
          {selectedUsers.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-red-300">
                Selected ({selectedUsers.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map(user => (
                  <div
                    key={user._id}
                    className="flex items-center space-x-2 bg-red-900/30 px-3 py-1 rounded-full border border-red-700/50"
                  >
                    <OnlineAvatar
                      src={user.avatar}
                      alt={user.name}
                      fallback={user.name[0]?.toUpperCase()}
                      isOnline={user.isOnline}
                      size="sm"
                    />
                    <span className="text-sm text-red-100">{user.name}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleUserSelection(user)}
                      className="h-4 w-4 p-0 text-red-400 hover:text-red-300"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search Results */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-red-300">
              {searchQuery ? `Search Results` : 'Start typing to search users'}
            </h4>
            
            <ScrollArea className="h-64 border border-red-900/30 rounded-lg bg-gray-900/20">
              {loading ? (
                <div className="p-4 text-center">
                  <div className="animate-spin h-6 w-6 border-2 border-red-500 border-t-transparent rounded-full mx-auto"></div>
                  <p className="text-sm text-gray-400 mt-2">Searching...</p>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="p-2 space-y-1">
                  {searchResults.map(user => {
                    const isSelected = selectedUsers.some(u => u._id === user._id);
                    const canSelect = selectedUsers.length === 0; 
                    return (
                      <div
                        key={user._id}
                        onClick={() => toggleUserSelection(user)}
                        className={`
                          flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all
                          hover:bg-red-900/20 border border-transparent
                          ${isSelected ? 'bg-red-900/30 border-red-700/50' : 'hover:border-red-900/30'}
                        `}
                      >
                        <OnlineAvatar
                          src={user.avatar}
                          alt={user.name}
                          fallback={user.name[0]?.toUpperCase()}
                          isOnline={user.isOnline}
                          className="border border-red-500/30"
                        />
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-red-100 truncate">
                              {user.name}
                            </h4>
                            <Badge className={`text-xs ${getRoleBadgeColor(user.role)}`}>
                              {user.role}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-400 truncate">
                            {user.email}
                          </p>
                          {!user.isOnline && user.lastSeen && (
                            <p className="text-xs text-gray-500">
                              Last seen {new Date(user.lastSeen).toLocaleDateString()}
                            </p>
                          )}
                        </div>

                        {isSelected && (
                          <div className="h-5 w-5 bg-red-600 rounded-full flex items-center justify-center">
                            <div className="h-2 w-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : searchQuery.length >= 2 ? (
                <div className="p-8 text-center">
                  <Search className="h-12 w-12 mx-auto mb-4 text-red-500/50" />
                  <p className="text-gray-400">No users found</p>
                  <p className="text-sm text-gray-500">Try a different search term</p>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <Search className="h-12 w-12 mx-auto mb-4 text-red-500/50" />
                  <p className="text-gray-400">Search for users</p>
                  <p className="text-sm text-gray-500">Enter at least 2 characters to search</p>
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4 border-t border-red-900/30">
            <Button
              variant="outline"
              onClick={onClose}
              className="border-red-700/50 text-red-300 hover:bg-red-900/20"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateChat}
              disabled={selectedUsers.length !== 1}
              className="w-full bg-red-600 hover:bg-red-700 text-white disabled:bg-gray-700 disabled:text-gray-400"
            >
              Start Private Chat
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
