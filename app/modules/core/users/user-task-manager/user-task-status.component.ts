import { UserTaskManagerService } from 'modules/core/users/user-task-manager';
import { ITask } from './user-task-manager.component';

export class UserTaskStatusCtrl implements ng.IComponentController {

  public hasInProcessTask = false;
  public inProcessTaskList: ITask[];
  private intervalPromise: ng.IPromise<void>;
  public static readonly TASK_POLLING_INTERVAL = 5000;
  public text = this.$translate.instant('userTaskManagerModal.backgroundTasksRunning');

  /* @ngInject */
  constructor(
    private $state: ng.ui.IStateService,
    private $interval: ng.IIntervalService,
    private $translate: ng.translate.ITranslateService,
    private Notification,
    private UserTaskManagerService: UserTaskManagerService,
    private FeatureToggleService,
  ) {
  }

  public $onInit(): void {
    this.FeatureToggleService.atlasCsvImportTaskManagerGetStatus()
      .then(toggle => {
        if (toggle) {
          this.getInProcessList()
            .then(() => this.startPolling());
        }
      });
  }

  public $onDestroy(): void {
    // cancel the interval
    this.cancelPolling();
  }

  public clickCallback(): void {
    if (!_.isEmpty(this.inProcessTaskList)) {
      this.$state.go('users.csv.task-manager', {
        task: this.inProcessTaskList[0],
      });
    }
  }

  public startPolling(): ng.IPromise<any> {
    return this.intervalPromise = this.$interval(() => {
      // get in-process list
      this.getInProcessList();
    }, UserTaskStatusCtrl.TASK_POLLING_INTERVAL);
  }

  private cancelPolling(): void {
    if (!_.isUndefined(this.intervalPromise)) {
      this.$interval.cancel(this.intervalPromise);
    }
  }

  private getInProcessList(): ng.IPromise<any> {
    return this.UserTaskManagerService.getInProcessTasks()
    .then(response => {
      this.inProcessTaskList = response;
      this.hasInProcessTask = !_.isEmpty(this.inProcessTaskList);
    }).catch(response => {
      this.cancelPolling();
      this.Notification.errorResponse(response, 'userTaskManagerModal.getTaskListError');
    });
  }
}

export class UserTaskStatusComponent implements ng.IComponentOptions {
  public controller = UserTaskStatusCtrl;
  public template = require('./user-task-status.html');
  public bindings = {};
}
