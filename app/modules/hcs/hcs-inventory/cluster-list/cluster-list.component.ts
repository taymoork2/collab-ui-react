import { IToolkitModalService } from 'modules/core/modal';
import { HcsUpgradeService, GROUP_TYPE_UNASSIGNED, IApplicationItem, IClusterItem, IHcsClusterSummaryItem, INodeSummaryItem } from 'modules/hcs/hcs-shared';
import { Notification } from 'modules/core/notifications';
import { ISelectOption, IHeaderTab } from '../shared/hcs-inventory';

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
  public softwareVersionSelected: ISelectOption | null;
  public softwareVersionProfiles: ISelectOption[] | null;
  public loading: boolean;
  public typeUnassigned: string = GROUP_TYPE_UNASSIGNED;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private $state: ng.ui.IStateService,
    private $modal: IToolkitModalService,
    private HcsUpgradeService: HcsUpgradeService,
    private Notification: Notification,
  ) {}

  public $onInit() {
    this.loading = true;
    this.tabs.push({
      title: this.$translate.instant('hcs.clustersList.title'),
      state: `hcs.clusterList({groupId: '${this.groupId}', groupType: '${this.groupType}'})`,
    }, {
      title: this.$translate.instant('hcs.upgradePage.title'),
      state: `hcs.upgradeCluster({groupId: '${this.groupId}', groupType: '${this.groupType}'})`,
    });

    this.clusterList = [];
    this.softwareVersionSelected = null;
    this.softwareVersionProfiles = [];

    if (this.groupType === this.typeUnassigned.toLowerCase()) {
      this.groupName = 'Unassigned';
      this.customerId = undefined;
    } else {
      //TODO: get customer name from api
      this.groupName = 'Betty\'s Flower Shop';
      this.customerId = this.groupId;

      //TODO: get software template selected for the customer.
      this.softwareVersionSelected = { label: 'template2', value: 't2' };

      //TODO: get software template available for partner
      this.softwareVersionProfiles = [{
        label: 'template1',
        value: 't1',
      }, {
        label: 'template2',
        value: 't2',
      }];

    }
    this.HcsUpgradeService.listClusters(this.customerId)
      .then((clusters: IHcsClusterSummaryItem[]) => {
        this.initClusterList(clusters);
      })
      .catch(() => {
        this.Notification.error('hcs.clustersList.errorGetClusters', { customerName: this.groupName });
      })
      .finally(() => {
        this.loading = false;
      });
  }

  public cardSelected(cluster: IClusterItem): void {
    this.$state.go('hcs.clusterDetail', { groupId: this.groupId, groupType: this.groupType, clusterId: cluster.id });
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
    _.forEach(clustersData, (cluster: IHcsClusterSummaryItem) => {
      const applicationList: IApplicationItem[] = [];
      if (!_.isUndefined(cluster.nodes)) {
        _.forEach(cluster.nodes, (node: INodeSummaryItem) => {
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
        status: _.get(cluster, 'clusterStatus'),
        applications: applicationList,
      };
      this.clusterList.push(clusterItem);
    });
  }

  public onSoftwareVersionChanged() {
  }


  public saveSoftwareProfile() {

  }
}
