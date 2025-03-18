require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth.routes');
const taskRoutes = require('./routes/task.routes');
const { authenticateSocket } = require('./middleware/auth.middleware');
const socketService = require('./services/socket.service');
console.log('Starting server...');

// Create Express app
const app = express();
const server = http.createServer(app);
console.log('HTTP server created');

const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});
console.log('Socket.IO server created');

// Initialize socket service
socketService.initialize(io);
console.log('Socket service initialized');

// Middleware
app.use(cors());
app.use(express.json());


// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Socket.IO connection handling
io.use(authenticateSocket);

io.on('connection', (socket) => {
  console.log('Client connected:', socket.user.id);

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.user.id);
  });

  // Handle errors
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('WebSocket server is ready for connections');
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});