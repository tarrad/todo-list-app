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

  emitTaskCreated(task) {
    const taskDTO = TaskDTO.fromTask(task);
    this._io.emit('taskCreated', { 
      task: taskDTO,
      userId: task.userId
    });
  }

  emitTaskUpdated(task) {
    const taskDTO = TaskDTO.fromTask(task);
    this._io.emit('taskUpdated', { 
      task: taskDTO,
      userId: task.lockedBy
    });
  }

  emitTaskDeleted(taskId, userId) {
    this._io.emit('taskDeleted', { 
      taskId,
      userId
    });
  }

  emitTaskLocked(taskId, userId) {
    this._io.emit('taskLocked', { 
      taskId,
      userId
    });
  }

  emitTaskUnlocked(taskId, userId) {
    this._io.emit('taskUnlocked', { 
      taskId,
      userId
    });
  }
}

module.exports = SocketService.getInstance(); 