const taskRepository = require('../repositories/task.repository');
const lockingService = require('../services/locking.service');

class TaskService {
  constructor() {
    this._taskRepository = taskRepository;
    this._lockingService = lockingService;
  }

  async getAllTasks() {
    return this._taskRepository.findAllTasks();
  }

  async createTask(taskData) {
    return this._taskRepository.create(taskData);
  }

  async updateTask(taskId, updateData, userId) {
    // Try to acquire lock first
    const lockAcquired = await this._lockingService.acquireLock(taskId, userId);
    if (!lockAcquired) {
      throw new Error('Task is locked by another user');
    }

    try {
      // Get current task for version check
      const currentTask = await this._taskRepository.findById(taskId);
      if (!currentTask) {
        await this._lockingService.releaseLock(taskId, userId);
        return null;
      }

      // Update with version check
      const updatedTask = await this._taskRepository.update(
        taskId,
        {
          ...updateData,
          version: currentTask.version + 1
        }
      );

      if (!updatedTask) {
        await this._lockingService.releaseLock(taskId, userId);
        throw new Error('Failed to update task - version mismatch');
      }

      // Release lock after successful update
      await this._lockingService.releaseLock(taskId, userId);
      return updatedTask;
    } catch (error) {
      // Ensure lock is released in case of any error
      await this._lockingService.releaseLock(taskId, userId);
      throw error;
    }
  }

  async deleteTask(taskId, userId) {
    // Try to acquire lock first
    const lockAcquired = await this._lockingService.acquireLock(taskId, userId);
    if (!lockAcquired) {
      throw new Error('Task is locked by another user');
    }

    try {
      const result = await this._taskRepository.delete(taskId);
      if (!result) {
        await this._lockingService.releaseLock(taskId, userId);
        return null;
      }
      // Release lock after successful delete
      await this._lockingService.releaseLock(taskId, userId);
      return result;
    } catch (error) {
      // Ensure lock is released in case of any error
      await this._lockingService.releaseLock(taskId, userId);
      throw error;
    }
  }

  async isTaskLocked(id) {
    return this._lockingService.isLocked(id);
  }
}

// Export a singleton instance
module.exports = new TaskService(); 