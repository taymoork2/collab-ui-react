import { HcsUpgradeService } from 'modules/hcs/hcs-shared';
import { Notification } from 'modules/core/notifications';

export class HcsUpgradeModalCtrl implements ng.IComponentController {
  public dismiss: Function;
  public currentStepIndex: number;
  public title: string;
  public hcsSetupModalForm: ng.IFormController;
  public cancelRemoved: boolean = false;
  public removeNext = false;
  public finish: boolean = false;
  public finishDisable: boolean = false;
  public isFirstTimeSetup: boolean;
  public loading: boolean = false;
  public isSftp: boolean = true;
  public removeCustom: boolean = false;
  public clusterName: string;
  public clusterUuid;
  public currentVersion;
  public upgradeTo;
  public upgradeOrder;
  public customerId;
  public upgradeTaskType: string = 'upgrade';

  /* @ngInject */
  constructor(
    private $modal,
    private $state,
    private HcsUpgradeService: HcsUpgradeService,
    private Notification: Notification,
  ) {}

  public $onInit() {
    this.currentStepIndex = 1;
    this.loading = false;
    this.finishDisable = true;
    this.title = 'common.upgrade';
  }

  public upgradeStep(): void {
    this.removeNext = true;
    this.removeCustom = true;
    this.title = 'hcs.upgrade.order.title';
    this.finish = true;
    this.currentStepIndex = this.currentStepIndex + 1;
  }

  public dismissModal(): void {
    this.dismiss();
  }

  public finishModal(): boolean {
    return this.currentStepIndex !== 2;
  }

  public saveUpgradeOrder(): void {
    this.HcsUpgradeService.saveUpgradeOrder(this.clusterUuid , this.getNodeIds(this.upgradeOrder))
      .catch((err) => this.Notification.errorWithTrackingId(err, err.data.errors[0].message))
      .then(() => this.HcsUpgradeService.startTasks(this.clusterUuid, this.upgradeTaskType))
      .then(() => this.dismiss())
      .then(() => this.$state.go('hcs.upgradeClusterStatus', { groupId: this.customerId, clusterId: this.clusterUuid }));
  }

  public getNodeIds(clusterList) {
    const data = <any>[];
    _.forEach(clusterList, (node) => {
      data.push({
        orderNumber: node.orderNumber,
        nodeIds: _.map(node.nodes, 'uuid'),
      });
    });
    return data;
  }

  public setUpgradeOrder(nodeOrder) {
    this.upgradeOrder = nodeOrder;
  }

  public runPrechecks() {
    this.dismiss();
    this.$modal.open({
      template: `<hcs-precheck-modal dismiss="$dismiss()" cluster-uuid="${this.clusterUuid}"></hcs-precheck-modal>`,
      type: 'small',
    });
  }
}

export class HcsUpgradeModalComponent implements ng.IComponentOptions {
  public controller = HcsUpgradeModalCtrl;
  public template = require('./hcs-upgrade-modal.component.html');
  public bindings = {
    dismiss: '&',
    clusterName: '@',
    clusterUuid: '@',
    currentVersion: '@',
    upgradeTo: '@',
    customerId: '@',
  };
}
