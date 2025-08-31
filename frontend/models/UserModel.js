import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // Core fields
    name: {
      type: String,
    },
    email: {
      type: String,
      required: [true, "User must have an email"],
      unique: true,
      lowercase: true,
    },
    username: {
      type: String,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      select: false, // Hide password by default
    },
    photo: {
      type: String,
    },

    // Roles & auth
    role: {
      type: String,
      enum: ["user", "admin", "guide", "author", "reader"],
      default: "user",
    },
    verified: {
      type: Boolean,
      default: false,
    },

    // Profile info
    dob: { type: Date, default: null },
    address: { type: String, default: "" },
    state: { type: String, default: "" },
    country: { type: String, default: "" },
    gender: { type: String, default: "" },
    mobileNumber: { type: String, default: "" },

    // Profile extras
    bio: { type: String, maxlength: 500, default: "" },
    status: { type: String, default: "" },
    subscription: { type: Boolean, default: false },

    // Gamification
    xp: { type: Number, default: 0 },
    creatorScore: { type: Number, default: 0 },

    // Relationships
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Bookmark" }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "Like" }],
    likedComments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // Stats
    followersCount: { type: Number, default: 0 },
    followingCount: { type: Number, default: 0 },
    storiesCount: { type: Number, default: 0 },
    totalViews: { type: Number, default: 0 },
    totalLikes: { type: Number, default: 0 },

    // Account type
    accountType: {
      type: String,
      default: "Personal",
      enum: ["Personal", "Organization"],
    },

    // Chat & online status
    isOnline: {
      type: Boolean,
      default: false
    },
    lastSeen: {
      type: Date,
      default: Date.now
    },
    avatar: {
      type: String,
      default: ""
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

// Auto-generate username if not provided
userSchema.pre("save", function (next) {
  if (!this.username && this.email) {
    this.username = this.email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "_");
  }
  next();
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
