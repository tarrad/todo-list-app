const TaskDTO = require('../dtos/task.dto');

class SocketService {
  constructor() {
    if (SocketService.instance) {
      return SocketService.instance;
    }
    SocketService.instance = this;
  }

  static getInstance() {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  initialize(io) {
    this._io = io;
  }

  emitTaskCreated(task, userId) {
    const taskDTO = TaskDTO.fromTask(task);
    this._io.emit('taskCreated', { 
      task: taskDTO,
      userId: userId
    });
  }

  emitTaskUpdated(task, userId) {
    const taskDTO = TaskDTO.fromTask(task);
    this._io.emit('taskUpdated', { 
      task: taskDTO,
      userId: userId
    });
  }

  emitTaskDeleted(taskId, userId) {
    this._io.emit('taskDeleted', { 
      taskId,
      userId
    });
  }


}

module.exports = SocketService.getInstance(); 