import { UserTaskManagerService } from './user-task-manager.service';
import { TaskListFilterType, TaskType, TaskStatus } from './user-task-manager.constants';
import { Notification } from 'modules/core/notifications';

export interface ITask {
  jobInstanceId: string;
  jobType: string;
  jobTypeTranslate: string;
  created: string;
  createdDate: string;
  createdTime: string;
  started: string;
  startedDate: string;
  startedTime: string;
  lastModified: string;
  stopped: string;
  stoppedDate: string;
  stoppedTime: string;
  creatorUserId: string;
  modifierUserId: string;
  status: string;
  statusTranslate: string;
  message: string;
  filename: string;
  fileSize: number;
  fileMd5: string;
  totalUsers: number;
  addedUsers: number;
  updatedUsers: number;
  erroredUsers: number;
}

export class UserTaskManagerModalCtrl implements ng.IComponentController {

  public activeTask?: ITask;
  public loading = false;
  public dismiss: Function;
  public allTaskList: ITask[] = [];
  public inProcessTaskList: ITask[] = [];
  public activeFilter: TaskListFilterType = TaskListFilterType.ALL;

  private fileData: string;
  private fileName: string;
  private exactMatchCsv = false;
  private requestedTaskId?: string;

  /* @ngInject */
  constructor(
    private $scope: ng.IScope,
    private $stateParams,
    private Notification: Notification,
    private UserTaskManagerService: UserTaskManagerService,
    private $q: ng.IQService,
    private $translate: ng.translate.ITranslateService,
  ) {}

  public $onInit(): ng.IPromise<any> {
    this.loading = true;
    this.initActives();
    return this.importTask()
      .then(() => this.initPolling());
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
  }

  public dismissModal(): void {
    this.dismiss();
  }

  public updateActiveTaskStatus(status: string) {
    if (!this.activeTask) {
      return;
    }

    const task = this.getTaskById(this.activeTask.jobInstanceId);
    if (!task) {
      return;
    }

    task.status = status;
    this.populateTaskStatusTranslate(task);
  }

  private initActives() {
    this.activeTask = _.get<ITask>(this.$stateParams, 'task', undefined);
    this.requestedTaskId = _.get(this.activeTask, 'jobInstanceId');
    this.fileName = _.get<string>(this.$stateParams, 'job.fileName', undefined);
    this.fileData = _.get<string>(this.$stateParams, 'job.fileData', undefined);
    this.exactMatchCsv = _.get<boolean>(this.$stateParams, 'job.exactMatchCsv', undefined);
    this.activeFilter = !_.isUndefined(this.activeTask) || !_.isUndefined(this.fileName) ? TaskListFilterType.ACTIVE : TaskListFilterType.ALL;
  }

  private importTask(): ng.IPromise<any> {
    if (_.isUndefined(this.fileName) || !_.isUndefined(this.activeTask)) {
      return this.$q.resolve();
    }

    return this.UserTaskManagerService.submitCsvImportTask(this.fileName, this.fileData, this.exactMatchCsv)
      .then(importedTask => {
        this.activeTask = importedTask;
        this.requestedTaskId = importedTask.jobInstanceId;
      })
      .catch(response => this.Notification.errorResponse(response, 'userTaskManagerModal.submitCsvError'));
  }

  private intervalCallback = (tasks: ITask[] = []) => {
    this.populateTaskListData(tasks);
    this.allTaskList = tasks;
    this.inProcessTaskList = this.filterInProcessTaskList(tasks);
    this.initSelectedTask();
    this.loading = false;
  }

  private initPolling() {
    this.UserTaskManagerService.initAllTaskListPolling(this.intervalCallback, this.$scope);
  }

  public setActiveFilter(activeFilter: TaskListFilterType): void {
    this.activeFilter = activeFilter;

    this.initSelectedTask();
  }

