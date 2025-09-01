import mongoose from 'mongoose';
import Notification from '../models/Notification.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function fixNotificationTargetTypes() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('📊 Connected to MongoDB');

    // Update all notifications with lowercase targetType to proper casing
    const updates = [
      { from: 'story', to: 'Story' },
      { from: 'comment', to: 'Comment' },
      { from: 'user', to: 'User' }
    ];

    for (const update of updates) {
      const result = await Notification.updateMany(
        { targetType: update.from },
        { $set: { targetType: update.to } }
      );
      console.log(`✅ Updated ${result.modifiedCount} notifications from '${update.from}' to '${update.to}'`);
    }

    console.log('🎉 Notification targetType migration completed successfully');
    
    // Verify the changes
    const counts = await Promise.all([
      Notification.countDocuments({ targetType: 'Story' }),
      Notification.countDocuments({ targetType: 'Comment' }),
      Notification.countDocuments({ targetType: 'User' })
    ]);
    
    console.log(`📈 Current counts - Story: ${counts[0]}, Comment: ${counts[1]}, User: ${counts[2]}`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('📊 Disconnected from MongoDB');
    process.exit(0);
  }
}

fixNotificationTargetTypes();
