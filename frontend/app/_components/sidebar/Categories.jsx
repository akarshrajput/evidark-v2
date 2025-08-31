"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Ghost } from "lucide-react";
import Link from "next/link";

export default function Categories({ categories, isLoading }) {
  if (isLoading) {
    return (
      <Card className="professional-card border-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Ghost className="w-5 h-5 text-purple-400" />
            Dark Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-8 bg-muted/20 rounded animate-pulse"
              ></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="professional-card border-none">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Ghost className="w-5 h-5 text-purple-400" />
          Dark Categories
        </CardTitle>
      </CardHeader>
      {/* <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {categories?.data?.slice(0, 8).map((category) => (
            <Link
              key={category._id}
              href={`/categories/${category.slug}`}
            >
              <Badge
                variant="outline"
                className="w-full justify-center py-2 hover:bg-red-500/10 hover:border-red-500/30 transition-colors"
              >
                {category.name}
              </Badge>
            </Link>
          ))}
        </div>
      </CardContent> */}
    </Card>
  );
}
