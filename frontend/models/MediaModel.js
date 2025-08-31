import mongoose from "mongoose";

const mediaSchema = new mongoose.Schema(
  {
    story: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Story",
      required: true,
    },
    type: {
      type: String,
      enum: ["image", "video", "document"],
      required: true,
    },
    url: { type: String, required: true },
    caption: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Media", mediaSchema);