  private initSelectedTask() {
    if (_.some(this.taskList, (task) => task.jobInstanceId === _.get(this.activeTask, 'jobInstanceId'))) {
      return;
    }

    this.activeTask = this.taskList[0];
  }

  private getTaskById(jobInstanceId: string): ITask | undefined {
    return _.find(this.taskList, { jobInstanceId });
  }

  private filterInProcessTaskList(tasks: ITask[]) {
    const filteredTasks = _.filter(tasks, task => {
      return this.UserTaskManagerService.isTaskPending(task.status);
    });

    // If we have a requested task, sort it to the top of the list or add it first
    if (this.requestedTaskId) {
      const requestedTask = _.find(tasks, { jobInstanceId: this.requestedTaskId });
      if (requestedTask) {
        if (_.includes(filteredTasks, requestedTask)) {
          filteredTasks.sort((aTask, bTask) => {
            if (aTask.jobInstanceId === this.requestedTaskId) {
              return -1;
            }
            if (bTask.jobInstanceId === this.requestedTaskId) {
              return 1;
            }
            return 0;
          });
        } else {
          filteredTasks.unshift(requestedTask);
        }
      }
    }

    return filteredTasks;
  }

  private populateTaskListData(taskList: ITask[]) {
    _.forEach(taskList, task => this.populateTaskData(task));
  }

  private populateTaskStatusTranslate(task: ITask) {
    switch (task.status) {
      case TaskStatus.CREATED:
        task.statusTranslate = this.$translate.instant('userTaskManagerModal.taskStatus.created');
        break;
      case TaskStatus.STARTED:
      case TaskStatus.STARTING:
      case TaskStatus.STOPPING:
        task.statusTranslate = this.$translate.instant('userTaskManagerModal.taskStatus.processing');
        break;
      case TaskStatus.ABANDONED:
        task.statusTranslate = this.$translate.instant('userTaskManagerModal.taskStatus.canceled');
        break;
      case TaskStatus.COMPLETED:
        task.statusTranslate = this.$translate.instant('userTaskManagerModal.taskStatus.completed');
        break;
      case TaskStatus.COMPLETED_WITH_ERRORS:
        task.statusTranslate = this.$translate.instant('userTaskManagerModal.taskStatus.completedWithErrors');
        break;
      case TaskStatus.FAILED:
        task.statusTranslate = this.$translate.instant('userTaskManagerModal.taskStatus.failed');
        break;
      case TaskStatus.STOPPED:
        task.statusTranslate = this.$translate.instant('userTaskManagerModal.taskStatus.stopped');
        break;
      case TaskStatus.STOPPED_FOR_MAINTENANCE:
        task.statusTranslate = this.$translate.instant('userTaskManagerModal.taskStatus.stoppedForMaintenance');
        break;
    }
  }

  private populateTaskJobType(task: ITask) {
    switch (task.jobType) {
      case TaskType.USERONBOARD:
        task.jobTypeTranslate = this.$translate.instant('userTaskManagerModal.csvImport');
        break;
    }
  }

  private populateTaskDatesAndTime(task: ITask) {
    if (task.created) {
      const { date, time } = this.UserTaskManagerService.getDateAndTime(task.created);
      task.createdDate = date;
      task.createdTime = time;
    }
    if (task.started) {
      const { date, time } = this.UserTaskManagerService.getDateAndTime(task.started);
      task.startedDate = date;
      task.startedTime = time;
    }
    if (task.stopped) {
      const { date, time } = this.UserTaskManagerService.getDateAndTime(task.started);
      task.stoppedDate = date;
      task.stoppedTime = time;
    }
  }

  private populateTaskData(task: ITask) {
    this.populateTaskJobType(task);
    this.populateTaskStatusTranslate(task);
    this.populateTaskDatesAndTime(task);
  }
}

export class UserTaskManagerModalComponent implements ng.IComponentOptions {
  public controller = UserTaskManagerModalCtrl;
  public template = require('./user-task-manager.html');
  public bindings = {
    dismiss: '&',
  };
}
