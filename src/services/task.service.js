const taskRepository = require('../repositories/task.repository');
const socketService = require('./socket.service');

class TaskService {
  constructor() {
    if (TaskService.instance) {
      return TaskService.instance;
    }
    TaskService.instance = this;
  }

  static getInstance() {
    if (!TaskService.instance) {
      TaskService.instance = new TaskService();
    }
    return TaskService.instance;
  }

  async createTask(taskData) {
    const task = await taskRepository.createTask(taskData);
    socketService.emitTaskCreated(task, taskData.userId);
    return task;
  }

  async getTasks() {
    return await taskRepository.getTasks();
  }

  async updateTask(taskId, userId, updateData) {
    let lockAcquired = false;
    try {
      // Try to acquire lock first
      lockAcquired = await taskRepository.acquireLock(taskId, userId);
      if (!lockAcquired) {
        throw new Error('Task is locked by another user');
      }

      // Update the task (lock will be released automatically)
      const task = await taskRepository.updateTask(taskId, userId, updateData);
      socketService.emitTaskUpdated(task,userId);
      return task;
    } catch (error) {
      // Only release lock if we acquired it and an error occurred
      if (lockAcquired) {
        await taskRepository.releaseLock(taskId, userId);
      }
      throw error;
    }
  }

  async deleteTask(taskId, userId) {
    let lockAcquired = false;
    try {
      // Try to acquire lock first
      lockAcquired = await taskRepository.acquireLock(taskId, userId);
      if (!lockAcquired) {
        throw new Error('Task is locked by another user');
      }

      // Delete the task (lock will be released automatically)
      const task = await taskRepository.deleteTask(taskId, userId);
      socketService.emitTaskDeleted(taskId);
      return task;
    } catch (error) {
      // Only release lock if we acquired it and an error occurred
      if (lockAcquired) {
        await taskRepository.releaseLock(taskId, userId);
      }
      throw error;
    }
  }
}

module.exports = TaskService.getInstance(); 