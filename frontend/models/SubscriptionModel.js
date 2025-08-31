import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    plan: {
      type: String,
      enum: ["free", "premium", "enterprise"],
      default: "free",
    },
    validTill: { type: Date },
    paymentInfo: { type: Object },
  },
  { timestamps: true }
);

export default mongoose.model("Subscription", subscriptionSchema);
