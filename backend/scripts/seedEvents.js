import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Event from '../models/Event.js';
import User from '../models/User.js';
import connectDB from '../config/database.js';

dotenv.config();

const sampleEvents = [
  {
    title: "Midnight Horror Writing Challenge",
    description: "Write the most spine-chilling short story in 48 hours. Participants must craft a horror story between 1000-3000 words that will make readers sleep with the lights on. The best submissions will be featured on our platform and win exclusive rewards.",
    type: "writing_challenge",
    startDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
    maxParticipants: 50,
    requirements: {
      minReputation: 10,
      description: "Must have at least 10 reputation points and previous writing experience"
    },
    rewards: {
      points: 100,
      description: "Winner gets 100 points, featured story placement, and exclusive horror writer badge"
    },
    settings: {
      isPublic: true,
      allowLateJoining: false,
      requireApproval: false,
      enableChat: true,
      enableVoting: true
    },
    tags: ["horror", "writing", "contest", "midnight", "challenge"]
  },
  {
    title: "Dark Ritual: Community Séance",
    description: "Join us for a virtual séance where we'll share our most haunting experiences and connect with the supernatural. This interactive event includes guided meditation, ghost story sharing, and collective energy work to commune with the other side.",
    type: "dark_ritual",
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours later
    maxParticipants: 13, // Unlucky number for atmosphere
    requirements: {
      minReputation: 0,
      description: "Open to all brave souls willing to commune with darkness"
    },
    rewards: {
      points: 50,
      description: "Participants receive mystical points and access to exclusive dark content"
    },
    settings: {
      isPublic: true,
      allowLateJoining: false,
      requireApproval: true,
      enableChat: true,
      enableVoting: false
    },
    tags: ["ritual", "séance", "supernatural", "community", "interactive"]
  },
  {
    title: "Horror Showcase: Best of the Dark",
    description: "A curated showcase of the most terrifying stories from our community. Authors will present their work live, followed by Q&A sessions. Audience members can vote for their favorite spine-tingling tale.",
    type: "horror_showcase",
    startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
    endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // 3 hours later
    maxParticipants: null, // Unlimited audience
    requirements: {
      minReputation: 0,
      description: "All horror enthusiasts welcome"
    },
    rewards: {
      points: 25,
      description: "Attendance points and voting rewards for active participants"
    },
    settings: {
      isPublic: true,
      allowLateJoining: true,
      requireApproval: false,
      enableChat: true,
      enableVoting: true
    },
    tags: ["showcase", "presentation", "voting", "community", "horror"]
  },
  {
    title: "Crimson Quill Story Contest",
    description: "Monthly story contest with the theme 'Abandoned Places'. Submit your most haunting tale about forgotten locations where darkness dwells. Stories must be original and between 2000-5000 words.",
    type: "story_contest",
    startDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // Tomorrow
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
    maxParticipants: 100,
    requirements: {
      minReputation: 5,
      description: "Minimum 5 reputation points required. Stories must be original work."
    },
    rewards: {
      points: 200,
      description: "1st place: 200 points + featured placement. 2nd: 100 points. 3rd: 50 points."
    },
    settings: {
      isPublic: true,
      allowLateJoining: true,
      requireApproval: false,
      enableChat: true,
      enableVoting: true
    },
    tags: ["contest", "monthly", "abandoned", "places", "crimson", "quill"]
  },
  {
    title: "Midnight Reading Circle",
    description: "Join fellow night owls for a live reading session of classic horror literature. Tonight we're reading excerpts from H.P. Lovecraft's 'The Call of Cthulhu'. Bring your favorite dark beverage and prepare for cosmic horror.",
    type: "midnight_reading",
    startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000), // 1.5 hours later
    maxParticipants: 25,
    requirements: {
      minReputation: 0,
      description: "All lovers of classic horror welcome"
    },
    rewards: {
      points: 30,
      description: "Reading participation points and discussion rewards"
    },
    settings: {
      isPublic: true,
      allowLateJoining: false,
      requireApproval: false,
      enableChat: true,
      enableVoting: false
    },
    tags: ["reading", "lovecraft", "classic", "midnight", "literature"]
  },
  {
    title: "Shadow Writers Gathering",
    description: "Monthly meetup for horror writers to share techniques, discuss craft, and provide feedback on works in progress. This month's focus: 'Building Atmospheric Tension'. Bring a short excerpt to share!",
    type: "community_gathering",
    startDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours later
    maxParticipants: 20,
    requirements: {
      minReputation: 15,
      description: "For active writers with published stories on the platform"
    },
    rewards: {
      points: 40,
      description: "Networking points and feedback rewards for active participation"
    },
    settings: {
      isPublic: false, // Private gathering
      allowLateJoining: false,
      requireApproval: true,
      enableChat: true,
      enableVoting: false
    },
    tags: ["writers", "craft", "feedback", "networking", "techniques"]
  }
];

async function seedEvents() {
  try {
    await connectDB();
    
    // Find an admin user to assign as creator
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('No admin user found. Creating sample admin user...');
      // You might want to create an admin user here or use an existing one
      console.log('Please ensure you have an admin user in your database first.');
      return;
    }

    // Clear existing events
    await Event.deleteMany({});
    console.log('Cleared existing events');

    // Add creator to each event
    const eventsWithCreator = sampleEvents.map(event => ({
      ...event,
      createdBy: adminUser._id
    }));

    // Insert sample events
    const createdEvents = await Event.insertMany(eventsWithCreator);
    console.log(`Created ${createdEvents.length} sample events`);

    // Add some sample participants to make events look active
    const users = await User.find({ role: { $ne: 'admin' } }).limit(10);
    
    if (users.length > 0) {
      for (const event of createdEvents) {
        // Randomly add 1-5 participants to each event
        const participantCount = Math.floor(Math.random() * 5) + 1;
        const selectedUsers = users.slice(0, Math.min(participantCount, users.length));
        
        for (const user of selectedUsers) {
          event.addParticipant(user._id);
        }
        
        await event.save();
      }
      console.log('Added sample participants to events');
    }

    console.log('✅ Event seeding completed successfully!');
    
    // Display created events
    console.log('\n📅 Created Events:');
    createdEvents.forEach((event, index) => {
      console.log(`${index + 1}. ${event.title} (${event.type})`);
      console.log(`   Status: ${event.status}`);
      console.log(`   Participants: ${event.participants.length}`);
      console.log(`   Start: ${event.startDate.toLocaleDateString()}`);
      console.log('');
    });

  } catch (error) {
    console.error('Error seeding events:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the seeder
seedEvents();
