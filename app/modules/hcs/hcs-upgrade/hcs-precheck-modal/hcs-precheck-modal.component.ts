import { HcsUpgradeService } from 'modules/hcs/hcs-shared';
import { Notification } from 'modules/core/notifications';

export class HcsPrecheckModalController implements ng.IComponentController {
  public dismiss: Function;
  public clusterUuid: string;
  public runningPrechecks: boolean = false;
  public spacePrecheck: boolean = false;
  public copPrecheck: boolean = false;
  public spacePrecheckRunning: boolean = false;
  public copPrecheckRunning: boolean = true;

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
    this.HcsUpgradeService.startTasks(this.clusterUuid, this.checkStatus, this.getTasks())
      .then(cluster => {
        const getStatus = this.$interval(() => {
          this.HcsUpgradeService.getPrecheckStatus(cluster)
            .then((response) => {
              if (response.completed && !response.failed) {
                this.$interval.cancel(getStatus);
                this.dismiss();
                this.$state.go('here');
              }
            });
        }, 1000);
      })
      .catch(err => {
        this.runningPrechecks = false;
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
}

export class HcsPrecheckModalComponent implements ng.IComponentOptions {
  public controller = HcsPrecheckModalController;
  public template = require('./hcs-precheck-modal.component.html');
  public bindings = {
    dismiss: '&',
    clusterUuid: '@',
  };
}
