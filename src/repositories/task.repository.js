const Task = require('../models/task.model');

class TaskRepository {
  constructor() {
    this._model = Task;
  }

  async findAllTasks() {
    return this._model.find({});
  }

  async findById(id) {
    return this._model.findById(id);
  }

  async create(taskData) {
    const task = new this._model(taskData);
    return task.save();
  }

  async update(taskId, updateData) {
    return this._model.findOneAndUpdate(
      { _id: taskId },
      { $set: updateData },
      { new: true }
    );
  }

  async delete(taskId) {
    return this._model.findOneAndDelete({ _id: taskId });
  }
}

// Export a singleton instance
module.exports = new TaskRepository(); 