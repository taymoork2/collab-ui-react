import { UserTaskMgrService } from 'modules/core/users/userTaskMgr';
import { Notification } from 'modules/core/notifications';

export interface ITask {
  jobInstanceId: string;
  created: string;
  started: string;
  lastModified: string;
  stopped: string;
  creatorUserId: string;
  modifierUserId: string;
  status: string;
  message: string;
  filename: string;
  fileSize: number;
  fileMd5: string;
  totalUsers: number;
  addedUsers: number;
  updatedUsers: number;
  erroredUsers: number;
}

export enum ModalView {
  ALL = 1,
  ACTIVE,
}

export enum TaskStatus {
  CREATED = 'CREATED',
  STARTING = 'STARTING',
  STARTED = 'STARTED',
  STOPPING = 'STOPPING',
  STOPPED = 'STOPPED',
  STOPPED_FOR_MAINTENANCE = 'STOPPED_FOR_MAINTENANCE',
  COMPLETED = 'COMPLETED',
  COMPLETED_WITH_ERRORS = 'COMPLETED_WITH_ERRORS',
  FAILED = 'FAILED',
  ABANDONED = 'ABANDONED',
}

export class UserTaskMgrCtrl implements ng.IComponentController {

  public activeTask: ITask;
  public loading = false;
  public dismiss: Function;
  public ModalView = ModalView;
  public allTaskList: ITask[];
  public inProcessTaskList: ITask[];
  public activeModal: ModalView = ModalView.ALL;

  /* @ngInject */
  constructor(
    private $stateParams,
    private Notification: Notification,
    private UserTaskMgrService: UserTaskMgrService,
  ) {
    this.activeTask = _.get<ITask>(this.$stateParams, 'task', undefined);
    this.activeModal = _.isUndefined(this.activeTask) ? ModalView.ALL : ModalView.ACTIVE;
  }

  public $onInit(): ng.IPromise<any> {
    this.loading = true;
    return this.getTasks()
    .finally(() => this.loading = false);
  }

  public setModal(modalSelection: ModalView): void {
    this.activeModal = modalSelection;
    if (this.isModalAll()) {
      if (!_.isEmpty(this.allTaskList)) {
        this.setActiveTask(this.allTaskList[0]);
      }
    } else {
      if (!_.isEmpty(this.inProcessTaskList)) {
        this.setActiveTask(this.inProcessTaskList[0]);
      }
    }
  }

  public isModalAll(): boolean {
    return this.activeModal === ModalView.ALL;
  }

  public isModalActive(): boolean {
    return this.activeModal === ModalView.ACTIVE;
  }

  public setActiveTask(taskSelection: ITask): void {
    this.activeTask = taskSelection;
    // TO-DO Stop polling the previous task and
    // start polling data for this task
  }

  public isActiveTask(taskSelection: ITask): boolean {
    if (_.isUndefined(this.activeTask) || _.isUndefined(taskSelection)) {
      return false;
    } else {
      return this.activeTask.jobInstanceId === taskSelection.jobInstanceId;
    }
  }

  public getTasks(): ng.IPromise<any> {
    // Get all tasks and identify  tasks
    return this.UserTaskMgrService.getTasks()
    .then(tasks => {
      this.allTaskList = tasks;
      this.populateInProcessTaskList();
      // Find the active task and fill task data
      // otherwise, show the first row
      this.setModal(this.activeModal);
    }).catch(response => this.Notification.errorResponse(response, 'mediaMgrModal.getMediaListError'));
  }

  private populateInProcessTaskList(): void {
    this.inProcessTaskList = [];
    _.forEach(this.allTaskList, task => {
      if (task.status === TaskStatus.STARTING || task.status === TaskStatus.STARTED) {
        this.inProcessTaskList.push(task);
      }
    });
  }

  public closeTaskMgrModal(): void {
    this.dismiss();
  }
}

export class UserTaskMgrComponent implements ng.IComponentOptions {
  public controller = UserTaskMgrCtrl;
  public template = require('modules/core/users/userTaskMgr/user-task-mgr.html');
  public bindings = {
    dismiss: '&',
  };
}
