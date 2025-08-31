'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export default function OnlineAvatar({ 
  src, 
  alt, 
  fallback, 
  isOnline = false, 
  className = "", 
  size = "default",
  showOnlineStatus = true 
}) {
  const sizeClasses = {
    sm: "h-8 w-8",
    default: "h-10 w-10", 
    lg: "h-12 w-12",
    xl: "h-16 w-16",
    "2xl": "h-32 w-32"
  };

  const onlineDotSizes = {
    sm: "h-2 w-2",
    default: "h-3 w-3",
    lg: "h-3 w-3", 
    xl: "h-4 w-4",
    "2xl": "h-6 w-6"
  };

  const onlineDotPositions = {
    sm: "top-0 right-0",
    default: "top-0 right-0",
    lg: "top-1 right-1",
    xl: "top-1 right-1", 
    "2xl": "top-2 right-2"
  };

  return (
    <div className="relative inline-block">
      <Avatar className={cn(sizeClasses[size], className)}>
        <AvatarImage src={src} alt={alt} />
        <AvatarFallback className="bg-red-900/50 text-red-100 font-semibold">
          {fallback}
        </AvatarFallback>
      </Avatar>
      
      {showOnlineStatus && isOnline && (
        <div 
          className={cn(
            "absolute bg-green-500 border-2 border-white rounded-full shadow-lg",
            onlineDotSizes[size],
            onlineDotPositions[size]
          )}
        />
      )}
    </div>
  );
}
