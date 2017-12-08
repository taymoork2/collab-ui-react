import './task-list.scss';
import { ITask } from '../user-task-manager.component';

export class TaskListController implements ng.IComponentController {
  public taskList: ITask[];
  public onActiveTaskChange: Function;

  private activeTask;

  /* @ngInject */
  constructor(
  ) {}

  public $onChanges(changes: ng.IOnChangesObject) {
    if (changes.task) {
      this.activeTask = changes.task.currentValue;
    }
  }

  public setActiveTask(task) {
    this.activeTask = task;
    this.onActiveTaskChange({
      task,
    });
  }

  public isActiveTask(task): boolean {
    if (_.isUndefined(this.activeTask) || _.isUndefined(task)) {
      return false;
    }
    return this.activeTask.jobInstanceId === task.jobInstanceId;
  }
}

export class TaskListComponent implements ng.IComponentOptions {
  public controller = TaskListController;
  public template = require('./task-list.html');
  public bindings = {
    task: '<',
    taskList: '<',
    onActiveTaskChange: '&',
  };
}
