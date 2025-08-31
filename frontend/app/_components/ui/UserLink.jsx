"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Crown, Ghost, Eye } from "lucide-react";

export default function UserLink({ 
  user, 
  showAvatar = true, 
  showRole = false, 
  className = "",
  avatarSize = "w-6 h-6",
  textSize = "text-sm"
}) {
  if (!user) return null;

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <Crown className="w-3 h-3 text-yellow-400" />;
      case 'guide': return <Ghost className="w-3 h-3 text-purple-400" />;
      case 'user': return <Eye className="w-3 h-3 text-muted-foreground" />;
      default: return <Eye className="w-3 h-3 text-muted-foreground" />;
    }
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      guide: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      user: "bg-gray-500/10 text-gray-400 border-gray-500/20"
    };
    return colors[role] || colors.user;
  };

  return (
    <Link 
      href={`/user/${user.username}`} 
      className={`flex items-center gap-2 hover:opacity-80 transition-opacity ${className}`}
    >
      {showAvatar && (
        <Avatar className={`${avatarSize} border-none shadow-sm shadow-black/30`}>
          <AvatarImage
            src={user.photo}
            alt={user.name}
          />
          <AvatarFallback className="text-xs bg-secondary">
            {user.name?.[0] || user.username?.[0] || "U"}
          </AvatarFallback>
        </Avatar>
      )}
      <span className={`${textSize} text-muted-foreground hover:text-foreground transition-colors`}>
        {user.name || user.username}
      </span>
      {showRole && user.role && user.role !== 'user' && (
        <Badge variant="outline" className={getRoleBadgeColor(user.role)}>
          {getRoleIcon(user.role)}
          <span className="ml-1 capitalize">{user.role}</span>
        </Badge>
      )}
    </Link>
  );
}
