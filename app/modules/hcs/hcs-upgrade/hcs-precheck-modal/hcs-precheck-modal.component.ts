import { HcsUpgradeService } from 'modules/hcs/hcs-shared';
import { Notification } from 'modules/core/notifications';

export class HcsPrecheckModalController implements ng.IComponentController {
  public dismiss: Function;
  public groupId: string;
  public clusterUuid: string;
  public runningPrechecks: boolean = false;
  public spacePrecheck: boolean = false;
  public copPrecheck: boolean = false;
  public spacePrecheckRunning: boolean = false;
  public copPrecheckRunning: boolean = false;
  public checkingStatus: boolean = false;

  public diskSpace = 'disk_space';
  public copInstalled = 'installed_options';
  public checkStatus = 'checkstatus';

  /* @ngInject */
  constructor(
    private $interval,
    private $state,
    private HcsUpgradeService: HcsUpgradeService,
    private Notification: Notification,
  ) { }

  public dismissModal(): void {
    this.dismiss();
  }

  public runPrechecks() {
    this.runningPrechecks = true;
    this.checkingStatus = true;
    this.HcsUpgradeService.startTasks(this.clusterUuid, this.checkStatus, this.getTasks())
      .then(cluster => {
        const getStatus = this.$interval(() => {
          this.HcsUpgradeService.getTask(cluster.clusterUuid, cluster.uuid)
            .then((response) => {
              if (response.taskStatus === 'success') {
                this.$interval.cancel(getStatus);
                this.checkingStatus = false;
              }
            });
        }, 2500);
      })
      .catch(err => {
        this.runningPrechecks = false;
        this.checkingStatus = false;
        this.Notification.errorWithTrackingId(err, err.data.errors[0].message);
      });
  }

  public getTasks() {
    const tasks: string[] = [];
    if (this.spacePrecheck) {
      tasks.push(this.diskSpace);
    }
    if (this.copPrecheck) {
      tasks.push(this.copInstalled);
    }
    return tasks;
  }

  public continue() {
    this.dismiss();
    this.$state.go('hcs.upgradeClusterStatus', { clusterId: this.clusterUuid, groupId: this.groupId });
  }
}

export class HcsPrecheckModalComponent implements ng.IComponentOptions {
  public controller = HcsPrecheckModalController;
  public template = require('./hcs-precheck-modal.component.html');
  public bindings = {
    dismiss: '&',
    clusterUuid: '@',
    groupId: '@',
  };
}
