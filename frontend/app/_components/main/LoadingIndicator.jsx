"use client";

export default function LoadingIndicator({ text = "Summoning more darkness..." }) {
  return (
    <div className="text-center mt-8">
      <div className="flex items-center justify-center gap-2 text-muted-foreground">
        <div className="w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin" />
        <span>{text}</span>
      </div>
    </div>
  );
}
