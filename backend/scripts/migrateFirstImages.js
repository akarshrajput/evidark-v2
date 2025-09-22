import mongoose from "mongoose";
import { config } from "dotenv";
import Story from "../models/Story.js";
import { extractFirstImage } from "../utils/imageExtractor.js";

// Load environment variables
config();

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Connected...");
  } catch (err) {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  }
};

// Migration function to populate firstImage field for existing stories
const migrateFirstImages = async () => {
  try {
    console.log("Starting migration to populate firstImage field...");

    // Find all stories that don't have firstImage set or have empty firstImage
    const stories = await Story.find({
      $or: [
        { firstImage: { $exists: false } },
        { firstImage: "" },
        { firstImage: null },
      ],
    }).select("_id title content firstImage");

    console.log(`Found ${stories.length} stories to migrate`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const story of stories) {
      try {
        const firstImage = extractFirstImage(story.content);

        if (firstImage && firstImage !== story.firstImage) {
          await Story.findByIdAndUpdate(story._id, { firstImage });
          updatedCount++;
          console.log(
            `✓ Updated story: ${story.title} - Image: ${firstImage.substring(
              0,
              50
            )}...`
          );
        } else {
          skippedCount++;
          console.log(`- Skipped story: ${story.title} - No image found`);
        }
      } catch (error) {
        console.error(`Error processing story ${story._id}:`, error.message);
      }
    }

    console.log("\n--- Migration Complete ---");
    console.log(`✓ Stories updated: ${updatedCount}`);
    console.log(`- Stories skipped: ${skippedCount}`);
    console.log(`Total processed: ${stories.length}`);
  } catch (error) {
    console.error("Migration failed:", error);
  }
};

// Main execution
const runMigration = async () => {
  await connectDB();
  await migrateFirstImages();
  await mongoose.connection.close();
  console.log("Database connection closed");
  process.exit(0);
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigration().catch((error) => {
    console.error("Migration script failed:", error);
    process.exit(1);
  });
}

export default migrateFirstImages;
