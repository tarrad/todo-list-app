/**
 * ControllerFactory implements the Factory pattern with Singleton controllers
 * This ensures we have exactly one instance of each controller type throughout the application
 */
class ControllerFactory {
  constructor() {
    // Singleton pattern for the factory itself
    if (ControllerFactory.instance) {
      return ControllerFactory.instance;
    }
    ControllerFactory.instance = this;
    // Map to store singleton instances of different controllers
    this._controllers = new Map();
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
   * @param {Object} userRepository - Repository for user operations
   * @returns {UserController} Singleton instance of UserController
   */
  createUserController(userRepository) {
    const UserController = require('../controllers/user.controller');
    return this.createController(UserController, { userRepository }, 'user');
  }

  /**
   * Creates or retrieves the singleton TaskController instance
   * @param {Object} taskRepository - Repository for task operations
   * @param {Object} socketService - Service for real-time updates
   * @returns {TaskController} Singleton instance of TaskController
   */
  createTaskController(taskRepository, socketService) {
    const TaskController = require('../controllers/task.controller');
    return this.createController(TaskController, { taskRepository, socketService }, 'task');
  }
}

// Export a singleton instance of the factory
module.exports = new ControllerFactory(); 