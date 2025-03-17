const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  completed: {
    type: Boolean,
    default: false
  },
  dueDate: {
    type: Date
  },
  lockedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lockTimeout: {
    type: Date
  },
  version: {
    type: Number,
    default: 1
  }
}, {
  timestamps: true
});

// Index for faster queries
taskSchema.index({ lockTimeout: 1 });

// Method to check if lock is expired
taskSchema.methods.isLockExpired = function() {
  return this.lockTimeout && this.lockTimeout < new Date();
};

const Task = mongoose.model('Task', taskSchema);

module.exports = Task; 