const TaskDTO = require('../dtos/task.dto');

class TaskController {
  constructor(taskService) {
    if (TaskController.instance) {
      return TaskController.instance;
    }
    TaskController.instance = this;
    this._taskService = taskService;
  }

  static getInstance(taskService) {
    if (!TaskController.instance) {
      TaskController.instance = new TaskController(taskService);
    }
    return TaskController.instance;
  }

  async getTasks(req, res) {
    try {
      const tasks = await this._taskService.getTasks();
      const taskDTOs = TaskDTO.fromTasks(tasks);
      res.json(taskDTOs);
    } catch (error) {
      console.error('Error getting tasks:', error);
      res.status(500).json({ error: 'Failed to get tasks' });
    }
  }

  async createTask(req, res) {
    try {
      console.log("creeate task body : " + req.body);
      console.log( req.body);
      console.log("creeate task body : end " );
      const task = await this._taskService.createTask(req.body);
      const taskDTO = TaskDTO.fromTask(task);
      res.status(201).json(taskDTO);
    } catch (error) {
      console.error('Error creating task:', error);
      res.status(500).json({ error: 'Failed to create task' });
    }
  }

  async updateTask(req, res) {
    try {
      console.log("update task body : " + req.body);
      console.log( req.body);
      console.log("update task body : end " );
      const task = await this._taskService.updateTask(
        req.params.id,
        req.user.id,
        req.body
      );
      if (!task) {
        return res.status(404).json({ error: 'Task not found' });
      }
      const taskDTO = TaskDTO.fromTask(task);
      res.json(taskDTO);
    } catch (error) {
      console.error('Error updating task:', error);
      if (error.message === 'Task is locked by another user') {
        return res.status(409).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to update task' });
    }
  }

  async deleteTask(req, res) {
    try {
      await this._taskService.deleteTask(req.params.id, req.user.id);
      res.json({ message: 'Task deleted successfully' });
    } catch (error) {
      console.error('Error deleting task:', error);
      if (error.message === 'Task is locked by another user') {
        return res.status(409).json({ error: error.message });
      }
      res.status(500).json({ error: 'Failed to delete task' });
    }
  }
}

module.exports = TaskController; 