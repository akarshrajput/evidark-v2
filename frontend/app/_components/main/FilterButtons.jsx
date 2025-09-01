"use client";

import { Button } from "@/components/ui/button";
import { Filter, Activity, TrendingUp, Zap, Star, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const filterOptions = [
  { key: "all", label: "All Stories", icon: Activity },
  { key: "following", label: "Following", icon: Users, authRequired: true },
  { key: "trending", label: "Trending", icon: TrendingUp },
  { key: "recent", label: "Recent", icon: Zap },
  { key: "popular", label: "Popular", icon: Star },
];

export default function FilterButtons({ activeFilter, onFilterChange }) {
  const { isAuthenticated } = useAuth();
  return (
    <div className="flex items-center gap-4 mb-6">
      <Filter className="w-4 h-4 text-muted-foreground" />
      <div className="flex gap-4">
        {filterOptions
          .filter(option => !option.authRequired || isAuthenticated)
          .map(({ key, label, icon: Icon }) => (
            <Button
              key={key}
              variant="outline"
              size="sm"
              onClick={() => onFilterChange(key)}
              className={`transition-all duration-200 border-none ${
                activeFilter === key
                  ? "spooky-glow"
                  : "shadow-md shadow-black/40 hover:shadow-lg hover:shadow-black/50 hover:bg-red-600/10 bg-secondary/50"
              }`}
            >
              <Icon className="w-3 h-3 mr-1" />
              {label}
            </Button>
          ))}
      </div>
    </div>
  );
}
