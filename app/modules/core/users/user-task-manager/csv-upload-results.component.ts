import { UserTaskManagerService } from 'modules/core/users/user-task-manager';
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
  error: IError;
  trackingId: string;
  itemNumber: number;
  errorMessage: string;
}

export class CsvUploadResultsCtrl implements ng.IComponentController {

  public inputActiveTask: ITask;
  public onStatusUpdate: Function;

  public activeTask?: ITask;
  public numTotalUsers = 0;
  public numNewUsers = 0;
  public numUpdatedUsers = 0;
  public numErroredUsers = 0;
  public processProgress = 0;
  public isProcessing = false;
  public userErrorArray: IErrorItem[] = [];
  public isCancelledByUser = false;
  public fileName: string;
  public startedDate: string;
  public startedTime: string;
  public startedBy: string;

  private cancelErrorsDeferred?: ng.IDeferred<void>;

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
      status: task.status,
    });
    if (!this.UserTaskManagerService.isTaskPending(task.status)) {
      this.UserTaskManagerService.cleanupTaskDetailPolling(this.intervalCallback);
    }
  }

  public $onChanges(changes: ng.IOnChangesObject): void {
    if (changes.inputActiveTask) {
      const newTask = changes.inputActiveTask.currentValue;
      this.resetErrorArrayOnChange();

      if (_.isUndefined(newTask)) {
        this.activeTask = undefined;
      } else {
        this.setStartedByUser(newTask.creatorUserId);

        this.UserTaskManagerService.cleanupTaskDetailPolling(this.intervalCallback);
        this.setActiveTaskData(newTask);
        if (this.UserTaskManagerService.isTaskPending(newTask.status)) {
          this.UserTaskManagerService.initTaskDetailPolling(newTask.jobInstanceId, this.intervalCallback, this.$scope);
        }
      }
    }
  }

  public get progressbarLabel() {
    if (this.isCancelledByUser) {
      return this.$translate.instant('common.cancelingEllipsis');
    }
  }

  public onCancelImport(): void {
    return this.ModalService.open({
      title: this.$translate.instant('userManage.bulk.import.stopImportTitle'),
      message: this.$translate.instant('userManage.bulk.import.stopImportBody'),
      dismiss: this.$translate.instant('common.cancel'),
      close: this.$translate.instant('userManage.bulk.import.stopImportTitle'),
      btnType: 'alert',
    }).result.then(() => {
      this.UserTaskManagerService.cancelTask(this.activeTask!.jobInstanceId)
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
    this.numTotalUsers = task.totalUsers;
    this.numNewUsers = task.addedUsers;
    this.numUpdatedUsers = task.updatedUsers;
    this.numErroredUsers = task.erroredUsers;
    this.processProgress = Math.floor((this.numNewUsers + this.numUpdatedUsers + this.numErroredUsers) * 100 / this.numTotalUsers);
    if (isNaN(this.processProgress)) {
      this.processProgress = 0;
    }
    this.isProcessing = this.UserTaskManagerService.isTaskInProcess(task.status);
    this.isCancelledByUser = false;
    this.fileName = this.getShortFileName(task.filename);
    const { date, time } = this.UserTaskManagerService.getDateAndTime(task.started);
    this.startedDate = date;
    this.startedTime = time;

    this.populateTaskErrors(task);
  }

  private populateTaskErrors(task: ITask) {
    if (task.erroredUsers > 0) {
      this.fetchTaskErrors(task);
    } else {
      this.userErrorArray = [];
    }
  }

  private fetchTaskErrors(task: ITask) {
    if (this.cancelErrorsDeferred) {
      return;
    }

    this.cancelErrorsDeferred = this.$q.defer();
    this.UserTaskManagerService.getTaskErrors(task.jobInstanceId, this.cancelErrorsDeferred.promise).then(response => {
      this.cancelErrorsDeferred = undefined;
      this.userErrorArray = _.map(response, errorEntry => {
        return _.assignIn({}, errorEntry, {
          errorMessage: `${this.UserCsvService.getBulkErrorResponse(_.parseInt(_.get(errorEntry, 'error.key')), _.get(errorEntry, 'error.message[0].code'))} TrackingID: ${_.get(errorEntry, 'trackingId')}`,
        });
      });
      // load the errors to userCsvService when it's done
      if (!this.isProcessing) {
        // empty userErrorArray first
        this.UserCsvService.setCsvStat({
          userErrorArray: [],
        }, true);
        _.forEach(this.userErrorArray, errorEntry => {
          this.UserCsvService.setCsvStat({
            userErrorArray: [{
              row: errorEntry.itemNumber,
              email: 'User',
              error: errorEntry.errorMessage,
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
