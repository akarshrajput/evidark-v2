"use client";

import { Skull, Ghost, Eye, ArrowRight } from "lucide-react";
import { Creepster, Inter } from "next/font/google";
import React, { useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoginForm from "@/app/_components/auth/LoginForm";
import RegisterForm from "@/app/_components/auth/RegisterForm";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const creepster = Creepster({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const Page = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const redirectTo = searchParams.get("redirect");

  // Redirect authenticated users
  useEffect(() => {
    if (!loading && isAuthenticated) {
      if (redirectTo) {
        router.push(redirectTo);
      } else {
        router.push("/");
      }
    }
  }, [isAuthenticated, loading, redirectTo, router]);

  // Extract story title from path if it's a story page
  const getPageTitle = (path) => {
    if (!path) return null;
    if (path.startsWith("/story/")) {
      const storySlug = path.split("/story/")[1];
      return (
        storySlug
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")
          .slice(0, 50) + (storySlug.length > 50 ? "..." : "")
      );
    }
    return path;
  };

  const pageTitle = getPageTitle(redirectTo);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin">
          <Skull className="w-8 h-8 text-primary" />
        </div>
      </div>
    );
  }

  // Don't render login form if user is authenticated (will redirect)
  if (isAuthenticated) {
    return null;
  }
  return (
    <div className="mt-12 bg-background flex items-center justify-center">
      <div className="w-full max-w-md">
        <Card className="professional-card border-none">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center items-center gap-3">
              <Skull className="w-8 h-8 text-primary animate-pulse" />
              <CardTitle
                className={`${creepster.className} text-3xl text-foreground shadow-text`}
              >
                EviDark
              </CardTitle>
              <Ghost className="w-8 h-8 text-primary animate-pulse" />
            </div>
            <p className={`${inter.className} text-muted-foreground`}>
              Enter the realm of darkness
            </p>

            {/* Show redirect notice if coming from a specific page */}
            {redirectTo && (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                <div className="flex items-center justify-center gap-2 text-sm text-primary">
                  <ArrowRight className="w-4 h-4" />
                  <span>
                    {redirectTo.startsWith("/story/")
                      ? `Returning to story: ${pageTitle}`
                      : `Returning to ${redirectTo}`}
                  </span>
                </div>
              </div>
            )}
          </CardHeader>

          <CardContent className="space-y-6">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="register">Create Account</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4">
                <LoginForm />
              </TabsContent>

              <TabsContent value="register" className="space-y-4">
                <RegisterForm />
              </TabsContent>
            </Tabs>

            <div className="text-center space-y-4">
              <div className="flex justify-center items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4 text-primary" />
                  <span>Read Stories</span>
                </div>
                <div className="flex items-center gap-2">
                  <Ghost className="w-4 h-4 text-primary" />
                  <span>Share Tales</span>
                </div>
                <div className="flex items-center gap-2">
                  <Skull className="w-4 h-4 text-primary" />
                  <span>Connect</span>
                </div>
              </div>

              <p
                className={`${inter.className} text-xs text-muted-foreground leading-relaxed`}
              >
                By continuing, you agree to EviDark&apos;s{" "}
                <span className="text-primary hover:underline cursor-pointer">
                  Terms of Service
                </span>{" "}
                and acknowledge our{" "}
                <span className="text-primary hover:underline cursor-pointer">
                  Privacy Policy
                </span>
                .
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className={`${inter.className} text-sm text-muted-foreground`}>
            New to dark storytelling?{" "}
            <span className="text-primary hover:underline cursor-pointer">
              Explore without signing in
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

const PageWrapper = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin">
          <Skull className="w-8 h-8 text-primary" />
        </div>
      </div>
    }>
      <Page />
    </Suspense>
  );
};

export default PageWrapper;
