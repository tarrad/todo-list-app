const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  version: {
    type: Number,
    default: 0
  },
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