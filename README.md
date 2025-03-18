# Todo List Application

A real-time todo list application built with Node.js, Express, MongoDB, and Redis. Features concurrent task editing with optimistic locking and real-time updates using Socket.IO.

## Features

- Real-time task updates using Socket.IO
- Concurrent task editing with optimistic locking
- Redis-based locking mechanism
- MongoDB for persistent storage
- JWT-based authentication
- RESTful API design
- Clean architecture with separation of concerns
- Factory pattern for dependency injection
- Singleton pattern for efficient resource management

## Tech Stack

- Node.js
- Express
- MongoDB
- Redis
- Socket.IO
- JWT for authentication

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Redis
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/tarrad/todo-list-app.git
cd todo-list-app
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
MONGODB_URI=your_mongodb_uri
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your_jwt_secret
PORT=3000
```

4. Start the application:
```bash
npm start
```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login user

### Tasks
- GET `/api/tasks` - Get all tasks
- POST `/api/tasks` - Create a new task
- PUT `/api/tasks/:id` - Update a task
- DELETE `/api/tasks/:id` - Delete a task

## Architecture

The application follows a clean architecture pattern with:
- Controllers (Request handling)
- Services (Business logic)
- Repositories (Data access)
- DTOs (Data transfer objects)
- Infrastructure (External services)

### Key Design Patterns
- Factory Pattern for dependency injection
- Singleton Pattern for resource management
- Repository Pattern for data access
- DTO Pattern for data transfer

### Real-time Features
- Socket.IO for live updates
- Redis for distributed locking
- Optimistic locking for concurrent edits

## License

MIT 