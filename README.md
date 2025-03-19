# Todo List App

A simple todo list application built with Node.js, Express, MongoDB, and Socket.IO. This app lets users create, update, and delete tasks with real-time updates.



## How to Run

1. Install dependencies:
npm install
```

2. Create a `.env` file in the root directory with:
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/todo-list-app
JWT_SECRET=wt_secret
JWT_EXPIRES_IN=24h
```

3. Start the server:

npm start
```

## How the Locking System Works

The app uses MongoDB's atomic operations to prevent race conditions when multiple users try to edit the same task. Here's how it works:

1. Database-Level Protection:
   - MongoDB uses atomic operations that are guaranteed to be executed in order
   - When we update a task, we use `findOneAndUpdate` which is atomic
   - This means no two users can modify the same task at the exact same time
   - The database handles the locking internally, making it very reliable

2. How Atomic Operations Work:
   - When User A tries to edit a task:
     ```javascript
     
     Using findOneAndUpdate
     ```
   - If User B tries to edit the same task at the same time:
     - MongoDB will process one request first
     - The second request will fail because the `lockedBy` field is no longer `null`
     - This prevents any race conditions at the database level

3. Lock Storage:
   - Each task has a `lockedBy` field in the database
   - This field stores the ID of the user who has the lock
   - When no one is editing, this field is `null`
   - The database ensures only one user can set this field at a time

4. Lock Release:
   - Locks are released when:
     - The user finishes editing the task
     - The user cancels the edit
     - The server restarts (all locks are reset)
   - The release is also an atomic operation:
     ```javascript
     // This is also atomic - safe from race conditions
     Using findOneAndUpdate
     ```


## Altenative

 - We can use Redis as the gatekeeper for managing locks, which is highly recommended in distributed systems or server environments.


## API Endpoints

### Auth
- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login user

### Tasks
- GET `/api/tasks` - Get all tasks
- POST `/api/tasks` - Create a new task
- PUT `/api/tasks/:id` - Update a task
- DELETE `/api/tasks/:id` - Delete a task

## WebSocket Events

The app uses WebSocket for real-time updates:
- `taskCreated` - When a new task is created
- `taskUpdated` - When a task is updated
- `taskDeleted` - When a task is deleted


