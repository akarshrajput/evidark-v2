import mongoose from 'mongoose';
import User from '../models/User.js';
import connectDB from '../config/database.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const migrateUserRoles = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log('📊 Connected to database for user role migration');

    // Find all users with old roles
    const usersToUpdate = await User.find({
      role: { $in: ['reader', 'author'] }
    });

    console.log(`🔍 Found ${usersToUpdate.length} users with old roles to migrate`);

    if (usersToUpdate.length === 0) {
      console.log('✅ No users need role migration');
      process.exit(0);
    }

    // Migration mapping
    const roleMigrationMap = {
      'reader': 'user',
      'author': 'user', // Authors become regular users, can be promoted manually if needed
    };

    let migratedCount = 0;

    for (const user of usersToUpdate) {
      const oldRole = user.role;
      const newRole = roleMigrationMap[oldRole];

      if (newRole) {
        user.role = newRole;
        await user.save();
        migratedCount++;
        console.log(`✅ Migrated user ${user.name} (${user.email}) from '${oldRole}' to '${newRole}'`);
      }
    }

    console.log(`🎉 Successfully migrated ${migratedCount} users to new role system`);
    console.log('📋 Role system now supports: user, guide, admin');
    console.log('🔧 Default role for new users: user');

  } catch (error) {
    console.error('❌ Error during user role migration:', error);
    process.exit(1);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateUserRoles();
}

export default migrateUserRoles;
