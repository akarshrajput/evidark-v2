export default function StoryLayout({ children }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Full-width story content without sidebars */}
      <main className="w-full">{children}</main>
    </div>
  );
}
