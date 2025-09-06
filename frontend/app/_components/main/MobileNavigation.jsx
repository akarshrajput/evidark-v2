"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Home,
  Search,
  Bookmark,
  Users,
  Calendar,
  BookOpen,
  TrendingUp,
  MessageCircle,
  Bell,
  User,
  Settings,
  LogOut,
  PenTool,
  Menu,
} from "lucide-react";
import Logo from "./Logo";

const MobileNavigation = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const navigationItems = [
    { href: "/", icon: Home, label: "Home", active: pathname === "/" },
    {
      href: "/search",
      icon: Search,
      label: "Explore",
      active: pathname === "/search",
    },
    {
      href: "/notifications",
      icon: Bell,
      label: "Notifications",
      active: pathname === "/notifications",
    },
    {
      href: "/chat",
      icon: MessageCircle,
      label: "Messages",
      active: pathname === "/chat",
    },
    {
      href: "/bookmarks",
      icon: Bookmark,
      label: "Bookmarks",
      active: pathname === "/bookmarks",
    },
    {
      href: "/communities",
      icon: Users,
      label: "Communities",
      active: pathname === "/communities",
    },
    {
      href: "/events",
      icon: Calendar,
      label: "Events",
      active: pathname === "/events",
    },
    {
      href: "/categories",
      icon: BookOpen,
      label: "Categories",
      active: pathname === "/categories",
    },
    {
      href: "/trending",
      icon: TrendingUp,
      label: "Trending",
      active: pathname === "/trending",
    },
    {
      href: "/user",
      icon: User,
      label: "Profile",
      active: pathname === "/user",
    },
  ];

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
        <div className="flex items-center justify-between p-4">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <div className="h-full flex flex-col">
                <SheetHeader className="p-4 border-b border-border">
                  <SheetTitle className="text-left">
                    <Logo />
                  </SheetTitle>
                </SheetHeader>

                <nav className="flex-1 p-4 space-y-2">
                  {navigationItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-4 px-4 py-3 rounded-full transition-colors text-lg ${
                        item.active
                          ? "bg-accent text-foreground font-medium"
                          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                      }`}
                    >
                      <item.icon className="w-6 h-6" />
                      <span>{item.label}</span>
                    </Link>
                  ))}

                  {isAuthenticated && (
                    <Button
                      asChild
                      className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full py-3 text-lg font-semibold"
                      onClick={() => setOpen(false)}
                    >
                      <Link
                        href="/create"
                        className="flex items-center justify-center gap-2"
                      >
                        <PenTool className="w-5 h-5" />
                        <span>Create Story</span>
                      </Link>
                    </Button>
                  )}
                </nav>

                {isAuthenticated && user ? (
                  <div className="p-4 border-t border-border">
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage
                          src={user.profilePic || "/default-avatar.png"}
                          alt={user.username}
                        />
                        <AvatarFallback className="bg-secondary text-secondary-foreground">
                          {user.username?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-foreground">
                          {user.displayName || user.username}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          @{user.username}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Button
                        asChild
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => setOpen(false)}
                      >
                        <Link href="/user" className="flex items-center gap-2">
                          <User className="w-4 h-4" />
                          <span>Profile</span>
                        </Link>
                      </Button>
                      <Button
                        asChild
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => setOpen(false)}
                      >
                        <Link
                          href="/settings"
                          className="flex items-center gap-2"
                        >
                          <Settings className="w-4 h-4" />
                          <span>Settings</span>
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-destructive hover:text-destructive"
                        onClick={() => {
                          logout();
                          setOpen(false);
                        }}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        <span>Sign out</span>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 space-y-2 border-t border-border">
                    <Button
                      asChild
                      variant="outline"
                      className="w-full rounded-full"
                      onClick={() => setOpen(false)}
                    >
                      <Link href="/login">Sign In</Link>
                    </Button>
                    <Button
                      asChild
                      className="w-full rounded-full bg-primary hover:bg-primary/90"
                      onClick={() => setOpen(false)}
                    >
                      <Link href="/login">Sign Up</Link>
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>

          <Logo />

          <div className="flex items-center gap-2">
            {isAuthenticated && (
              <Button asChild size="sm" className="rounded-full">
                <Link href="/create">
                  <PenTool className="w-4 h-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
        <div className="flex items-center justify-around py-2">
          {[
            { href: "/", icon: Home },
            { href: "/search", icon: Search },
            { href: "/notifications", icon: Bell },
            { href: "/chat", icon: MessageCircle },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-center p-3 rounded-full transition-colors ${
                pathname === item.href
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <item.icon className="w-6 h-6" />
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default MobileNavigation;
