import { UserTaskManagerService } from 'modules/core/users/user-task-manager';
import { ITask } from './user-task-manager.component';

export class UserTaskStatusCtrl implements ng.IComponentController {

  public hasInProcessTask = false;
  public text = this.$translate.instant('userTaskManagerModal.backgroundTasksRunning');

  private inProcessTaskList: ITask[] = [];
  private hasRunningInterval = false;

  private readonly TASK_MANAGER_STATE = 'users.csv.task-manager';

  /* @ngInject */
  constructor(
    private $scope: ng.IScope,
    private $state: ng.ui.IStateService,
    private $translate: ng.translate.ITranslateService,
    private UserTaskManagerService: UserTaskManagerService,
  ) {
  }

  public $onInit(): void {
    this.initPolling();
    this.initStateChangeListener();
  }

  public clickCallback(): void {
    if (!_.isEmpty(this.inProcessTaskList)) {
      this.$state.go(this.TASK_MANAGER_STATE, {
        task: this.inProcessTaskList[0],
      });
    }
  }

  private initStateChangeListener() {
    this.$scope.$on('$stateChangeSuccess', (_event, toState) => {
      if (toState.name === this.TASK_MANAGER_STATE) {
        this.stopPolling();
      } else {
        this.initPolling();
      }
    });
  }

  private intervalCallback = (response: ITask[]) => {
    this.inProcessTaskList = response;
    this.hasInProcessTask = !_.isEmpty(this.inProcessTaskList);
    if (this.hasInProcessTask) {
      this.UserTaskManagerService.changeRunningTaskListPolling(this.UserTaskManagerService.IntervalDelay.SHORT);
    } else {
      this.UserTaskManagerService.changeRunningTaskListPolling(this.UserTaskManagerService.IntervalDelay.LONG);
    }
  }

  private initPolling() {
    if (this.hasRunningInterval) {
      return;
    }

    this.UserTaskManagerService.initRunningTaskListPolling(this.intervalCallback, this.$scope);
    this.hasRunningInterval = true;
  }

  private stopPolling() {
    this.UserTaskManagerService.cleanupRunningTaskListPolling(this.intervalCallback);
    this.hasRunningInterval = false;
    this.inProcessTaskList = [];
    this.hasInProcessTask = false;
  }
}

export class UserTaskStatusComponent implements ng.IComponentOptions {
  public controller = UserTaskStatusCtrl;
  public template = require('./user-task-status.html');
  public bindings = {};
}
