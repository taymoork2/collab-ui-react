import { ITask, TaskStatus } from './user-task-mgr.component';

export class CsvUploadResultsCtrl implements ng.IComponentController {

  public activeTask: ITask;
  public numTotalUsers = 0;
  public numNewUsers = 0;
  public numUpdatedUsers = 0;
  public numErroredUsers = 0;
  public processProgress = 0;
  public isProcessing = false;
  public userErrorArray = [];
  public isCancelledByUser = false;
  public fileName: string;
  public importCompletedAt: string;

  /* @ngInject */
  constructor(
    private $scope: ng.IScope,
  ) {}

  public $onInit(): void {
    this.$scope.$watch(() => {
      return this.activeTask.jobInstanceId;
    }, () => {
      this.fillTaskData(this.activeTask);
    });
  }

  private fillTaskData(taskSelection: ITask): void {
    this.numTotalUsers = taskSelection.totalUsers;
    this.numNewUsers = taskSelection.addedUsers;
    this.numUpdatedUsers = taskSelection.updatedUsers;
    this.numErroredUsers = taskSelection.erroredUsers;
    this.processProgress =
      Math.floor(
        (this.numNewUsers + this.numUpdatedUsers + this.numErroredUsers) * 100 / this.numTotalUsers);
    this.isProcessing =
      (taskSelection.status === TaskStatus.STARTED || taskSelection.status === TaskStatus.STARTING) ? true : false;
    this.isCancelledByUser = false;
    this.fileName = taskSelection.filename;
    this.importCompletedAt = taskSelection.stopped;
  }

}

export class CsvUploadResultsComponent implements ng.IComponentOptions {
  public controller = CsvUploadResultsCtrl;
  public template = require('modules/core/users/userTaskMgr/csv-upload-results.html');
  public bindings = {
    onDoneImport: '&',
    onCancelImport: '&',
    activeTask: '<',
  };
}
