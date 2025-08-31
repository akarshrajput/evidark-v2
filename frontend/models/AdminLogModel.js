import mongoose from "mongoose";

const adminLogSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: { type: String, required: true }, // e.g. "delete_story", "ban_user"
    targetUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    targetStory: { type: mongoose.Schema.Types.ObjectId, ref: "Story" },
    metadata: { type: Object }, // flexible for extra data
  },
  { timestamps: true }
);

export default mongoose.model("AdminLog", adminLogSchema);
