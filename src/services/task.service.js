const taskRepository = require('../repositories/task.repository');
const lockingService = require('../services/locking.service');
const socketService = require('../services/socket.service');

class TaskService {
  constructor() {
    this._taskRepository = taskRepository;
    this._lockingService = lockingService;
    this._socketService = socketService;
  }

  async getAllTasks() {
    return this._taskRepository.findAllTasks();
  }

  async createTask(taskData) {
    const task = await this._taskRepository.create(taskData);
    this._socketService.emitTaskCreated(task);
    return task;
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

      // Notify all users that the task is locked
      this._socketService.emitTaskLocked(taskId, userId);

      // Update with version check
      const updatedTask = await this._taskRepository.update(
        taskId,
        {
          ...updateData,
          version: currentTask.version + 1
        }
      );

      await this._lockingService.releaseLock(taskId, userId);
      if (!updatedTask) {
        throw new Error('Failed to update task - version mismatch');
      }

    
      
 
      
      // Notify all users about the update
      this._socketService.emitTaskUpdated(updatedTask);
      
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
      // Notify all users that the task is locked for deletion
      this._socketService.emitTaskLocked(taskId, userId);

      const result = await this._taskRepository.delete(taskId);
      await this._lockingService.releaseLock(taskId, userId);
      if (!result) {
        return null;
      }
      
      // Notify all users that the task has been deleted
      this._socketService.emitTaskDeleted(taskId);
      
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