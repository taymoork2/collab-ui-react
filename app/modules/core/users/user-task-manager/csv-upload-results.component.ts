import { IDateAndTime, UserTaskManagerService } from 'modules/core/users/user-task-manager';
import { ITask } from './user-task-manager.component';
import { Notification } from 'modules/core/notifications';

export interface IMessage {
  code: string;
  description: string;
  location: string;
}

export interface IError {
  key: string;
  message: IMessage[];
}

export interface IErrorItem {
  itemNumber: number;
  error: IError;
  trackingId: string;
}

export interface IErrorRow {
  row: number;
  error: string;
}

export class CsvUploadResultsCtrl implements ng.IComponentController {

  public inputActiveTask: ITask;
  public onStatusUpdate: Function;

  public activeTask?: ITask;
  public fileName?: string;
  public numTotalUsers = 0;
  public numNewUsers = 0;
  public numUpdatedUsers = 0;
  public numErroredUsers = 0;
  public processProgress = 0;
  public isProcessing = false;
  public userErrorArray: IErrorRow[] = [];
  public isCancelledByUser = false;
  public startedBy?: string;
  public DOWNLOAD_ERRORS = this.Analytics.sections.ADD_USERS.eventNames.CSV_ERROR_EXPORT;
  public isOverErrorThreshhold = false;

  private cancelErrorsDeferred?: ng.IDeferred<void>;
  private startDateAndTime?: IDateAndTime;
  private endDateAndTime?: IDateAndTime;

  /* @ngInject */
  constructor(
    private $q: ng.IQService,
    private $scope: ng.IScope,
    private $translate: ng.translate.ITranslateService,
    private ModalService,
    private Notification: Notification,
    private UserTaskManagerService: UserTaskManagerService,
    private Analytics,
  ) {}

  private intervalCallback = (task: ITask) => {
    this.setActiveTaskData(task);
    this.onStatusUpdate({
      status: task.latestExecutionStatus,
    });
    if (!this.UserTaskManagerService.isTaskPending(task.latestExecutionStatus)) {
      this.UserTaskManagerService.cleanupTaskDetailPolling(this.intervalCallback);
    }
  }

  public $onChanges(changes: ng.IOnChangesObject): void {
    if (changes.inputActiveTask) {
      const newTask: ITask = changes.inputActiveTask.currentValue;
      this.resetErrorArrayOnChange();

      if (_.isUndefined(newTask)) {
        this.activeTask = undefined;
      } else {
        if (newTask.sourceUserId) {
          this.setStartedByUser(newTask.sourceUserId);
        }

        this.UserTaskManagerService.cleanupTaskDetailPolling(this.intervalCallback);
        this.setActiveTaskData(newTask);
        if (this.UserTaskManagerService.isTaskPending(newTask.latestExecutionStatus)) {
          this.UserTaskManagerService.initTaskDetailPolling(newTask.id, this.intervalCallback, this.$scope);
        }
      }
    }
  }

  public get startedDate() {
    return _.get(this.startDateAndTime, 'date');
  }

  public get startedTime() {
    return _.get(this.startDateAndTime, 'time');
  }

  public get endedDate() {
    return _.get(this.endDateAndTime, 'date');
  }

  public get endedTime() {
    return _.get(this.endDateAndTime, 'time');
  }

  public get hasUser() {
    return _.isString(this.startedBy);
  }

  public get progressbarLabel() {
    if (this.isCancelledByUser) {
      return this.$translate.instant('common.cancelingEllipsis');
    }
  }

  public isCompleted(): boolean {
    return _.isUndefined(this.activeTask) ? false : !this.UserTaskManagerService.isTaskPending(this.activeTask!.latestExecutionStatus);
  }

  public isTaskError(): boolean {
    return _.isUndefined(this.activeTask) ? false : this.UserTaskManagerService.isTaskError(this.activeTask!);
  }

  public getStatusTranslation(): string {
    return _.isUndefined(this.activeTask) ? '' : this.UserTaskManagerService.getTaskStatusTranslate(this.activeTask!);
  }

  public onCancelImport(): void {
    return this.ModalService.open({
      title: this.$translate.instant('userManage.bulk.import.stopImportTitle'),
      message: this.$translate.instant('userManage.bulk.import.stopImportBody'),
      dismiss: this.$translate.instant('common.cancel'),
      close: this.$translate.instant('userManage.bulk.import.stopImportTitle'),
      btnType: 'alert',
    }).result.then(() => {
      this.UserTaskManagerService.cancelTask(this.activeTask!.id)
        .then(() => this.isCancelledByUser = true)
        .catch(response => {
          this.Notification.errorResponse(response, 'userTaskManagerModal.cancelCsvError');
        });
    });
  }

  private setStartedByUser(userId: string) {
    this.UserTaskManagerService.getUserDisplayAndEmail(userId)
      .then(userDisplayNameAndEmail => this.startedBy = userDisplayNameAndEmail);
  }

  private setActiveTaskData(task: ITask): void {
    this.activeTask = task;
    this.numTotalUsers = task.counts.totalUsers;
    this.numNewUsers = task.counts.usersCreated;
    this.numUpdatedUsers = task.counts.usersUpdated;
    this.numErroredUsers = task.counts.usersFailed;
    this.processProgress = Math.floor((this.numNewUsers + this.numUpdatedUsers + this.numErroredUsers) * 100 / this.numTotalUsers);
    if (isNaN(this.processProgress)) {
      this.processProgress = 0;
    }
    this.isProcessing = this.UserTaskManagerService.isTaskInProcess(task.latestExecutionStatus);
    this.isCancelledByUser = false;
    this.fileName = this.getShortFileName(task.csvFile);
    const latestExecutionStatus = _.last(_.sortBy(task.jobExecutionStatus, status => status.id));

    if (latestExecutionStatus) {
      this.startDateAndTime = this.UserTaskManagerService.getDateAndTime(latestExecutionStatus.startTime);
      this.endDateAndTime = this.UserTaskManagerService.getDateAndTime(latestExecutionStatus.endTime);
    }

    this.fetchTaskErrors(task);
  }

  private fetchTaskErrors(task: ITask) {
    if (this.cancelErrorsDeferred) {
      return;
    }

    this.cancelErrorsDeferred = this.$q.defer();
    this.UserTaskManagerService.getTaskErrors(task.id, this.cancelErrorsDeferred.promise).then(response => {
      this.cancelErrorsDeferred = undefined;
      if (!_.isEmpty(response.paging.next)) {
        this.isOverErrorThreshhold = true;
      }

      this.userErrorArray = _.cloneDeep(this.UserTaskManagerService.transformErrorData(response.items));
    });
  }

  private resetErrorArrayOnChange(): void {
    if (this.cancelErrorsDeferred) {
      this.cancelErrorsDeferred.resolve();
      this.cancelErrorsDeferred = undefined;
    }
    this.userErrorArray = [];
    this.isOverErrorThreshhold = false;
  }

  private getShortFileName(longFileName?: string): string {
    if (!_.isString(longFileName)) {
      return '';
    }

    const csvIndex = longFileName.indexOf('.csv');
    const shortFileName = csvIndex > -1 ? longFileName.substring(0, csvIndex + 4) : longFileName;
    const shortFileNameChunks = shortFileName.split('/');
    return shortFileNameChunks[shortFileNameChunks.length - 1];
  }
}

export class CsvUploadResultsComponent implements ng.IComponentOptions {
  public controller = CsvUploadResultsCtrl;
  public template = require('./csv-upload-results.html');
  public bindings = {
    inputActiveTask: '<',
    onStatusUpdate: '&',
  };
}
