import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Story from '../models/Story.js';
import User from '../models/User.js';
import Community from '../models/Community.js';
import Event from '../models/Event.js';

dotenv.config();

const optimizeSearchIndexes = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Drop existing text indexes if they exist
    try {
      await Story.collection.dropIndex('title_text_description_text_content_text_tags_text');
      console.log('Dropped existing Story text index');
    } catch (error) {
      console.log('No existing Story text index to drop');
    }

    try {
      await User.collection.dropIndex('name_text_username_text_bio_text');
      console.log('Dropped existing User text index');
    } catch (error) {
      console.log('No existing User text index to drop');
    }

    try {
      await Community.collection.dropIndex('name_text_description_text_tags_text');
      console.log('Dropped existing Community text index');
    } catch (error) {
      console.log('No existing Community text index to drop');
    }

    try {
      await Event.collection.dropIndex('title_text_description_text_tags_text');
      console.log('Dropped existing Event text index');
    } catch (error) {
      console.log('No existing Event text index to drop');
    }

    // Create optimized text indexes with weights
    console.log('Creating optimized search indexes...');

    // Story search indexes with weighted fields
    await Story.collection.createIndex(
      {
        title: 'text',
        description: 'text',
        content: 'text',
        tags: 'text',
        category: 'text'
      },
      {
        weights: {
          title: 10,
          description: 5,
          tags: 8,
          category: 3,
          content: 1
        },
        name: 'story_search_index'
      }
    );
    console.log('✓ Story search index created');

    // User search indexes
    await User.collection.createIndex(
      {
        name: 'text',
        username: 'text',
        bio: 'text'
      },
      {
        weights: {
          name: 10,
          username: 8,
          bio: 2
        },
        name: 'user_search_index'
      }
    );
    console.log('✓ User search index created');

    // Community search indexes
    await Community.collection.createIndex(
      {
        name: 'text',
        description: 'text',
        tags: 'text'
      },
      {
        weights: {
          name: 10,
          description: 3,
          tags: 5
        },
        name: 'community_search_index'
      }
    );
    console.log('✓ Community search index created');

    // Event search indexes
    await Event.collection.createIndex(
      {
        title: 'text',
        description: 'text',
        tags: 'text'
      },
      {
        weights: {
          title: 10,
          description: 3,
          tags: 5
        },
        name: 'event_search_index'
      }
    );
    console.log('✓ Event search index created');

    // Additional performance indexes
    await Story.collection.createIndex({ status: 1, createdAt: -1 });
    await Story.collection.createIndex({ category: 1, status: 1, createdAt: -1 });
    await Story.collection.createIndex({ tags: 1, status: 1 });
    await Story.collection.createIndex({ author: 1, status: 1, createdAt: -1 });
    await Story.collection.createIndex({ 'engagement.totalInteractions': -1, status: 1 });
    
    await User.collection.createIndex({ username: 1 });
    await User.collection.createIndex({ email: 1 });
    await User.collection.createIndex({ 'stats.followersCount': -1 });
    
    await Community.collection.createIndex({ status: 1, 'stats.memberCount': -1 });
    await Community.collection.createIndex({ type: 1, status: 1 });
    await Community.collection.createIndex({ featured: -1, status: 1 });
    
    await Event.collection.createIndex({ status: 1, startDate: 1 });
    await Event.collection.createIndex({ type: 1, status: 1 });

    console.log('✓ All performance indexes created');

    // Create compound indexes for common search patterns
    await Story.collection.createIndex({ 
      status: 1, 
      category: 1, 
      createdAt: -1 
    }, { name: 'story_filter_index' });

    await Story.collection.createIndex({ 
      status: 1, 
      author: 1, 
      createdAt: -1 
    }, { name: 'story_author_index' });

    console.log('✓ Compound indexes created');

    console.log('\n🎉 Search optimization completed successfully!');
    console.log('\nIndexes created:');
    console.log('- Weighted text search indexes for all models');
    console.log('- Performance indexes for filtering and sorting');
    console.log('- Compound indexes for common search patterns');
    
  } catch (error) {
    console.error('Error optimizing search indexes:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the optimization
optimizeSearchIndexes();
