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
  message: string;
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
    private UserCsvService,
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

  public getStatusTranslation() {
    return _.get(this.activeTask, 'statusTranslate');
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
      const tempUserErrorArray: IErrorRow[] = [];
      _.forEach(response, errorEntry => {
        _.forEach(errorEntry.error.message, msg => {
          let errorMessage = '';
          const errorType = _.split(_.get(msg, 'code'), '-')[0];
          const errorCode = _.split(_.get(msg, 'code'), '-')[1];

          if (!_.isUndefined(errorType) && _.startsWith(errorType, 'BATCH')) {
            // For EFT, if the code starts with 'BATCH', use the description
            errorMessage = msg.description;
          } else if (errorCode) {
            // get the localized error message
            errorMessage = this.UserCsvService.getBulkErrorResponse(_.parseInt(_.get(errorEntry, 'error.key')), errorCode);
            // For EFT, if the error messages are stock/generic messages, use the description
            if (errorMessage === this.$translate.instant('firstTimeWizard.bulk400Error')
            || errorMessage === this.$translate.instant('firstTimeWizard.bulk401And403Error')
            || errorMessage === this.$translate.instant('firstTimeWizard.bulk404Error')
            || errorMessage === this.$translate.instant('firstTimeWizard.bulk408Error')
            || errorMessage === this.$translate.instant('firstTimeWizard.bulk409Error')) {
              errorMessage = msg.description;
            }
          } else {
            errorMessage = msg.description;
          }

          tempUserErrorArray.push({
            row: _.get(errorEntry, 'itemNumber'),
            message: `${errorMessage} TrackingID: ${_.get(errorEntry, 'trackingId')}`,
          });
        });
      });
      this.userErrorArray = _.cloneDeep(tempUserErrorArray);

      // load the errors to userCsvService when it's done
      if (!this.isProcessing) {
        // empty userErrorArray first
        this.UserCsvService.setCsvStat({
          userErrorArray: [],
        }, true);
        _.forEach(this.userErrorArray, errorEntry => {
          this.UserCsvService.setCsvStat({
            userErrorArray: [{
              row: errorEntry.row,
              email: 'User',
              error: errorEntry.message,
            }],
          });
        });
      }
    });
  }

  private resetErrorArrayOnChange() {
    if (this.cancelErrorsDeferred) {
      this.cancelErrorsDeferred.resolve();
      this.cancelErrorsDeferred = undefined;
    }
    this.userErrorArray = [];
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
