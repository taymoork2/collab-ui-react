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
  errorMessage; string;
}

// TODO: brspence refactor component into task-details
export class CsvUploadResultsCtrl implements ng.IComponentController {

  public inputActiveTask: ITask;
  public activeTask?: ITask;
  public numTotalUsers = 0;
  public numNewUsers = 0;
  public numUpdatedUsers = 0;
  public numErroredUsers = 0;
  public processProgress = 0;
  public isProcessing = false;
  public userErrorArray: IErrorItem[];
  public isCancelledByUser = false;
  public fileName: string;
  public startedDate: string;
  public startedTime: string;
  public startedBy: string;
  private intervalPromise: ng.IPromise<void>;
  public static readonly TASK_POLLING_INTERVAL = 1000;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private $interval: ng.IIntervalService,
    private ModalService,
    private UserTaskManagerService: UserTaskManagerService,
    private UserCsvService,
    private Userservice,
    private Notification: Notification,
  ) {}

  public $onInit(): void {
  }

  public $onChanges(changes: ng.IOnChangesObject): void {
    if (changes.inputActiveTask) {
      const newTask = changes.inputActiveTask.currentValue;
      const oldTask = changes.inputActiveTask.previousValue;

      if ((!_.isUndefined(newTask) && _.isUndefined(oldTask)) ||
        (!_.isUndefined(newTask) && !_.isUndefined(oldTask) && newTask.jobInstanceId !== oldTask.jobInstanceId)) {
        // cancel the current task polling
        this.cancelPolling();
        // populate task details
        this.activeTask = changes.inputActiveTask.currentValue;
        this.populateTaskData();
        // if the new task is pending, poll the task data every TASK_POLLING_INTERVAL seconds
        if (this.UserTaskManagerService.isTaskPending(this.activeTask!.status)) {
          this.intervalPromise = this.$interval(() => {
            if (_.isUndefined(this.activeTask)) {
              this.cancelPolling();
            } else {
              this.UserTaskManagerService.getTask(this.activeTask!.jobInstanceId)
              .then(response => {
                this.activeTask = response;
                this.populateTaskData();
                // if this task is done processing, cancel the task polling
                if (!this.UserTaskManagerService.isTaskPending(this.activeTask!.status)) {
                  this.cancelPolling();
                }
              });
            }
          }, CsvUploadResultsCtrl.TASK_POLLING_INTERVAL);
        }
      } else {
        this.activeTask = undefined;
      }
    }
  }

  public $onDestroy(): void {
    // cancel the interval
    this.cancelPolling();
  }

  private populateTaskData(): void {
    this.numTotalUsers = this.activeTask!.totalUsers;
    this.numNewUsers = this.activeTask!.addedUsers;
    this.numUpdatedUsers = this.activeTask!.updatedUsers;
    this.numErroredUsers = this.activeTask!.erroredUsers;
    this.processProgress = Math.floor((this.numNewUsers + this.numUpdatedUsers + this.numErroredUsers) * 100 / this.numTotalUsers);
    if (isNaN(this.processProgress)) {
      this.processProgress = 0;
    }
    this.isProcessing = this.UserTaskManagerService.isTaskInProcess(this.activeTask!.status);
    this.isCancelledByUser = false;
    this.fileName = this.getShortFileName(this.activeTask!.filename);
    this.startedDate = this.activeTask!.startedDate;
    this.startedTime = this.activeTask!.startedTime;
    this.Userservice.getUserAsPromise(this.activeTask!.creatorUserId)
    .then((response) => {
      this.startedBy = response.data.displayName + ' (' + response.data.userName + ')';
    });

    if (this.activeTask!.erroredUsers > 0) {
      this.UserTaskManagerService.getTaskErrors(this.activeTask!.jobInstanceId)
      .then(response => {
        this.userErrorArray = _.map(response, errorEntry => {
          errorEntry.errorMessage = this.UserCsvService.getBulkErrorResponse(_.parseInt(errorEntry.error.key), errorEntry.error.message[0].code) +
            ' TrackingID: ' + errorEntry.trackingId;
          return errorEntry;
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
    } else {
      this.userErrorArray = [];
    }
  }

  private getShortFileName(longFileName: string): string {
    if (!_.isNil(longFileName)) {
      const tempString = _.split(longFileName, '/')[1];
      const csvIndex = tempString.indexOf('.csv');
      return tempString.substring(0, csvIndex + 4);
    }
    return '';
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
      .catch(response => {
        this.Notification.errorResponse(response, 'userTaskManagerModal.cancelCsvError');
      });
    });
  }

  private cancelPolling(): void {
    if (!_.isUndefined(this.intervalPromise)) {
      this.$interval.cancel(this.intervalPromise);
    }
  }
}

export class CsvUploadResultsComponent implements ng.IComponentOptions {
  public controller = CsvUploadResultsCtrl;
  public template = require('./csv-upload-results.html');
  public bindings = {
    inputActiveTask: '<',
  };
}
