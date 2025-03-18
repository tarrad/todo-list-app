/**
 * ControllerFactory implements the Factory pattern with Singleton controllers
 * This ensures we have exactly one instance of each controller type throughout the application
 */
const TaskController = require('../controllers/task.controller');
const UserController = require('../controllers/user.controller');
const taskService = require('../services/task.service');
const userService = require('../services/user.service');


class ControllerFactory {
  static userController;
  static taskController;

  constructor() {
    this.userController = new UserController(userService);
    this.taskController = new TaskController(taskService);
  }
}

module.exports = new ControllerFactory();
