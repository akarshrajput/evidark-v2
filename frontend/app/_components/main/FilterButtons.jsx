"use client";

import { Button } from "@/components/ui/button";
import { Filter, Activity, TrendingUp, Zap, Star } from "lucide-react";

const filterOptions = [
  { key: "all", label: "All Stories", icon: Activity },
  { key: "trending", label: "Trending", icon: TrendingUp },
  { key: "recent", label: "Recent", icon: Zap },
  { key: "popular", label: "Popular", icon: Star },
];

export default function FilterButtons({ activeFilter, onFilterChange }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <Filter className="w-4 h-4 text-muted-foreground" />
      <div className="flex gap-4">
        {filterOptions.map(({ key, label, icon: Icon }) => (
          <Button
            key={key}
            variant="outline"
            size="sm"
            onClick={() => onFilterChange(key)}
            className={`transition-all duration-200 ${
              activeFilter === key
                ? "spooky-glow"
                : "border-border hover:border-red-600/50 hover:bg-red-600/10 spooky-card"
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
