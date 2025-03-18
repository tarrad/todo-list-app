const Task = require('../models/task.model');
const lockingService = require('../services/locking.service');

class TaskRepository {
  constructor() {
    this._model = Task;
    this.lockingService = lockingService;
  }

  async findAllTasks() {
    return this._model.find({});
  }

  async findById(id) {
    return this._model.findById(id);
  }

  async create(taskData) {
    const task = new this._model(taskData);
    return task.save();
  }

  async update(taskId, updateData, userId) {
    // First, get the current version of the task
    const currentTask = await this._model.findOne({ _id: taskId });
    if (!currentTask) {
      return null;
    }

    // Try to acquire lock first
    const lockAcquired = await this.lockingService.acquireLock(taskId, userId);
    if (!lockAcquired) {
      throw new Error('Task is locked by another user');
    }

    try {
      // Update with version check
      const updatedTask = await this._model.findOneAndUpdate(
        {
          _id: taskId,
          version: currentTask.version // Only update if version matches
        },
        {
          $set: {
            ...updateData,
            version: currentTask.version + 1 // Increment version
          }
        },
        { new: true }
      );

      if (!updatedTask) {
        // If update failed, release the lock
        await this.lockingService.releaseLock(taskId, userId);
        throw new Error('Failed to update task - version mismatch');
      }

      // Release the Redis lock after successful update
      await this.lockingService.releaseLock(taskId, userId);
      return updatedTask;
    } catch (error) {
      // Ensure lock is released in case of any error
      await this.lockingService.releaseLock(taskId, userId);
      throw error;
    }
  }

  async delete(taskId, userId) {
    // Try to acquire lock first
    const lockAcquired = await this.lockingService.acquireLock(taskId, userId);
    if (!lockAcquired) {
      throw new Error('Task is locked by another user');
    }

    try {
      const result = await this._model.findOneAndDelete({ _id: taskId });
      if (!result) {
        // If delete failed, release the lock
        await this.lockingService.releaseLock(taskId, userId);
        return null;
      }
      // Release the Redis lock after successful delete
      await this.lockingService.releaseLock(taskId, userId);
      return result;
    } catch (error) {
      // Ensure lock is released in case of any error
      await this.lockingService.releaseLock(taskId, userId);
      throw error;
    }
  }

  async isTaskLocked(id) {
    return this.lockingService.isLocked(id);
  }
}

// Export a singleton instance
module.exports = new TaskRepository(); 