'use client';
import React from "react";
import Logo from "./Logo";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import Search from "./Search";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import OnlineAvatar from "@/app/_components/ui/OnlineAvatar";
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
    <header className="px-6 py-3 flex items-center justify-between w-full border-b border-border/50 bg-background/95 backdrop-blur-md">
      <div className="flex items-center gap-8">
        <Logo />

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200"
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
            className="text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200"
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
            className="text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200"
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
            className="text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200"
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
              className="text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200"
            >
              <Link href="/chat" className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                <span className="font-medium">Dark Chat</span>
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
            {/* Admin Button - visible only to admins */}
            {user?.role === "admin" && (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="border-yellow-500/40 text-yellow-400 hover:text-yellow-300"
              >
                <Link href="/admin" className="flex items-center gap-2">
                  <Crown className="w-4 h-4" />
                  <span className="font-medium">Admin</span>
                </Link>
              </Button>
            )}
            {/* Write Story Button - Available to all users */}
            <Button
              asChild
              size="sm"
              className="spooky-glow bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border-0 shadow-lg shadow-red-500/25 transition-all duration-300"
            >
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
                  className="relative h-10 w-10 rounded-full border-2 border-primary/30 hover:border-primary/60 transition-all duration-200"
                >
                  <OnlineAvatar
                    src={user?.avatar}
                    alt={user?.name}
                    fallback={user?.name?.[0] ||
                      user?.email?.[0] ||
                      "U"}
                    isOnline={true}
                    size="sm"
                  />
                  {user?.role === "admin" && (
                    <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-1">
                      <Crown className="w-2 h-2 text-black" />
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 bg-card/95 backdrop-blur-md border-border/50"
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
                        <span className="ml-1 capitalize">
                          {user?.role}
                        </span>
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
                    href={`/user/${user.username}`}
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
                    <span>Dark Chat</span>
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
          <div className="flex items-center gap-3">
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-foreground border border-border/50 hover:border-border transition-all duration-200"
            >
              <Link href="/login" className="flex items-center gap-2">
                <LogIn className="w-4 h-4" />
                <span className="font-medium">Sign In</span>
              </Link>
            </Button>

            <Button
              asChild
              size="sm"
              className="spooky-glow bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border-0 shadow-lg shadow-red-500/25 transition-all duration-300"
            >
              <Link href="/login" className="flex items-center gap-2">
                <Ghost className="w-4 h-4" />
                <span className="font-medium">Join the Darkness</span>
              </Link>
            </Button>
          </div>
        )}

        {/* Mobile Menu Button */}
        <Button variant="ghost" size="sm" className="lg:hidden">
          <Menu className="w-5 h-5" />
        </Button>
      </div>
    </header>
  );
};

export default Header;
