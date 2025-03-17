require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth.routes');
const createTaskRoutes = require('./routes/task.routes');
const { authenticateSocket } = require('./middleware/auth.middleware');
const TaskRepository = require('./repositories/task.repository');
const { TIME } = require('./config/constants');

// Create Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Create repositories
const taskRepository = new TaskRepository();

// Create Socket Service
const socketService = {
  emit: (event, data) => io.emit(event, data),
  to: (socket) => ({
    emit: (event, data) => socket.emit(event, data)
  })
};

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes with dependency injection
app.use('/api/auth', authRoutes);
app.use('/api/tasks', createTaskRoutes(taskRepository, socketService));

// Socket.IO connection handling
io.use(authenticateSocket);

// Store active tasks being edited
const activeEdits = new Map();

io.on('connection', (socket) => {
  console.log('Client connected:', socket.user.id);

  // Handle task edit lock
  socket.on('startEdit', async (taskId) => {
    try {
      const lockedTask = await taskRepository.lockTask(taskId, socket.user.id);
      if (lockedTask) {
        activeEdits.set(taskId, socket.user.id);
        socketService.emit('taskLocked', { taskId, userId: socket.user.id });
      }
    } catch (error) {
      socketService.to(socket).emit('error', { message: error.message });
    }
  });

 
  socket.on('endEdit', async (taskId) => {
    try {
      if (activeEdits.get(taskId) === socket.user.id) {
        const unlockedTask = await taskRepository.unlockTask(taskId, socket.user.id);
        if (unlockedTask) {
          activeEdits.delete(taskId);
          socketService.emit('taskUnlocked', { taskId });
        }
      }
    } catch (error) {
      socketService.to(socket).emit('error', { message: error.message });
    }
  });

  // Handle disconnection
  socket.on('disconnect', async () => {
    console.log('Client disconnected:', socket.user.id);
    
    // Clean up any locks held by this user
    for (const [taskId, userId] of activeEdits.entries()) {
      if (userId === socket.user.id) {
        try {
          await taskRepository.unlockTask(taskId, userId);
          activeEdits.delete(taskId);
          socketService.emit('taskUnlocked', { taskId });
        } catch (error) {
          console.error('Error unlocking task on disconnect:', error);
        }
      }
    }
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
}); 