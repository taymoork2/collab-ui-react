import { UserTaskManagerService } from './user-task-manager.service';
import { TaskListFilterType, TaskType } from './user-task-manager.constants';
import { Notification } from 'modules/core/notifications';

interface ICounts {
  usersCreated: number;
  usersUpdated: number;
  usersFailed: number;
  totalUsers: number;
}

interface IStepStatus {
  endTime: string;
  exitCode: string;
  exitMessage: string;
  lastUpdated: string;
  name: string;
  percentComplete?: number;
  startTime: string;
  statusMessage: string;
  timeElapsed?: number;
  timeRemaining?: number;
}

export interface IJobExecutionStatus {
  createdTime: number;
  endTime: number;
  exitStatus: string;
  id: number;
  lastUpdatedTime: number;
  startTime: number;
  status: string;
}

export interface ITask {
  counts: ICounts;
  createdDate?: string;
  createdTime?: string;
  csvFile?: string;
  exactMatchCsv: boolean;
  exitCode?: number;
  exitMessage: string;
  exitStatus?: number;
  id: string;
  instanceId: number;
  jobExecutionStatus: IJobExecutionStatus[];
  jobType: string;
  jobTypeTranslate: string;
  lastUpdated?: string;
  latestExecutionStatus: string;
  percentComplete?: number;
  sourceCustomerId?: string;
  sourceUserId?: string;
  startedDate?: string;
  startedTime?: string;
  statusMessage?: string;
  statusTranslate: string;
  stepStatuses: IStepStatus[];
  stoppedDate?: string;
  stoppedTime?: string;
  targetCustomerId: string;
  timeElapsed?: string;
  timeRemaining?: string;
}

export class UserTaskManagerModalCtrl implements ng.IComponentController {

  public activeTask?: ITask;
  public loading = false;
  public dismiss: Function;
  public allTaskList: ITask[] = [];
  public inProcessTaskList: ITask[] = [];
  public errorTaskList: ITask[] = [];
  public activeFilter: TaskListFilterType = TaskListFilterType.ALL;

  private fileData: string;
  private fileName: string;
  private fileChecksum: string;
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
      case TaskListFilterType.ERROR:
        return this.errorTaskList;
    }
  }

  public setActiveTask(taskSelection: ITask): void {
    this.activeTask = taskSelection;
    this.UserTaskManagerService.setActiveTask(this.activeTask);
  }

  public dismissModal(): void {
    this.dismiss();
  }

  public updateActiveTaskStatus(status: string) {
    if (!this.activeTask) {
      return;
    }

    const task = this.getTaskById(this.activeTask.id);
    if (!task) {
      return;
    }

    task.latestExecutionStatus = status;
    this.populateTaskStatusTranslate(task);
  }

  private initActives() {
    this.setActiveTask(_.get<ITask>(this.$stateParams, 'task', undefined));
    this.requestedTaskId = _.get(this.activeTask, 'id');
    this.fileName = _.get<string>(this.$stateParams, 'job.fileName', undefined);
    this.fileData = _.get<string>(this.$stateParams, 'job.fileData', undefined);
    this.fileChecksum = _.get<string>(this.$stateParams, 'job.fileChecksum', undefined);
    this.exactMatchCsv = _.get<boolean>(this.$stateParams, 'job.exactMatchCsv', undefined);
    this.activeFilter = !_.isUndefined(this.activeTask) || !_.isUndefined(this.fileName) ? TaskListFilterType.ACTIVE : TaskListFilterType.ALL;
  }

  private importTask(): ng.IPromise<any> {
    if (_.isUndefined(this.fileName) || !_.isUndefined(this.activeTask)) {
      return this.$q.resolve();
    }

    return this.UserTaskManagerService.submitCsvImportTask(this.fileName, this.fileData, this.fileChecksum, this.exactMatchCsv)
      .then(importedTask => {
        this.setActiveTask(importedTask);
        this.requestedTaskId = importedTask.id;
      })
      .catch(response => {
        // Batch process supports only one running job per customer
        if (response.status === 409 && response.data.errorCode === 1001004) {
          this.Notification.error('userTaskManagerModal.anotherJobIsRunning');
        } else {
          this.Notification.errorResponse(response);
        }
      });
  }

  private intervalCallback = (tasks: ITask[] = []) => {
    this.populateTaskListData(tasks);
    this.allTaskList = tasks;

    this.inProcessTaskList = this.filterInProcessTaskList(tasks);
    this.errorTaskList = this.filterErrorTaskList(tasks);
    this.initSelectedTask();
    this.loading = false;
  }

  private intervalFailureCallback = (response) => {
    this.Notification.errorResponse(response);
    this.dismissModal();
  }

  private initPolling() {
    this.UserTaskManagerService.initAllTaskListPolling(this.intervalCallback, this.$scope, this.intervalFailureCallback);
  }

  public setActiveFilter(activeFilter: TaskListFilterType): void {
    this.activeFilter = activeFilter;

    this.initSelectedTask();
  }

  private initSelectedTask() {
    if (_.some(this.taskList, (task) => task.id === _.get(this.activeTask, 'id'))) {
      return;
    }

    this.setActiveTask(this.taskList[0]);
  }

  private getTaskById(id: string): ITask | undefined {
    return _.find(this.taskList, { id });
  }

  private filterErrorTaskList(tasks: ITask[]) {
    return _.filter(tasks, task => {
      return this.UserTaskManagerService.isTaskError(task);
    });
  }

  private filterInProcessTaskList(tasks: ITask[]) {
    const filteredTasks = _.filter(tasks, task => {
      return this.UserTaskManagerService.isTaskPending(task.latestExecutionStatus);
    });

    // If we have a requested task, sort it to the top of the list or add it first
    if (this.requestedTaskId) {
      const requestedTask = _.find(tasks, { id: this.requestedTaskId });
      if (requestedTask) {
        if (_.includes(filteredTasks, requestedTask)) {
          filteredTasks.sort((aTask, bTask) => {
            if (aTask.id === this.requestedTaskId) {
              return -1;
            }
            if (bTask.id === this.requestedTaskId) {
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
    task.statusTranslate = this.UserTaskManagerService.getTaskStatusTranslate(task);
  }

  private populateTaskJobType(task: ITask) {
    switch (task.jobType) {
      case TaskType.USERONBOARD:
        task.jobTypeTranslate = this.$translate.instant('userTaskManagerModal.csvImport');
        break;
    }
  }

  private populateTaskDatesAndTime(task: ITask) {
    const jobStatuses: IJobExecutionStatus[] = _.sortBy(task.jobExecutionStatus, status => status.id);
    const mostRecent = _.last(jobStatuses);

    // Get original createdTime
    if (jobStatuses[0].createdTime) {
      const { date, time } = this.UserTaskManagerService.getDateAndTime(jobStatuses[0].createdTime);
      task.createdDate = date;
      task.createdTime = time;
    }

    // Get most recent start/end time for the job, for cases where the job was finished/aborted and then re-run later
    if (mostRecent.startTime) {
      const { date, time } = this.UserTaskManagerService.getDateAndTime(mostRecent.startTime);
      task.startedDate = date;
      task.startedTime = time;
    }
    if (mostRecent.endTime) {
      const { date, time } = this.UserTaskManagerService.getDateAndTime(mostRecent.endTime);
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
