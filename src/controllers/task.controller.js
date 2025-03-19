const TaskDTO = require('../dtos/task.dto');
const GenericResponseDTO =  require('../dtos/genericRes.dto');

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
      console.error(error);
      res.status(500).json(GenericResponseDTO.fromGeneric('Failed to get tasks', false));
    }
  }

  async createTask(req, res) {
    try {
      const task = await this._taskService.createTask({
        ...req.body,
        userId: req.user.userId
      });
      const taskDTO = TaskDTO.fromTask(task);
      res.json(taskDTO);
    } catch (error) {
      res.status(500).json(GenericResponseDTO.fromGeneric('Failed to create task', false));
    }
  }

  async updateTask(req, res) {
    try {  
      const task = await this._taskService.updateTask(
        req.params.id,
        req.user.userId,
        req.body
      );
      if (!task) {
        return res.status(404).json(GenericResponseDTO.fromGeneric('Task not found', false));
      }
      const taskDTO = TaskDTO.fromTask(task);
      res.json(taskDTO);
    } catch (error) {
      if (error.message === 'Task is locked by another user') {
        return res.status(409).json(GenericResponseDTO.fromGeneric(error.message, false));
      }
      if (error.message === 'Cannot edit a completed task') {
        return res.status(400).json(GenericResponseDTO.fromGeneric(error.message, false));
      }
      res.status(500).json(GenericResponseDTO.fromGeneric('Failed to update task', false));
    }
  }

  async deleteTask(req, res) {
    try {
      await this._taskService.deleteTask(req.params.id, req.user.userId);
      res.json(GenericResponseDTO.fromGeneric('Task deleted successfully', true));
    } catch (error) {
      console.error(error);
      if (error.message === 'Task is locked by another user') {
        return res.status(409).json(GenericResponseDTO.fromGeneric(error.message, false));
      }
      res.status(500).json(GenericResponseDTO.fromGeneric('Failed to delete task', false));
    }
  }
}

module.exports = TaskController; 