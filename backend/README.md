# EviDark Backend API

A standalone Node.js/Express backend for the EviDark story publishing platform.

## Features

- **Authentication**: JWT-based authentication system
- **Stories**: Complete CRUD operations for dark stories
- **Real-time Chat**: Socket.IO powered messaging system
- **User Management**: User profiles, following, and social features
- **Categories**: Story categorization system
- **Comments**: Nested commenting system with likes
- **Security**: Rate limiting, CORS, and input validation

## Tech Stack

- Node.js & Express.js
- MongoDB with Mongoose
- Socket.IO for real-time features
- JWT for authentication
- Express Validator for input validation
- Helmet for security headers
- CORS for cross-origin requests

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
PORT=5050
MONGODB_URI=mongodb://localhost:27017/evidark
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

## Frontend Setup

In your frontend `.env.local` file, add:

```env
NEXT_PUBLIC_API_URL=http://localhost:5050
```

## API Routes

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password

### Stories
- `GET /api/stories` - Get all stories with filtering
- `POST /api/stories` - Create new story
- `GET /api/stories/:id` - Get single story
- `PUT /api/stories/:id` - Update story
- `DELETE /api/stories/:id` - Delete story
- `POST /api/stories/:id/like` - Like/unlike story
- `POST /api/stories/:id/bookmark` - Bookmark/unbookmark story

### Users
- `GET /api/users` - Get all users
- `GET /api/users/search` - Search users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile
- `POST /api/users/:id/follow` - Follow/unfollow user

### Chats
- `GET /api/chats` - Get user's chats
- `POST /api/chats` - Create new chat
- `GET /api/chats/:id` - Get single chat
- `POST /api/chats/:id/messages` - Send message
- `GET /api/chats/:id/messages` - Get chat messages

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (admin only)
- `PUT /api/categories/:id` - Update category (admin only)
- `DELETE /api/categories/:id` - Delete category (admin only)
- `DELETE /api/v1/categories/:id` - Delete category (Admin only)

### Comments
- `GET /api/v1/comments/:id` - Get comment by ID
- `PUT /api/v1/comments/:id` - Update comment
- `DELETE /api/v1/comments/:id` - Delete comment
- `POST /api/v1/comments/:id/like` - Like/unlike comment

## Socket.IO Events

### Client to Server
- `join_chat` - Join a chat room
- `leave_chat` - Leave a chat room
- `send_message` - Send a message
- `typing_start` - Start typing indicator
- `typing_stop` - Stop typing indicator
- `add_reaction` - Add reaction to message
- `remove_reaction` - Remove reaction from message
- `mark_messages_read` - Mark messages as read

### Server to Client
- `new_message` - New message received
- `user_typing` - User is typing
- `user_stop_typing` - User stopped typing
- `user_status_change` - User online status changed
- `message_reaction_added` - Reaction added to message
- `message_reaction_removed` - Reaction removed from message
- `messages_read` - Messages marked as read
- `joined_chat` - Successfully joined chat
- `left_chat` - Successfully left chat
- `error` - Error occurred

## Development

```bash
# Start development server with auto-reload
npm run dev

# Start production server
npm start
```

## Security Features

- JWT authentication with secure tokens
- Rate limiting (100 requests per 15 minutes per IP)
- CORS configuration
- Helmet security headers
- Input validation and sanitization
- MongoDB injection protection

## Database Models

- **User**: User accounts with roles, stats, and preferences
- **Story**: Dark stories with categories, tags, and engagement metrics
- **Chat**: Private and group chats with participants
- **Message**: Chat messages with reactions and read receipts
- **Comment**: Story comments with nested replies
- **Like**: Likes for stories and comments
- **Bookmark**: User bookmarks for stories
- **Category**: Story categories with metadata
