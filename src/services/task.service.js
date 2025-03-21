const taskRepository = require('../repositories/task.repository');
const socketService = require('../services/socket.service');

class TaskService {
  constructor() {
    if (TaskService.instance) {
      return TaskService.instance;
    }
    TaskService.instance = this;
    this._taskRepository = taskRepository;
    this._socketService = socketService;
  }

  static getInstance() {
    if (!TaskService.instance) {
      TaskService.instance = new TaskService();
    }
    return TaskService.instance;
  }

  async resetAllLocks() {
    const result = await this._taskRepository.resetAllLocks();
    return result;
  }

  async createTask(taskData) {
    const task = await this._taskRepository.createTask(taskData);
    this._socketService.emitTaskCreated(task, taskData.userId);
    return task;
  }

  async getTasks() {
    return await this._taskRepository.getTasks();
  }

  async getTaskById(taskId) {
    return await this._taskRepository.findById(taskId);
  }

  async updateTask(taskId, userId, updateData) {

    const task = await this._taskRepository.getTaskById(taskId);
    
    if (!task) {
      throw new Error('Task not found');
    }

    if (task.completed) {
      throw new Error('Cannot edit a completed task');
    }

    let lockAcquired = false;
    try {
      // Try to acquire lock first
      lockAcquired = await this._taskRepository.acquireLock(taskId, userId);
      if (!lockAcquired) {
        throw new Error('Task is locked by another user');
      }

      // Update the task (lock will be released automatically)
      const updatedTask = await this._taskRepository.updateTask(taskId, userId, updateData);
      this._socketService.emitTaskUpdated(updatedTask, userId);
      return updatedTask;
    } catch (error) {
      // Only release lock if we acquired it and an error occurred
      if (lockAcquired) {
        await this._taskRepository.releaseLock(taskId, userId);
      }
      throw error;
    }
  }

  async deleteTask(taskId, userId) {
    const task = await this._taskRepository.getTaskById(taskId);
    
    if (!task) {
      throw new Error('Task not found');
    }

    let lockAcquired = false;
    try {
      // Try to acquire lock first
      lockAcquired = await this._taskRepository.acquireLock(taskId, userId);
      if (!lockAcquired) {
        throw new Error('Task is locked by another user');
      }

      // Delete the task (lock will be released automatically)
      const deletedTask = await this._taskRepository.deleteTask(taskId, userId);
      this._socketService.emitTaskDeleted(taskId);
      return deletedTask;
    } catch (error) {
      // Only release lock if we acquired it and an error occurred
      if (lockAcquired) {
        await this._taskRepository.releaseLock(taskId, userId);
      }
      throw error;
    }
  }
}

module.exports = TaskService.getInstance(); 