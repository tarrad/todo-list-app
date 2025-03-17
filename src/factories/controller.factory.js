class ControllerFactory {
  constructor() {
    if (ControllerFactory.instance) {
      return ControllerFactory.instance;
    }
    ControllerFactory.instance = this;
  }

  createController(ControllerClass, dependencies) {
    return new ControllerClass(dependencies);
  }

  createUserController(userRepository) {
    const UserController = require('../controllers/user.controller');
    return this.createController(UserController, { userRepository });
  }

  createTaskController(taskRepository, socketService) {
    const TaskController = require('../controllers/task.controller');
    return this.createController(TaskController, { taskRepository, socketService });
  }
}

// Export a singleton instance
module.exports = new ControllerFactory(); 