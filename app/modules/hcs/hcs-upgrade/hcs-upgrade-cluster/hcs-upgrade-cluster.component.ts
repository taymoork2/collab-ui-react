import { HcsUpgradeService, GROUP_TYPE_UNASSIGNED, INodeSummaryItem, IHcsClusterSummaryItem, IUpgradeClusterGridRow } from 'modules/hcs/hcs-shared';
import { Notification } from 'modules/core/notifications';

export interface IHeaderTab {
  title: string;
  state: string;
}

export class UpgradeClusterComponent implements ng.IComponentOptions {
  public controller = UpgradeClusterCtrl;
  public template = require('./hcs-upgrade-cluster.component.html');
  public bindings = {
    groupId: '<',
    groupType: '<',
  };
}

export class UpgradeClusterCtrl implements ng.IComponentController {
  public gridOptions;
  public gridColumns;
  public groupId: string;
  public groupName: string;
  public groupType: string;
  public customerId: string | undefined;
  private clusterGridData: IUpgradeClusterGridRow[];
  public showGrid: boolean = false;
  public tabs: IHeaderTab[] = [];
  public back: boolean = true;
  public backState: string = 'hcs.shared.inventoryList';
  public typeUnassigned: string = GROUP_TYPE_UNASSIGNED;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private $state: ng.ui.IStateService,
    private HcsUpgradeService: HcsUpgradeService,
    private Notification: Notification,
  ) {}

  public $onInit() {
    this.tabs.push({
      title: this.$translate.instant('hcs.clustersList.title'),
      state: `hcs.clusterList({groupId: '${this.groupId}', groupType: '${this.groupType}'})`,
    }, {
      title: this.$translate.instant('hcs.upgradePage.title'),
      state: `hcs.upgradeCluster({customerId: '${this.groupId}', groupType: '${this.groupType}'})`,
    });
    //demo temp grid data
    // this.clusterGridData = [
    //   {
    //     clusterName: 'sm-cucm-c1',
    //     applicationName: 'CUCM',
    //     currentVersion: '11.5',
    //     upgradeTo: '12.0.5',
    //     clusterStatus: 'Needs Update',
    //     clusterUuid: '4f73f623-0197-4217-9069-50423a0cfef3',
    //   },
    //   {
    //     clusterName: 'sm-imp-c1',
    //     applicationName: 'IM&P',
    //     currentVersion: '11.5',
    //     upgradeTo: '12.0.5',
    //     clusterStatus: 'Needs Update',
    //     clusterUuid: '4f73f623-0197-4217-9069-50423a0cfef4',
    //   },
    //   {
    //     clusterName: 'sm-expr-c1',
    //     applicationName: 'EXPR',
    //     currentVersion: '12.0.5',
    //     upgradeTo: '12.0.5',
    //     clusterStatus: 'Compliant',
    //     clusterUuid: '4f73f623-0197-4217-9069-50423a0cfef5',
    //   },
    //   {
    //     clusterName: 'sm-uxcn-c2',
    //     applicationName: 'UXCN',
    //     currentVersion: '11.5',
    //     upgradeTo: '12.0.5',
    //     clusterStatus: 'Needs Update',
    //     clusterUuid: '4f73f623-0197-4217-9069-50423a0cfef6',
    //   },
    // ];
    if (this.groupType === this.typeUnassigned.toLowerCase()) {
      this.groupName = 'Unassigned';
      this.customerId = undefined;
    } else {
      //TODO: get customer name from api
      this.groupName = 'Betty\'s Flower Shop';
      this.customerId = this.groupId;
    }

    //TODO: get swprofile info for the customer
    this.HcsUpgradeService.listClusters(this.customerId)
      .then((clusters: IHcsClusterSummaryItem[]) => {
        this.initClusterGridData(clusters);
      })
      .catch(() => {
        this.Notification.error('hcs.clustersList.errorGetClusters', { customerName: this.groupName });
      })
      .finally(() => {
        this.showGrid = true;
      });
    this.initUIGrid();
  }

  //TODO: q both the above promisses and once both are resolved, initiate initClusterGridData and populate data to grid.

  public initUIGrid() {
    // ColumnDefs for the customer list grid
    const columnDefs = [
      {
        field: 'clusterName',
        displayName: this.$translate.instant('hcs.upgrade.upgradeGroup.upgrade.gridColumn.clusters'),
        width: '20%',
        cellClass: 'cluster-grid-cell',
        headerCellClass: 'cluster-grid-header',
      }, {
        field: 'applicationName',
        displayName: this.$translate.instant('hcs.upgrade.upgradeGroup.upgrade.gridColumn.application'),
        width: '15%',
        cellClass: 'cluster-grid-cell',
        headerCellClass: 'cluster-grid-header',
      }, {
        field: 'currentVersion',
        displayName: this.$translate.instant('hcs.upgrade.upgradeGroup.upgrade.gridColumn.currentVersion'),
        width: '15%',
        cellClass: 'cluster-grid-cell',
        headerCellClass: 'cluster-grid-header',
      }, {
        field: 'upgradeTo',
        displayName: this.$translate.instant('hcs.upgrade.upgradeGroup.upgrade.gridColumn.upgradeTo'),
        width: '15%',
        cellClass: 'cluster-grid-cell',
        headerCellClass: 'cluster-grid-header',
      }, {
        field: 'clusterStatus',
        displayName: this.$translate.instant('hcs.upgrade.upgradeGroup.upgrade.gridColumn.status'),
        width: '15%',
        cellClass: 'cluster-grid-cell',
        headerCellClass: 'cluster-grid-header',
        cellTemplate: require('./templates/clusterStatusColumn.tpl.html'),
      }, {
        field: 'actions',
        displayName: this.$translate.instant('common.actions'),
        width: '20%',
        cellClass: 'cluster-grid-cell',
        headerCellClass: 'cluster-grid-header',
        cellTemplate: require('./templates/actionsColumn.tpl.html'),
      },
    ];

    this.gridOptions = {
      //gridOptions.data is populated directly by the functions supplying the data.
      appScopeProvider: this,
      rowHeight: 56,
      onRegisterApi: function (gridApi) {
        this.gridApi = gridApi;
      },
      columnDefs: this.gridColumns,
    };

    this.gridColumns = columnDefs;
    this.gridOptions.columnDefs = columnDefs;
  }

  public initClusterGridData(clusters: IHcsClusterSummaryItem[]): void {
    this.clusterGridData = [];
    _.forEach(clusters, (cluster: IHcsClusterSummaryItem) => {
      if (!_.isUndefined(cluster.nodes)) {
        _.forEach(cluster.nodes, (node: INodeSummaryItem) => {
          if (node.publisher) {
            const clusterGridRow: IUpgradeClusterGridRow = {
              clusterUuid: _.get(cluster, 'uuid'),
              clusterName: _.get(cluster, 'name'),
              applicationName: _.get(node, 'typeApplication'),
              //TODO: add application version after api is updated.
              currentVersion: '11.5',
              //TODO: add upgrade to after swProfile integration
              upgradeTo: '12.0.5',
              clusterStatus: _.get(cluster, 'clusterStatus'),
            };
            this.clusterGridData.push(clusterGridRow);
          }
        });
      }
    });
    this.gridOptions.data = this.clusterGridData;
  }

  public viewUpgradeStatus($event, cluster: IUpgradeClusterGridRow): void {
    $event.stopPropagation();

    this.$state.go('hcs.upgradeClusterStatus', { groupId: this.groupId, cluster: cluster, groupType: this.groupType, clusterId: cluster.clusterUuid });
  }
}
