import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import rateLimit from 'express-rate-limit';

// Import routes
import authRoutes from './routes/auth.js';
import storyRoutes from './routes/stories.js';
import userRoutes from './routes/users.js';
import chatRoutes from './routes/chats.js';
import categoryRoutes from './routes/categories.js';
import commentRoutes from './routes/comments.js';
import statsRoutes from './routes/stats.js';
import eventsRoutes from './routes/events.js';
import healthRoutes from './routes/health.js';
import notificationRoutes from './routes/notifications.js';
import communityRoutes from './routes/communities.js';
import communityPostRoutes from './routes/communityPosts.js';
import trendingRoutes from './routes/trending.js';
import searchRoutes from './routes/search.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';

// Import database connection
import connectDB from './config/database.js';

// Import socket handlers
import { initSocket } from './socket/socketHandlers.js';
import { setSocketIO } from './utils/notificationHelper.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

// Connect to MongoDB
connectDB();

// Trust proxy for rate limiting
app.set('trust proxy', 1);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 500 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  skip: (req) => {
    // Skip rate limiting for server-side requests from Next.js
    const userAgent = req.get('User-Agent') || '';
    return userAgent.includes('node') || req.ip === '::1' || req.ip === '127.0.0.1';
  }
});

// Middleware
app.use(helmet());

// CORS configuration with multiple allowed origins
const allowedOrigins = [
  'http://localhost:3000',
  'https://evidark.app',
  'https://evidark-v2.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean); // Remove any undefined values

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'EviDark Backend Server is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/v1/health', healthRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/stories', storyRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/chats', chatRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/comments', commentRoutes);
app.use('/api/v1/stats', statsRoutes);
app.use('/api/v1/events', eventsRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/communities', communityRoutes);
app.use('/api/v1/community-posts', communityPostRoutes);
app.use('/api/v1/trending', trendingRoutes);
app.use('/api/v1/search', searchRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Create HTTP server and Initialize Socket.IO
const server = createServer(app);
const io = initSocket(server);

// Set socket instance for notifications
setSocketIO(io);

// Make io accessible to routes
app.set('io', io);

server.listen(PORT, () => {
  console.log(`🚀 EviDark Backend Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
  console.log(`💬 Socket.IO server initialized`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

export default app;
