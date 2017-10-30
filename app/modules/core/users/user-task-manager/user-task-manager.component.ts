import { UserTaskManagerService } from './user-task-manager.service';
import { TaskListFilterType } from './task-list-filter/task-list-filter.component';
import { Notification } from 'modules/core/notifications';

export interface ITask {
  jobInstanceId: string;
  created: string;
  started: string;
  lastModified: string;
  stopped: string;
  creatorUserId: string;
  modifierUserId: string;
  status: string;
  message: string;
  filename: string;
  fileSize: number;
  fileMd5: string;
  totalUsers: number;
  addedUsers: number;
  updatedUsers: number;
  erroredUsers: number;
}


export enum TaskStatus {
  CREATED = 'CREATED',
  STARTING = 'STARTING',
  STARTED = 'STARTED',
  STOPPING = 'STOPPING',
  STOPPED = 'STOPPED',
  STOPPED_FOR_MAINTENANCE = 'STOPPED_FOR_MAINTENANCE',
  COMPLETED = 'COMPLETED',
  COMPLETED_WITH_ERRORS = 'COMPLETED_WITH_ERRORS',
  FAILED = 'FAILED',
  ABANDONED = 'ABANDONED',
}

export class UserTaskManagerModalCtrl implements ng.IComponentController {

  public activeTask?: ITask;
  public loading = false;
  public dismiss: Function;
  public allTaskList: ITask[] = [];
  public inProcessTaskList: ITask[] = [];
  public activeFilter: TaskListFilterType = TaskListFilterType.ALL;

  /* @ngInject */
  constructor(
    private $stateParams,
    private Notification: Notification,
    private UserTaskManagerService: UserTaskManagerService,
  ) {}

  public $onInit(): ng.IPromise<any> {
    this.loading = true;
    this.initActives();
    return this.fetchTasks()
      .finally(() => this.loading = false);
  }

  public setActiveFilter(activeFilter: TaskListFilterType): void {
    this.activeFilter = activeFilter;
    this.activeTask = this.taskList[0];
  }

  public get taskList() {
    switch (this.activeFilter) {
      case TaskListFilterType.ALL:
        return this.allTaskList;
      case TaskListFilterType.ACTIVE:
        return this.inProcessTaskList;
    }
  }

  public setActiveTask(taskSelection: ITask): void {
    this.activeTask = taskSelection;
    // TODO: Stop polling the previous task and
    // start polling data for this task
  }

  public dismissModal(): void {
    this.dismiss();
  }

  private initActives() {
    this.activeTask = _.get<ITask>(this.$stateParams, 'task', undefined);
    this.activeFilter = _.isUndefined(this.activeTask) ? TaskListFilterType.ALL : TaskListFilterType.ACTIVE;
  }

  private fetchTasks(): ng.IPromise<any> {
    // Get all tasks and identify tasks
    return this.UserTaskManagerService.getTasks()
      .then(tasks => {
        this.allTaskList = tasks;
        this.inProcessTaskList = this.filterInProcessTasks(tasks);
        if (!this.activeTask) {
          this.activeTask = this.taskList[0];
        }
      }).catch(response => this.Notification.errorResponse(response, 'userTaskManagerModal.getTaskListError'));
  }

  private filterInProcessTasks(taskList: ITask[]) {
    return _.filter(taskList, task => _.includes([TaskStatus.STARTING, TaskStatus.STARTED], task.status));
  }
}

export class UserTaskManagerModalComponent implements ng.IComponentOptions {
  public controller = UserTaskManagerModalCtrl;
  public template = require('./user-task-manager.html');
  public bindings = {
    dismiss: '&',
  };
}
