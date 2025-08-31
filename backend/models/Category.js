import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
      lowercase: true,
      maxlength: [50, "Category name cannot be more than 50 characters"],
    },
    displayName: {
      type: String,
      trim: true,
      maxlength: [50, "Display name cannot be more than 50 characters"],
    },
    description: {
      type: String,
      maxlength: [500, "Description cannot be more than 500 characters"],
    },
    icon: {
      type: String,
      default: "",
    },
    color: {
      type: String,
      default: "#666666",
      match: [/^#[0-9A-F]{6}$/i, "Color must be a valid hex color"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    storiesCount: {
      type: Number,
      default: 0,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for better query performance
categorySchema.index({ name: 1 });
categorySchema.index({ isActive: 1, order: 1 });

// Pre-save middleware to auto-generate displayName from name
categorySchema.pre("save", function (next) {
  if (!this.displayName && this.name) {
    // Convert name to proper display format (capitalize first letter of each word)
    this.displayName = this.name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }
  next();
});

// Method to update stories count
categorySchema.methods.updateStoriesCount = async function () {
  const Story = mongoose.model("Story");
  this.storiesCount = await Story.countDocuments({
    category: this.name,
    status: "published",
  });
  await this.save();
};

export default mongoose.model("Category", categorySchema);
