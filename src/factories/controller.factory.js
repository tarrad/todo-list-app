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
    // Singleton pattern for the factory itself
    if (ControllerFactory.instance) {
      return ControllerFactory.instance;
    }
    ControllerFactory.instance = this;
    this._controllers = new Map();
  }

  static getInstance() {
    if (!ControllerFactory.instance) {
      ControllerFactory.instance = new ControllerFactory();
    }
    return ControllerFactory.instance;
  }

  /**
   * Creates or retrieves a singleton instance of a controller
   * @param {Function} ControllerClass - The controller class to instantiate
   * @param {Object} dependencies - Dependencies to inject into the controller
   * @param {string} key - Unique key to identify the controller type
   * @returns {Object} Singleton instance of the controller
   */
  createController(ControllerClass, dependencies, key) {
    // Return existing instance if it exists, otherwise create a new one
    if (!this._controllers.has(key)) {
      this._controllers.set(key, new ControllerClass(dependencies));
    }
    return this._controllers.get(key);
  }

  /**
   * Creates or retrieves the singleton UserController instance
   * @returns {UserController} Singleton instance of UserController
   */
  createUserController() {
    return this.createController(UserController, userService, 'user');
  }

  /**
   * Creates or retrieves the singleton TaskController instance
   * @returns {TaskController} Singleton instance of TaskController
   */
  createTaskController() {
    return this.createController(TaskController, taskService, 'task');
  }
}

// Export a singleton instance of the factory
module.exports = ControllerFactory.getInstance();