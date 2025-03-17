class TaskDTO {
  constructor(task) {
    this.id = task._id;
    this.title = task.title;
    this.description = task.description;
    this.completed = task.completed;
    this.dueDate = task.dueDate;
  }

  static fromTask(task) {
    return new TaskDTO(task);
  }

  static fromTasks(tasks) {
    return tasks.map(task => TaskDTO.fromTask(task));
  }
}

module.exports = TaskDTO; 