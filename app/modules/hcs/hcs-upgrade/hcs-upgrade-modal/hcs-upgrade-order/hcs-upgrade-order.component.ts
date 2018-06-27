import { Notification } from 'modules/core/notifications';
import { HcsUpgradeService } from 'modules/hcs/hcs-shared';

export class HcsUpgradeOrderController implements ng.IComponentController {
  public onChangeFn: Function;
  public orginalList;
  public copyList;
  public cluster;
  public groupOrder;
  public pubTranslate: string;
  public subTranslate: string;
  public clusterUuid: string;
  public loading: boolean = false;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private Notification: Notification,
    private HcsUpgradeService: HcsUpgradeService,
  ) {}

  public $onInit() {
    this.groupOrder = [
      this.$translate.instant('ranks.first'),
      this.$translate.instant('ranks.second'),
      this.$translate.instant('ranks.third'),
      this.$translate.instant('ranks.fourth'),
      this.$translate.instant('ranks.fifth'),
      this.$translate.instant('ranks.sixth'),
      this.$translate.instant('ranks.seventh'),
      this.$translate.instant('ranks.eighth'),
    ];
    this.pubTranslate = this.$translate.instant('hcs.clusterDetail.settings.nodes.publisher');
    this.subTranslate = this.$translate.instant('hcs.clusterDetail.settings.nodes.subscriber');

    this.getNodesToUpgrade();
  }

  public getNodesToUpgrade() {
    this.loading = true;
    this.HcsUpgradeService.getUpgradeOrder(this.clusterUuid)
      .then(nodes => {
        this.copyList = _.cloneDeep(nodes.upgradeOrder);
        this.cluster = nodes.upgradeOrder;
        this.nodeOrderChanged();
      })
      .catch(err => this.Notification.errorWithTrackingId(err, err.data.errors[0].message))
      .finally(() => this.loading = false);
  }

  public moveUp(parentIndex, itemIndex) {
    const item  = _.pullAt(this.cluster[parentIndex].nodes, [itemIndex]);
    this.cluster[parentIndex - 1].nodes.push(item[0]);

    this.nodeOrderChanged();
  }

  public canMoveUp(node, parentIndex) {
    const publisher = _.find(this.cluster[parentIndex - 1].nodes, { pub: true, type: node.type });

    if (publisher || parentIndex === 1) {
      return false;
    } else {
      return true;
    }
  }

  public moveDown(parentIndex, itemIndex) {
    if (!this.cluster[parentIndex + 1]) {
      this.createAnotherGroup();
    }
    const item  = _.pullAt(this.cluster[parentIndex].nodes, [itemIndex]);
    this.cluster[parentIndex + 1].nodes.push(item[0]);

    this.nodeOrderChanged();
  }

  public nodeOrderChanged(): void {
    this.onChangeFn({
      cluster: this.cluster,
    });
  }

  public handleKeyPress(keyCode, node, parentIndex, itemIndex) {
    if (!node.pub) {
      if (keyCode === 40 && parentIndex !== 7) {
        //down arrow
        this.moveDown(parentIndex, itemIndex);
      } else if (keyCode === 38 && this.canMoveUp(node, parentIndex)) {
        //up arrow
        this.moveUp(parentIndex, itemIndex);
      } else {
        return;
      }
    }
  }

  public createAnotherGroup() {
    if (this.cluster.length < 8) {
      this.cluster.push({
        orderNumber: this.cluster.length + 1,
        nodes: [],
      });
    } else {
      this.Notification.error('hcs.upgrade.order.maxGroups');
    }
  }

  public resetNodes() {
    this.cluster = _.cloneDeep(this.copyList);
    this.nodeOrderChanged();
  }
}

export class HcsUpgradeOrderComponent implements ng.IComponentOptions {
  public controller = HcsUpgradeOrderController;
  public template = require('./hcs-upgrade-order.component.html');
  public bindings = {
    clusterUuid: '@',
    onChangeFn: '&',
    groupId: '@',
  };
}
