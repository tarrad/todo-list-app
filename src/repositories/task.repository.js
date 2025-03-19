const Task = require('../models/task.model');

class TaskRepository {
  constructor() {
    if (TaskRepository.instance) {
      return TaskRepository.instance;
    }
    TaskRepository.instance = this;
  }

  static getInstance() {
    if (!TaskRepository.instance) {
      TaskRepository.instance = new TaskRepository();
    }
    return TaskRepository.instance;
  }

  async resetAllLocks() {
    console.log('Resetting all task locks...');
    const result = await Task.updateMany(
      { lockedBy: { $ne: null } },
      { $set: { lockedBy: null } }
    );
    console.log(`Reset ${result.modifiedCount} locked tasks`);
    return result;
  }

  async createTask(taskData) {
    const task = new Task(taskData);
    return await task.save();
  }

  async getTasks() {
    return await Task.find({});
  }

  async getTaskById(taskId) {
    return await Task.findById(taskId);
  }

  async acquireLock(taskId, userId) {
    // Try to acquire lock using atomic operation
    console.log('Acquiring lock for user:', userId);
    const task = await Task.findOneAndUpdate(
      { 
        _id: taskId,
        $or: [
          { lockedBy: null },  // Task is not locked
          { lockedBy: userId } // Task is locked by the same user
        ]
      },
      { $set: { lockedBy: userId } },
      { new: true }
    );

    return task !== null;
  }

  async releaseLock(taskId, userId) {
    // Release lock using atomic operation
    const task = await Task.findOneAndUpdate(
      { 
        _id: taskId,
        lockedBy: userId  // Only the user who locked it can release it
      },
      { $set: { lockedBy: null } },
      { new: true }
    );

    return task !== null;
  }

  async updateTask(taskId, userId, updateData) {
    console.log('Update task called with:', { taskId, userId, updateData });
    
    // Update task and release lock in a single atomic operation
    const task = await Task.findOneAndUpdate(
      { 
        _id: taskId,
        lockedBy: userId  // Ensure task is locked by the same user
      },
      { 
        $set: { 
          ...updateData,
          lockedBy: null  // Release the lock
        }
      },
      { new: true, runValidators: true }
    );

    if (!task) {
      throw new Error('Task is not locked by you');
    }

    return task;
  }

  async deleteTask(taskId, userId) {
    // Delete task and release lock in a single atomic operation
    const task = await Task.findOneAndDelete({
      _id: taskId,
      lockedBy: userId  // Ensure task is locked by the same user
    });

    if (!task) {
      throw new Error('Task is not locked by you');
    }

    return task;
  }
}

module.exports = TaskRepository.getInstance(); 