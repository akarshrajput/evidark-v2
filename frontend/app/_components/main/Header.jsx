"use client";
import React from "react";
import Logo from "./Logo";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
// import OnlineAvatar from "../ui/OnlineAvatar";
import NotificationBell from "../notifications/NotificationBell";
import Search from "./Search";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  PenTool,
  User,
  LogIn,
  UserPlus,
  Home,
  Compass,
  BookOpen,
  Users,
  Ghost,
  Skull,
  Crown,
  Settings,
  LogOut,
  Eye,
  Heart,
  Bookmark,
  TrendingUp,
  Menu,
  X,
  MessageCircle,
} from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const { user, logout } = useAuth();

  const getRoleIcon = (role) => {
    switch (role) {
      case "admin":
        return <Crown className="w-3 h-3 text-yellow-400" />;
      case "author":
        return <PenTool className="w-3 h-3 text-primary" />;
      case "guide":
        return <Ghost className="w-3 h-3 text-purple-400" />;
      default:
        return <Eye className="w-3 h-3 text-muted-foreground" />;
    }
  };

  return (
    <header className="px-6 py-3 flex items-center justify-between w-full border-none bg-background/95 backdrop-blur-md shadow-2xl shadow-black/50">
      <div className="flex items-center gap-8">
        <Logo />

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200 border-none shadow-sm shadow-black/20 hover:shadow-md hover:shadow-black/30"
          >
            <Link href="/" className="flex items-center gap-2">
              <Home className="w-4 h-4" />
              <span className="font-medium">Home</span>
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200 border-none shadow-sm shadow-black/20 hover:shadow-md hover:shadow-black/30"
          >
            <Link href="/trending" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="font-medium">Trending</span>
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200 border-none shadow-sm shadow-black/20 hover:shadow-md hover:shadow-black/30"
          >
            <Link href="/categories" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span className="font-medium">Categories</span>
            </Link>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200 border-none shadow-sm shadow-black/20 hover:shadow-md hover:shadow-black/30"
          >
            <Link href="/community" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="font-medium">Community</span>
            </Link>
          </Button>

          {user && (
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200 border-none shadow-sm shadow-black/20 hover:shadow-md hover:shadow-black/30"
            >
              <Link href="/chat" className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                <span className="font-medium">Chat</span>
              </Link>
            </Button>
          )}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden md:block">
          <Search />
        </div>

        {user ? (
          <div className="flex items-center gap-3">
            {/* Notification Bell */}
            <NotificationBell />

            {/* Admin Button - visible only to admins */}
            {user?.role === "admin" && (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-none text-yellow-400 hover:text-yellow-300 shadow-md shadow-black/40 hover:shadow-lg hover:shadow-black/50 bg-yellow-500/10 hover:bg-yellow-500/20"
              >
                <Link href="/admin" className="flex items-center gap-2">
                  <Crown className="w-4 h-4" />
                  <span className="font-medium">Admin</span>
                </Link>
              </Button>
            )}
            {/* Write Story Button - Available to all users */}
            <Button asChild size="sm" className="spooky-glow border-none">
              <Link href="/create" className="flex items-center gap-2">
                <Skull className="w-4 h-4" />
                <span className="font-medium">Write Tale</span>
              </Link>
            </Button>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full border-none shadow-md shadow-black/40 hover:shadow-lg hover:shadow-black/50 transition-all duration-200"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback className="bg-red-900/50 text-red-100">
                      {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  {user?.role === "admin" && (
                    <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-1">
                      <Crown className="w-2 h-2 text-black" />
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 bg-card/95 backdrop-blur-md border-none shadow-2xl shadow-black/60"
                align="end"
                forceMount
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium leading-none">
                        {user?.name}
                      </p>
                      <Badge
                        variant="outline"
                        className="text-xs px-1.5 py-0.5"
                      >
                        {getRoleIcon(user?.role)}
                        <span className="ml-1 capitalize">{user?.role}</span>
                      </Badge>
                    </div>
                    <p className="text-xs leading-none text-muted-foreground">
                      @{user?.username}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    href={`/user/${user?.username}`}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <User className="w-4 h-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/bookmarks"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Bookmark className="w-4 h-4" />
                    <span>Bookmarks</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/liked"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Heart className="w-4 h-4" />
                    <span>Liked Stories</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link
                    href="/chat"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Chat</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link
                    href="/settings"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="flex items-center gap-2 cursor-pointer text-red-400 hover:text-red-300"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/login" className="flex items-center gap-2">
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/register" className="flex items-center gap-2">
                <UserPlus className="w-4 h-4" />
                <span>Sign Up</span>
              </Link>
            </Button>
          </div>
        )}

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="sm"
          className="lg:hidden border-none shadow-sm shadow-black/20 hover:shadow-md hover:shadow-black/30"
        >
          <Menu className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
};

export default Header;
