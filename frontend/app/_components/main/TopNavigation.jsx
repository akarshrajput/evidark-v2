"use client";
import React from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import SearchBar from "@/components/search/SearchBar";
import {
  Search,
  Bell,
  MessageCircle,
  PenTool,
  User,
  Settings,
  LogOut,
  Plus,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Logo from "./Logo";
import UserRankIndicator from "../user/UserRankIndicator";

const TopNavigation = () => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className="flex items-center justify-between w-full h-16 px-2">
      {/* Left - Logo */}
      <div className="flex items-center h-full">
        <Logo />
      </div>

      {/* Center - Search Bar */}
      <div className="flex-1 max-w-2xl mx-8">
        <SearchBar
          className="w-full evidark-input"
          placeholder="Search stories, communities, users..."
        />
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-2">
        {isAuthenticated ? (
          <>
            {/* Create Story Button */}
            <Button
              asChild
              size="sm"
              className="evidark-btn-primary px-3 h-8 font-medium text-sm rounded-lg"
            >
              <Link href="/create" className="flex items-center gap-1.5">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Create</span>
              </Link>
            </Button>

            {/* User Rank Indicator */}
            <UserRankIndicator />

            {/* Notifications */}
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="evidark-btn-secondary relative h-8 w-8 rounded-lg p-0"
            >
              <Link href="/notifications">
                <Bell className="w-4 h-4" />
                {/* Notification badge */}
                <Badge className="absolute -top-1 -right-1 h-4 w-4 rounded-full p-0 bg-primary text-white text-xs flex items-center justify-center">
                  3
                </Badge>
              </Link>
            </Button>

            {/* Messages */}
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="evidark-btn-secondary h-8 w-8 rounded-lg p-0"
            >
              <Link href="/chat">
                <MessageCircle className="w-4 h-4" />
              </Link>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="evidark-btn-secondary relative h-8 w-8 rounded-lg p-0"
                >
                  <Avatar className="h-7 w-7 border border-border">
                    <AvatarImage
                      src={user?.profilePic || "/default-avatar.png"}
                      alt={user?.username}
                    />
                    <AvatarFallback className="bg-primary text-white text-xs">
                      {user?.username?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.displayName || user?.username}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      @{user?.username}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/user" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <>
            <Button
              asChild
              variant="outline"
              size="sm"
              className="evidark-btn-secondary rounded-lg h-8 px-3 text-sm"
            >
              <Link href="/login">Sign In</Link>
            </Button>
            <Button
              asChild
              size="sm"
              className="evidark-btn-primary rounded-lg h-8 px-3 text-sm"
            >
              <Link href="/login">Sign Up</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default TopNavigation;
