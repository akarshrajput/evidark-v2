"use client";

import TrendingAuthors from "../sidebar/TrendingAuthors";
import Categories from "../sidebar/Categories";
import Events from "../sidebar/Events";
import { SpookySidebarSkeleton } from "../ui/SpookySkeleton";

export default function Sidebar({ 
  trendingAuthors, 
  categories, 
  events, 
  authorsLoading, 
  categoriesLoading, 
  eventsLoading 
}) {
  if (authorsLoading || categoriesLoading || eventsLoading) {
    return <SpookySidebarSkeleton />;
  }

  return (
    <div className="space-y-6">
      <TrendingAuthors authors={trendingAuthors} isLoading={authorsLoading} />
      <Categories categories={categories} isLoading={categoriesLoading} />
      <Events events={events} isLoading={eventsLoading} />
    </div>
  );
}
