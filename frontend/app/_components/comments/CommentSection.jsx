"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Ghost, Skull } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import Comment from "./Comment";
import UserLink from "@/app/_components/ui/UserLink";

export default function CommentSection({ storyId }) {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState(null);
  const commentsRef = useRef(null);

  useEffect(() => {
    fetchComments();
  }, [storyId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";
      const response = await fetch(
        `${baseUrl}/api/v1/stories/${storyId}/comments`
      );
      if (response.ok) {
        const data = await response.json();
        const fetchedComments = data.success ? data.data : data;
        console.log("Fetched comments from server:", fetchedComments);
        setComments(fetchedComments);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Please sign in to comment");
      return;
    }
    if (!newComment.trim()) return;

    // Create optimistic comment for instant UI update
    const optimisticComment = {
      _id: `temp-${Date.now()}`,
      content: newComment,
      author: {
        _id: user.id,
        name: user.name,
        username: user.username,
        avatar: user.avatar,
        role: user.role || "reader",
      },
      story: storyId,
      parentComment: null,
      replies: [],
      likesCount: 0,
      isLiked: false,
      createdAt: new Date().toISOString(),
      isEdited: false,
      // Add these fields to match server response
      likes: [],
      updatedAt: new Date().toISOString(),
    };

    // Add comment immediately to UI
    setComments((prev) => [optimisticComment, ...prev]);
    setNewComment("");
    setSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";
      const response = await fetch(
        `${baseUrl}/api/v1/stories/${storyId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            content: newComment,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const serverComment = data.success ? data.data : data;

        console.log("Server response:", serverComment);

        // Replace optimistic comment with server response
        setComments((prevComments) => {
          return prevComments.map((c) =>
            c._id === optimisticComment._id
              ? {
                  ...serverComment,
                  // Ensure all required fields are present
                  author: serverComment.author || optimisticComment.author,
                  replies: serverComment.replies || [],
                  likesCount: serverComment.likesCount || 0,
                  isLiked: serverComment.isLiked || false,
                  // Add fallbacks for any missing fields
                  likes: serverComment.likes || [],
                  updatedAt:
                    serverComment.updatedAt || new Date().toISOString(),
                  isEdited: serverComment.isEdited || false,
                }
              : c
          );
        });
        toast.success("Comment added to the darkness!");
      } else {
        // Remove optimistic comment on error
        setComments((prevComments) =>
          prevComments.filter((c) => c._id !== optimisticComment._id)
        );
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to add comment");
      }
    } catch (error) {
      // Remove optimistic comment on error
      setComments((prevComments) =>
        prevComments.filter((c) => c._id !== optimisticComment._id)
      );
      console.error("Comment submission error:", error);
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to like comments");
      return;
    }

    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";
      const token = localStorage.getItem("token");

      // Optimistically update UI
      setComments((prevComments) =>
        prevComments.map((comment) =>
          updateCommentInTree(comment, commentId, {
            isLiked: !comment.isLiked,
            likesCount: comment.isLiked
              ? (comment.likesCount || 0) - 1
              : (comment.likesCount || 0) + 1,
          })
        )
      );

      const response = await fetch(
        `${baseUrl}/api/v1/comments/${commentId}/like`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userId: user.id }),
        }
      );

      if (!response.ok) {
        // Revert optimistic update if failed
        setComments((prevComments) =>
          prevComments.map((comment) =>
            updateCommentInTree(comment, commentId, {
              isLiked: !comment.isLiked,
              likesCount: comment.isLiked
                ? (comment.likesCount || 0) + 1
                : (comment.likesCount || 0) - 1,
            })
          )
        );
        toast.error("Failed to like comment");
      }
    } catch (error) {
      // Revert optimistic update on error
      setComments((prevComments) =>
        prevComments.map((comment) =>
          updateCommentInTree(comment, commentId, {
            isLiked: !comment.isLiked,
            likesCount: comment.isLiked
              ? (comment.likesCount || 0) + 1
              : (comment.likesCount || 0) - 1,
          })
        )
      );
      toast.error("Failed to like comment");
    }
  };

  const handleReplyComment = async (parentId, content) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to reply");
      return;
    }

    // Create optimistic reply for instant UI update
    const optimisticReply = {
      _id: `temp-reply-${Date.now()}`,
      content: content,
      author: {
        _id: user.id,
        name: user.name,
        username: user.username,
        avatar: user.avatar,
        role: user.role || "reader",
      },
      story: storyId,
      parentComment: parentId,
      replies: [],
      likesCount: 0,
      isLiked: false,
      createdAt: new Date().toISOString(),
      isEdited: false,
      likes: [],
      updatedAt: new Date().toISOString(),
    };

    // Add reply immediately to UI
    setComments((prevComments) =>
      prevComments.map((comment) =>
        addReplyToComment(comment, parentId, optimisticReply)
      )
    );

    try {
      const token = localStorage.getItem("token");
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";
      const response = await fetch(
        `${baseUrl}/api/v1/stories/${storyId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            content,
            parentComment: parentId,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const serverReply = data.success ? data.data : data;

        // Replace optimistic reply with server response
        setComments((prevComments) =>
          prevComments.map((comment) =>
            updateCommentInTree(comment, optimisticReply._id, {
              ...serverReply,
              author: serverReply.author || optimisticReply.author,
              replies: serverReply.replies || [],
              likesCount: serverReply.likesCount || 0,
              isLiked: serverReply.isLiked || false,
              likes: serverReply.likes || [],
              updatedAt: serverReply.updatedAt || new Date().toISOString(),
              isEdited: serverReply.isEdited || false,
            })
          )
        );

        toast.success("Reply added!");
      } else {
        // Remove optimistic reply on error
        setComments((prevComments) =>
          prevComments.map((comment) =>
            removeReplyFromComment(comment, optimisticReply._id)
          )
        );
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to add reply");
      }
    } catch (error) {
      // Remove optimistic reply on error
      setComments((prevComments) =>
        prevComments.map((comment) =>
          removeReplyFromComment(comment, optimisticReply._id)
        )
      );
      console.error("Reply submission error:", error);
      toast.error("Something went wrong");
    }
  };

  const handleEditComment = async (commentId, content) => {
    // Optimistically update UI
    setComments((prevComments) =>
      prevComments.map((comment) =>
        updateCommentInTree(comment, commentId, {
          content: content,
          isEdited: true,
          updatedAt: new Date().toISOString(),
        })
      )
    );

    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";
      const token = localStorage.getItem("token");

      const response = await fetch(`${baseUrl}/api/v1/comments/${commentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        // Revert optimistic update if failed
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to update comment");

        // Refetch comments to ensure UI is in sync with server
        fetchComments();
      } else {
        toast.success("Comment updated!");
      }
    } catch (error) {
      console.error("Edit comment error:", error);
      toast.error("Something went wrong");

      // Refetch comments to ensure UI is in sync with server
      fetchComments();
    }
  };

  const handleDeleteComment = async (commentId) => {
    setCommentToDelete(commentId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteComment = async () => {
    // Optimistically remove comment from UI
    const deletedComment = comments.find((comment) =>
      findCommentInTree(comment, commentToDelete)
    );

    setComments((prevComments) =>
      prevComments.filter(
        (comment) => !isCommentOrReply(comment, commentToDelete)
      )
    );

    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050";
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${baseUrl}/api/v1/comments/${commentToDelete}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        // Re-add comment if deletion failed
        setComments((prevComments) => {
          if (deletedComment) {
            if (deletedComment.parentComment) {
              // This is a reply, add it back to its parent
              return prevComments.map((comment) =>
                addReplyToComment(
                  comment,
                  deletedComment.parentComment,
                  deletedComment
                )
              );
            } else {
              // This is a top-level comment
              return [...prevComments, deletedComment];
            }
          }
          return prevComments;
        });

        const errorData = await response.json();
        toast.error(errorData.error || "Failed to delete comment");
      } else {
        toast.success("Comment deleted!");
      }
    } catch (error) {
      // Re-add comment if deletion failed
      setComments((prevComments) => {
        if (deletedComment) {
          if (deletedComment.parentComment) {
            // This is a reply, add it back to its parent
            return prevComments.map((comment) =>
              addReplyToComment(
                comment,
                deletedComment.parentComment,
                deletedComment
              )
            );
          } else {
            // This is a top-level comment
            return [...prevComments, deletedComment];
          }
        }
        return prevComments;
      });

      console.error("Delete comment error:", error);
      toast.error("Something went wrong");
    } finally {
      setCommentToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  // Helper functions for comment tree manipulation
  const updateCommentInTree = (comment, targetId, updates) => {
    if (comment._id === targetId) {
      return { ...comment, ...updates };
    }
    if (comment.replies && comment.replies.length > 0) {
      return {
        ...comment,
        replies: comment.replies.map((reply) =>
          updateCommentInTree(reply, targetId, updates)
        ),
      };
    }
    return comment;
  };

  const addReplyToComment = (comment, parentId, reply) => {
    if (comment._id === parentId) {
      return {
        ...comment,
        replies: [...(comment.replies || []), reply],
      };
    }
    if (comment.replies && comment.replies.length > 0) {
      return {
        ...comment,
        replies: comment.replies.map((r) =>
          addReplyToComment(r, parentId, reply)
        ),
      };
    }
    return comment;
  };

  const removeReplyFromComment = (comment, replyId) => {
    if (comment.replies) {
      return {
        ...comment,
        replies: comment.replies
          .filter((reply) => reply._id !== replyId)
          .map((reply) => removeReplyFromComment(reply, replyId)),
      };
    }
    return comment;
  };

  const isCommentOrReply = (comment, targetId) => {
    if (comment._id === targetId) return true;
    if (comment.replies) {
      return comment.replies.some((reply) => isCommentOrReply(reply, targetId));
    }
    return false;
  };

  const findCommentInTree = (comment, targetId) => {
    if (comment._id === targetId) return comment;
    if (comment.replies) {
      for (const reply of comment.replies) {
        const found = findCommentInTree(reply, targetId);
        if (found) return found;
      }
    }
    return null;
  };

  return (
    <>
      <div className="bg-background/30 backdrop-blur-sm rounded-lg p-6">
        <div className="flex items-center gap-2 mb-6">
          <MessageSquare className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">
            Dark Whispers ({comments.length})
          </h3>
        </div>

        <div className="space-y-6">
          {/* Comment Form */}
          {isAuthenticated ? (
            <form onSubmit={handleSubmitComment} className="space-y-4">
              <div className="flex items-start gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="bg-gradient-to-br from-red-500 to-red-700 text-white text-sm">
                    {user.name?.[0] || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    placeholder="Share your thoughts on this dark tale..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[100px] bg-background/50 border-none shadow-sm shadow-black/30 focus:shadow-md focus:shadow-black/40 resize-none"
                    disabled={submitting}
                  />
                  <div className="flex justify-between items-center mt-3">
                    <div className="text-xs text-muted-foreground">
                      Speak your mind, but remember... the darkness is listening
                    </div>
                    <Button
                      type="submit"
                      disabled={!newComment.trim() || submitting}
                      className="bg-red-600 hover:bg-red-700 text-white border-none shadow-sm shadow-black/30 hover:shadow-md hover:shadow-black/40 transition-all duration-200"
                    >
                      {submitting ? "Whispering..." : "Whisper into the Void"}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="bg-background/50 rounded-lg p-6 text-center">
              <Ghost className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                Join the darkness to share your thoughts
              </p>
              <Button
                asChild
                className="bg-red-600 hover:bg-red-700 text-white border-none shadow-sm shadow-black/30 hover:shadow-md hover:shadow-black/40 transition-all duration-200"
              >
                <a href="/login">Sign In to Comment</a>
              </Button>
            </div>
          )}

          {/* Comments List */}
          <div ref={commentsRef} className="space-y-4">
            {loading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-background/50 rounded-lg p-4 animate-pulse"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-muted rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-1/4"></div>
                        <div className="h-3 bg-muted rounded w-3/4"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : comments.length === 0 ? (
              <div className="bg-background/50 rounded-lg p-8 text-center">
                <Skull className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">
                  Silence in the Void
                </h3>
                <p className="text-muted-foreground">
                  No whispers have been heard yet. Be the first to break the
                  silence.
                </p>
              </div>
            ) : (
              comments.map((comment) => (
                <Comment
                  key={comment._id}
                  comment={comment}
                  onLike={handleLikeComment}
                  onReply={handleReplyComment}
                  onEdit={handleEditComment}
                  onDelete={handleDeleteComment}
                  session={{ user }}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-background border border-border/30">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Comment</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete this comment? This action will
              also erase all replies to this comment, and cannot be undone. The
              darkness will consume them forever...
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-none bg-secondary/50 hover:bg-secondary/70 hover:text-foreground">
              Keep Comment
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteComment}
              className="bg-red-600 hover:bg-red-700 text-white border-none"
            >
              Delete Forever
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
