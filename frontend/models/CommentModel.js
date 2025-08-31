import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    storyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Story",
      required: true
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null
    },
    likes: {
      type: Number,
      default: 0
    },
    replies: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment"
    }],
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index for better query performance
commentSchema.index({ storyId: 1, createdAt: -1 });
commentSchema.index({ parentId: 1 });

export default mongoose.models.Comment || mongoose.model("Comment", commentSchema);
