import './task-list-item.scss';

export class TaskListItemComponent implements ng.IComponentOptions {
  public template = require('./task-list-item.html');
  public bindings = {
    task: '<',
    isActiveTask: '<',
    isTaskInProcess: '<',
    isTaskError: '<',
    isTaskCanceled: '<',
  };
}
