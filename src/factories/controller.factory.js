/**
 * ControllerFactory implements the Factory pattern with Singleton controllers
 * This ensures we have exactly one instance of each controller type throughout the application
 */
const TaskController = require('../controllers/task.controller');
const UserController = require('../controllers/user.controller');
const taskService = require('../services/task.service');
const userService = require('../services/user.service');

class ControllerFactory {
  constructor() {
    if (ControllerFactory.instance) {
      return ControllerFactory.instance;
    }
    ControllerFactory.instance = this;
  }

  static getInstance() {
    if (!ControllerFactory.instance) {
      ControllerFactory.instance = new ControllerFactory();
    }
    return ControllerFactory.instance;
  }

  get userController() {
    if (!this._userController) {
      this._userController = UserController.getInstance(userService);
    }
    return this._userController;
  }

  get taskController() {
    if (!this._taskController) {
      this._taskController = TaskController.getInstance(taskService);
    }
    return this._taskController;
  }
}

module.exports = ControllerFactory.getInstance();
