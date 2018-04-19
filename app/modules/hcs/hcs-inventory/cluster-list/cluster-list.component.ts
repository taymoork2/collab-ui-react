import { IToolkitModalService } from 'modules/core/modal';
import { IApplicationItem, IClusterItem, IHcsClusterSummaryItem, INodeSummaryItem } from 'modules/hcs/shared/hcs-upgrade';
import { HcsUpgradeService } from 'modules/hcs/shared';
import { Notification } from 'modules/core/notifications';

interface IHeaderTab {
  title: string;
  state: string;
}

export class ClusterListComponent implements ng.IComponentOptions {
  public controller = ClusterListCtrl;
  public template = require('./cluster-list.component.html');
  public bindings = {
    groupId: '<',
    groupType: '<',
  };
}

export class ClusterListCtrl implements ng.IComponentController {
  public groupId: string;
  public groupType: string;
  public groupName: string;
  public tabs: IHeaderTab[] = [];
  public back: boolean = true;
  public backState: string = 'hcs.shared.inventoryList';
  public clusterList: IClusterItem[];

  public clusterToBeDeleted: IClusterItem;
  public customerId: string | undefined;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private $state: ng.ui.IStateService,
    private $modal: IToolkitModalService,
    private HcsUpgradeService: HcsUpgradeService,
    private Notification: Notification,
  ) {}

  public $onInit() {
    this.tabs.push({
      title: this.$translate.instant('hcs.clustersList.title'),
      state: `hcs.clusterList({groupId: '${this.groupId}', groupType: '${this.groupType}'})`,
    }, {
      title: this.$translate.instant('hcs.upgradePage.title'),
      state: `hcs.upgradeGroup({customerId: '${this.groupId}'})`,
    });

    this.clusterList = [];

    if (this.groupType === 'unassigned') {
      //get customer name from api
      this.groupName = 'Unassigned';
      this.customerId = undefined;
    } else {
      //get customer name from api
      this.groupName = 'Betty\'s Flower Shop';
      this.customerId = this.groupId;
    }
    this.HcsUpgradeService.listClusters(this.customerId).then((clusters: IHcsClusterSummaryItem[]) => {
      this.initClusterList(clusters);
    })
    .catch(() => {
      this.Notification.error('hcs.clustersList.errorGetClusters', { customerName: this.groupName });
    });
  }

  public cardSelected(cluster: IClusterItem): void {
    this.$state.go('hcs.clusterDetail', { groupId: this.groupId, groupType: this.groupType, clusterId: cluster.id, clusterName: cluster.name });
  }

  public closeCard(cluster: IClusterItem, $event: Event): void {
    $event.preventDefault();
    $event.stopImmediatePropagation();
    this.clusterToBeDeleted = cluster;
    this.$modal.open({
      template: '<hcs-delete-modal delete-fn="$ctrl.deleteFn()" dismiss="$dismiss()" modal-title="$ctrl.title" modal-description="$ctrl.description"></hcs-delete-modal>',
      controller: () => {
        return {
          deleteFn: () => this.deleteCluster(),
          title: this.$translate.instant('hcs.installFiles.deleteModal.title'),
          description: this.$translate.instant('hcs.installFiles.deleteModal.description'),
        };
      },
      modalClass: 'hcs-delete-modal-class',
      controllerAs: '$ctrl',
      type: 'dialog',
    });
  }

  public deleteCluster(): void {
    //delete intsall file && update install file list
  }

  public initClusterList(clustersData: IHcsClusterSummaryItem[]): void {
    this.clusterList = [];
    //function to get cluster data from response object
    _.each(clustersData, (cluster: IHcsClusterSummaryItem) => {
      const applicationList: IApplicationItem[] = [];
      if (!_.isUndefined(cluster.hcsNodes)) {
        _.each(cluster.hcsNodes, (node: INodeSummaryItem) => {
          const index = _.findIndex(applicationList, (application: any) => application.name === node.typeApplication);
          if (index === -1) {
            const applicationItem: IApplicationItem = {
              name: node.typeApplication,
              count: 1,
            };
            applicationList.push(applicationItem);
          } else {
            applicationList[index].count = applicationList[index].count + 1;
          }
        });
      }
      const clusterItem: IClusterItem = {
        id: _.get(cluster, 'uuid'),
        name: _.get(cluster, 'name'),
        status: _.get(cluster, 'status'),
        applications: applicationList,
      };
      this.clusterList.push(clusterItem);
    });
  }
}
