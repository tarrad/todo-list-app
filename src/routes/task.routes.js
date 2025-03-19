const express = require('express');
const controllerFactory = require('../factories/controller.factory');
const { authMiddleware } = require('../middleware/auth.middleware');

const router = express.Router();
const taskController = controllerFactory.taskController;

// Apply auth middleware to all routes
router.use(authMiddleware);

// Task routes
router.get('/', taskController.getTasks.bind(taskController));
router.post('/', taskController.createTask.bind(taskController));
router.put('/:id', taskController.updateTask.bind(taskController));
router.delete('/:id', taskController.deleteTask.bind(taskController));

module.exports = router;