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
    <div className=" evidark-card rounded-xl p-4 mb-6 border-none">
      <div className="flex items-center gap-3 overflow-x-auto">
        <div className="flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap">
          <Filter className="w-4 h-4" />
          <span className="font-medium">Filter:</span>
        </div>
        <div className="flex gap-2">
          {filterOptions
            .filter((option) => !option.authRequired || isAuthenticated)
            .map(({ key, label, icon: Icon }) => (
              <Button
                key={key}
                variant={activeFilter === key ? "default" : "outline"}
                size="sm"
                onClick={() => onFilterChange(key)}
                className={`whitespace-nowrap rounded-lg transition-all duration-300 ${
                  activeFilter === key
                    ? "evidark-btn-primary"
                    : "evidark-btn-secondary"
                }`}
              >
                <Icon className="w-3 h-3 mr-2" />
                {label}
              </Button>
            ))}
        </div>
      </div>
    </div>
  );
}
