import mongoose from "mongoose";
import slugify from "slugify"; // npm install slugify

const storySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    photo: { type: String, default: "default-story.png" },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    description: { type: String, maxlength: 500 },
    content: { type: String, required: true },

    // Category moved to dynamic, database-driven list; keep as free string here
    category: {
      type: String,
      required: true,
      trim: true,
    },

    // Free-form tags to allow user-defined tagging
    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    // Story metadata
    readingTime: { type: Number, default: 0 }, // in minutes
    wordCount: { type: Number, default: 0 },

    // Content warnings for dark stories
    contentWarnings: [
      {
        type: String,
        trim: true,
      },
    ],

    // Age rating
    ageRating: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ["draft", "published", "archived", "under-review"],
      default: "draft",
    },

    // Engagement metrics
    views: { type: Number, default: 0 },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    likesCount: { type: Number, default: 0 },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    commentsCount: { type: Number, default: 0 },
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    bookmarksCount: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },

    // Reddit-like voting system
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // Featured and trending
    featured: { type: Boolean, default: false },
    trending: { type: Boolean, default: false },

    // Publishing details
    publishedAt: { type: Date },
    lastEditedAt: { type: Date },

    // SEO and metadata
    metaTitle: { type: String },
    metaDescription: { type: String },

    // Story series support
    series: {
      name: { type: String },
      part: { type: Number },
      totalParts: { type: Number },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ----------------------------
// Virtual for reading time calculation
// ----------------------------
storySchema.virtual("estimatedReadingTime").get(function () {
  const wordsPerMinute = 200;
  return Math.ceil(this.wordCount / wordsPerMinute);
});

// ----------------------------
// Pre-save hooks
// ----------------------------
storySchema.pre("save", async function (next) {
  // Calculate word count and reading time
  if (this.content) {
    const textContent = this.content.replace(/<[^>]*>/g, ""); // Remove HTML tags
    const words = textContent.split(/\s+/).filter((word) => word.length > 0);
    this.wordCount = words.length;
    this.readingTime = Math.ceil(words.length / 200); // 200 words per minute
  }

  // Set last edited time
  if (this.isModified() && !this.isNew) {
    this.lastEditedAt = new Date();
  }

  // Set published date when status changes to published
  if (
    this.isModified("status") &&
    this.status === "published" &&
    !this.publishedAt
  ) {
    this.publishedAt = new Date();
  }

  // Only generate slug if it's new (created)
  if (!this.isNew || this.slug) return next();

  // Base slug from title
  let baseSlug = slugify(this.title, { lower: true, strict: true });

  // If title is very short, append description (first 30 chars)
  if (baseSlug.length < 5 && this.description) {
    baseSlug +=
      "-" +
      slugify(this.description.substring(0, 30), { lower: true, strict: true });
  }

  // Ensure uniqueness by adding a random short string if needed
  let slug = baseSlug;
  let count = 0;

  while (await mongoose.models.Story.exists({ slug })) {
    count++;
    slug = `${baseSlug}-${count}`;
  }

  this.slug = slug;
  next();
});

// ----------------------------
// Prevent slug from being updated
// ----------------------------
storySchema.pre("findOneAndUpdate", function (next) {
  if (this._update.slug) {
    delete this._update.slug; // prevent slug from changing
  }
  next();
});

const Story = mongoose.models.Story || mongoose.model("Story", storySchema);
export default Story;
