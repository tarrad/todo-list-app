# Real-time To-Do List Application

A real-time To-Do List application built with Node.js, Express, MongoDB, and Socket.IO. The application supports real-time updates, task locking for concurrent editing, and user authentication.

## Features

- Real-time updates using Socket.IO
- User authentication with JWT
- Task locking mechanism for concurrent editing
- RESTful API for CRUD operations
- MongoDB database integration
- Clean architecture with Repository pattern

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd todo-list-app
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/todo-list-app
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
```

4. Start MongoDB:
```bash
# Make sure MongoDB is running on your system
```

5. Start the application:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login user

### Tasks
- GET `/api/tasks` - Get all tasks for the authenticated user
- POST `/api/tasks` - Create a new task
- PUT `/api/tasks/:id` - Update a task
- DELETE `/api/tasks/:id` - Delete a task
- POST `/api/tasks/:id/lock` - Lock a task for editing
- POST `/api/tasks/:id/unlock` - Unlock a task

## Socket.IO Events

### Client to Server
- `startEdit` - Start editing a task
- `endEdit` - End editing a task

### Server to Client
- `taskCreated` - New task created
- `taskUpdated` - Task updated
- `taskDeleted` - Task deleted
- `taskLocked` - Task locked by another user
- `taskUnlocked` - Task unlocked

## Authentication

The application uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header for protected routes:

```
Authorization: Bearer <your-jwt-token>
```

For Socket.IO connections, include the token in the auth object:

```javascript
const socket = io('http://localhost:3000', {
  auth: {
    token: 'your-jwt-token'
  }
});
```

## Error Handling

The application includes proper error handling for:
- Authentication errors
- Task locking conflicts
- Invalid input data
- Database errors

## Security

- Passwords are hashed using bcrypt
- JWT tokens are used for authentication
- CORS is enabled for API access
- Input validation is implemented
- Task locking prevents concurrent editing conflicts

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request 