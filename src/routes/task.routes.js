const express = require('express');
const controllerFactory = require('../factories/controller.factory');
const { authenticateToken } = require('../middleware/auth.middleware');

function createTaskRoutes(taskRepository, socketService) {
  const router = express.Router();
  const taskController = controllerFactory.createTaskController(taskRepository, socketService);

  // Apply auth middleware to all routes
  router.use(authenticateToken);

  // Task routes
  router.get('/', taskController.getAllTasks.bind(taskController));
  router.post('/', taskController.createTask.bind(taskController));
  router.put('/:id', taskController.updateTask.bind(taskController));
  router.delete('/:id', taskController.deleteTask.bind(taskController));

  return router;
}

module.exports = createTaskRoutes; 