const TaskDTO = require('../dtos/task.dto');

class SocketService {
  constructor() {
    this._io = null;
  }

  initialize(io) {
    this._io = io;
  }

  emit(event, data) {
    if (!this._io) {
      console.warn('Socket.IO not initialized');
      return;
    }
    this._io.emit(event, data);
  }

  to(socket) {
    if (!this._io) {
      console.warn('Socket.IO not initialized');
      return {
        emit: () => {}
      };
    }
    return {
      emit: (event, data) => socket.emit(event, data)
    };
  }

  // Task-specific events
  emitTaskLocked(taskId, userId) {
    this.emit('taskLocked', { taskId, userId });
  }

  emitTaskUnlocked(taskId) {
    this.emit('taskUnlocked', { taskId });
  }

  emitTaskDeleted(taskId) {
    this.emit('taskDeleted', { taskId });
  }

  emitTaskUpdated(task) {
    this.emit('taskUpdated', TaskDTO.fromTask(task));
  }

  emitTaskCreated(task) {
    this.emit('taskCreated', TaskDTO.fromTask(task));
  }
}

// Export a singleton instance
module.exports = new SocketService(); 