import mongoose from "mongoose";

const contributionSchema = new mongoose.Schema(
  {
    story: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Story",
      required: true,
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    role: {
      type: String,
      enum: ["researcher", "writer", "editor"],
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Contribution", contributionSchema);
