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
  private loadingError = false;
  public allTaskList: ITask[] = [];
  public inProcessTaskList: ITask[] = [];
  public activeFilter: TaskListFilterType = TaskListFilterType.ALL;
  public fileData: string;
  public fileName: string;
  public exactMatchCsv = false;
  private intervalPromise: ng.IPromise<void>;

  /* @ngInject */
  constructor(
    private $stateParams,
    private Notification: Notification,
    private UserTaskManagerService: UserTaskManagerService,
    private $q: ng.IQService,
    private $translate: ng.translate.ITranslateService,
    private $interval: ng.IIntervalService,
  ) {
  }

  public $onInit(): ng.IPromise<any> {

    this.loading = true;
    this.initActives();

    return this.init()
    .then(() => {
      return this.fetchTasks()
      .finally(() => {
        this.loading = false;
        if (!this.loadingError) {
          this.initPolling();
        }
      });
    });
  }

  public $onDestroy(): void {
    // cancel the interval
    this.cancelPolling();
  }

  private initActives() {
    this.activeTask = _.get<ITask>(this.$stateParams, 'task', undefined);
    this.fileName = _.get<string>(this.$stateParams, 'job.fileName', undefined);
    this.fileData = _.get<string>(this.$stateParams, 'job.fileData', undefined);
    this.exactMatchCsv = _.get<boolean>(this.$stateParams, 'job.exactMatchCsv', undefined);
    this.activeFilter = !_.isUndefined(this.activeTask) || !_.isUndefined(this.fileName) ? TaskListFilterType.ACTIVE : TaskListFilterType.ALL;
  }

  private init(): ng.IPromise<any> {
    return this.$q(resolve => {
      if (!_.isUndefined(this.fileName) && _.isUndefined(this.activeTask)) {
        // importing a CSV file
        this.UserTaskManagerService.submitCsvImportTask(this.fileName, this.fileData, this.exactMatchCsv)
        .then(taskObj => {
          this.activeTask = taskObj;
          resolve();
        }).catch(response => {
          this.Notification.errorResponse(response, 'userTaskManagerModal.submitCsvError');
          resolve();
        });
      } else {
        // this should not happen
        resolve();
      }
    });
  }

  public fetchTasks(): ng.IPromise<any> {
    // Get all tasks and identify active tasks
    return this.UserTaskManagerService.getTasks()
    .then(tasks => {
      this.allTaskList = this.setListTanslationFields(tasks);
      this.populateInProcessTaskList();
      this.setActiveFilter(this.activeFilter);
    }).catch(response => {
      this.loadingError = true;
      this.Notification.errorResponse(response, 'userTaskManagerModal.getTaskListError');
    });
  }

  public setActiveFilter(activeFilter: TaskListFilterType): void {
    this.activeFilter = activeFilter;
    // when switching to ALL list, update the in-process list
    // this will clear the non-in-process tasks from the Active view
    if (this.activeFilter === TaskListFilterType.ALL) {
      this.populateInProcessTaskList();
      this.activeTask = _.isEmpty(this.allTaskList) ? undefined : this.allTaskList[0];
    } else {
      this.activeTask = _.isEmpty(this.inProcessTaskList) ? undefined : this.inProcessTaskList[0];
    }
  }

  private initPolling(): void {
    this.intervalPromise = this.$interval(() => {
      // get in-process list
      // match and update allTaskList and inProcessTaskList
      this.UserTaskManagerService.initPollingForInProcessTasks()
      .then(response => {
        const inProcessTasks = response;

        // update tasks that were in-process, but now finishes
        _.forEach(this.inProcessTaskList, task => {
          const isStillInProcess = _.some(inProcessTasks, aTask => {
            return aTask.jobInstanceId === task.jobInstanceId;
          });
          if (!isStillInProcess) {
            this.UserTaskManagerService.getTask(task.jobInstanceId)
            .then(response => {
              this.assignTaskToList(response, false);
            });
          }
        });

        // add or update in-process tasks into allTaskList
        _.forEach(inProcessTasks, task => {
          this.assignTaskToList(task, true);
        });
      }).catch(response => {
        this.cancelPolling();
        this.Notification.errorResponse(response, 'userTaskManagerModal.getTaskListError');
      });
    }, UserTaskManagerService.TASK_POLLING_INTERVAL);
  }

  private cancelPolling(): void {
    if (!_.isUndefined(this.intervalPromise)) {
      this.$interval.cancel(this.intervalPromise);
    }
  }

  private assignTaskToList(task: ITask, isInsert: boolean): void {
    const filledDataTask = this.fillTaskData(task);
    let idx = -1;

    // allTaskList
    idx = _.findIndex(this.allTaskList, aTask => {
      return aTask.jobInstanceId === filledDataTask.jobInstanceId;
    });
    if (idx !== -1) {
      this.allTaskList[idx] = filledDataTask;
    } else if (isInsert) {
      this.allTaskList.unshift(filledDataTask);
    }

    // inProcessTaskList
    idx = _.findIndex(this.inProcessTaskList, aTask => {
      return aTask.jobInstanceId === filledDataTask.jobInstanceId;
    });
    if (idx !== -1) {
      this.inProcessTaskList[idx] = filledDataTask;
    } else if (isInsert) {
      this.inProcessTaskList.unshift(filledDataTask);
    }
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

  private populateInProcessTaskList(): void {
    this.inProcessTaskList = [];
    this.inProcessTaskList = _.filter(this.allTaskList, task => {
      return this.UserTaskManagerService.isTaskPending(task.status);
    });
  }

  private setListTanslationFields(taskList: ITask[]): ITask[] {
    let newTaskList: ITask[];
    newTaskList = _.map(taskList, task => {
      const newTask = _.cloneDeep(task);
      return this.fillTaskData(newTask);
    });
    return newTaskList;
  }

  private fillTaskData(task: ITask): ITask {
    switch (task.jobType) {
      case TaskType.USERONBOARD:
        task.jobTypeTranslate = this.$translate.instant('userTaskManagerModal.csvImport');
        break;
    }
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

    // created date/time
    if (task.created) {
      const createdMoment = moment(task.created);
      task.createdDate = createdMoment.format('ll');
      task.createdTime = createdMoment.format('LT');
    }
    // started date/time
    if (task.started) {
      const startedMoment = moment(task.started);
      task.startedDate = startedMoment.format('ll');
      task.startedTime = startedMoment.format('LT');
    }
    // stopped date/time
    if (task.stopped) {
      const stoppedMoment = moment(task.stopped);
      task.stoppedDate = stoppedMoment.format('ll');
      task.stoppedTime = stoppedMoment.format('LT');
    }

    return task;
  }
}

export class UserTaskManagerModalComponent implements ng.IComponentOptions {
  public controller = UserTaskManagerModalCtrl;
  public template = require('./user-task-manager.html');
  public bindings = {
    dismiss: '&',
  };
}
