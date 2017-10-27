import './task-list.scss';
import { ITask } from '../user-task-manager.component';
import { UserTaskManagerService } from '../user-task-manager.service';

class TaskListController implements ng.IComponentController {
  public taskList: ITask[];
  public onActiveTaskChange: Function;

  private activeTask;

  /* @ngInject */
  constructor(
    private UserTaskManagerService: UserTaskManagerService,
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

  public isTaskInProcess(task: ITask) {
    if (!_.isUndefined(task)) {
      return this.UserTaskManagerService.isTaskInProcess(task.status);
    } else {
      return false;
    }
  }

  public isTaskError(task: ITask) {
    if (!_.isUndefined(task)) {
      return this.UserTaskManagerService.isTaskError(task.status);
    } else {
      return false;
    }
  }

  public isTaskCanceled(task: ITask) {
    if (!_.isUndefined(task)) {
      return this.UserTaskManagerService.isTaskCanceled(task.status);
    } else {
      return false;
    }
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
