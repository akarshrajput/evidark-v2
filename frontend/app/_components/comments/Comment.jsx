"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Reply,
  MoreHorizontal,
  Crown,
  PenTool,
  Eye,
  Ghost,
  ChevronDown,
  ChevronUp,
  Trash,
  Edit,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";

export default function Comment({
  comment,
  onLike,
  onReply,
  onEdit,
  onDelete,
  depth = 0,
}) {
  const { user, isAuthenticated } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [showReplies, setShowReplies] = useState(true);
  const [submittingReply, setSubmittingReply] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [submittingEdit, setSubmittingEdit] = useState(false);

  const getRoleIcon = (role) => {
    switch (role) {
      case "admin":
        return <Crown className="w-3 h-3 text-yellow-400" />;
      case "author":
        return <PenTool className="w-3 h-3 text-primary" />;
      case "guide":
        return <Ghost className="w-3 h-3 text-purple-400" />;
      default:
        return <Eye className="w-3 h-3 text-muted-foreground" />;
    }
  };

  const getRoleBadgeColor = (role) => {
    const colors = {
      admin: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      author: "bg-primary/10 text-primary border-primary/20",
      guide: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      reader: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    };
    return colors[role] || colors.reader;
  };

  const handleSubmitReply = async (e) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    setSubmittingReply(true);
    try {
      await onReply(comment._id, replyContent);
      setReplyContent("");
      setShowReplyForm(false);
    } catch (error) {
      console.error("Error submitting reply:", error);
    } finally {
      setSubmittingReply(false);
    }
  };

  const maxDepth = 3; // Limit nesting depth to prevent infinite nesting

  return (
    <div
      className={`${depth > 0 ? "ml-8 border-l border-border/30 pl-4" : ""}`}
    >
      <Card className="bg-background/30 border-border/50 hover:bg-background/40 transition-colors">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="w-8 h-8 border border-border/50">
                <AvatarImage
                  src={comment.author?.photo}
                  alt={comment.author?.name}
                />
                <AvatarFallback className="bg-gradient-to-br from-red-500 to-red-700 text-white text-sm">
                  {comment.author?.name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              {comment.author?.role === "admin" && (
                <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-0.5">
                  <Crown className="w-2 h-2 text-black" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              {/* Author Info */}
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-foreground">
                  {comment.author?.name}
                </span>
                <Badge
                  variant="outline"
                  className={`text-xs px-1.5 py-0.5 ${getRoleBadgeColor(
                    comment.author?.role
                  )}`}
                >
                  {getRoleIcon(comment.author?.role)}
                  <span className="ml-1 capitalize">
                    {comment.author?.role}
                  </span>
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.createdAt))} ago
                </span>
                {comment.parentId && (
                  <Badge variant="outline" className="text-xs">
                    <Reply className="w-2 h-2 mr-1" />
                    Reply
                  </Badge>
                )}
              </div>

              {/* Comment Content */}
              {isEditing ? (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!editContent.trim()) return;

                    setSubmittingEdit(true);
                    try {
                      await onEdit(comment._id, editContent);
                      setIsEditing(false);
                    } catch (error) {
                      console.error("Error editing comment:", error);
                    } finally {
                      setSubmittingEdit(false);
                    }
                  }}
                  className="space-y-3"
                >
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="min-h-[80px] text-sm bg-background/50 border-border/50 focus:border-primary/50 resize-none"
                    disabled={submittingEdit}
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsEditing(false);
                        setEditContent(comment.content);
                      }}
                      disabled={submittingEdit}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      disabled={!editContent.trim() || submittingEdit}
                      className="spooky-glow"
                    >
                      {submittingEdit ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="text-sm text-foreground mb-3 leading-relaxed">
                  {comment.content}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onLike(comment._id)}
                  className={`h-8 px-2 ${
                    comment.isLiked
                      ? "text-red-400 hover:text-red-300"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  disabled={!isAuthenticated}
                >
                  <Heart
                    className={`w-3 h-3 mr-1 ${
                      comment.isLiked ? "fill-current" : ""
                    }`}
                  />
                  <span className="text-xs">{comment.likesCount || 0}</span>
                </Button>

                {depth < maxDepth && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowReplyForm(!showReplyForm)}
                    className="h-8 px-2 text-muted-foreground hover:text-foreground"
                    disabled={!isAuthenticated}
                  >
                    <Reply className="w-3 h-3 mr-1" />
                    <span className="text-xs">Reply</span>
                  </Button>
                )}

                {comment.replies && comment.replies.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowReplies(!showReplies)}
                    className="h-8 px-2 text-muted-foreground hover:text-foreground"
                  >
                    {showReplies ? (
                      <ChevronUp className="w-3 h-3 mr-1" />
                    ) : (
                      <ChevronDown className="w-3 h-3 mr-1" />
                    )}
                    <span className="text-xs">
                      {comment.replies.length}{" "}
                      {comment.replies.length === 1 ? "reply" : "replies"}
                    </span>
                  </Button>
                )}

                {isAuthenticated &&
                  (user.id === comment.author._id ||
                    user.role === "admin") && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-muted-foreground hover:text-foreground ml-auto"
                        >
                          <MoreHorizontal className="w-3 h-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem
                          onClick={() => setIsEditing(true)}
                          className="text-blue-500 focus:text-blue-500"
                        >
                          <Edit className="w-3 h-3 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDelete(comment._id)}
                          className="text-red-500 focus:text-red-500"
                        >
                          <Trash className="w-3 h-3 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
              </div>

              {/* Reply Form */}
              {showReplyForm && isAuthenticated && (
                <form onSubmit={handleSubmitReply} className="mt-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <Avatar className="w-6 h-6 border border-border/50">
                      <AvatarImage
                        src={user.avatar}
                        alt={user.name}
                      />
                      <AvatarFallback className="bg-gradient-to-br from-red-500 to-red-700 text-white text-xs">
                        {user.name?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Textarea
                        placeholder={`Reply to ${comment.author?.name}...`}
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                        className="min-h-[80px] text-sm bg-background/50 border-border/50 focus:border-primary/50 resize-none"
                        disabled={submittingReply}
                      />
                      <div className="flex justify-end gap-2 mt-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowReplyForm(false)}
                          disabled={submittingReply}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          size="sm"
                          disabled={!replyContent.trim() || submittingReply}
                          className="spooky-glow"
                        >
                          {submittingReply ? "Replying..." : "Reply"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && showReplies && (
        <div className="mt-3 space-y-3">
          {comment.replies.map((reply) => (
            <Comment
              key={reply._id}
              comment={reply}
              onLike={onLike}
              onReply={onReply}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
