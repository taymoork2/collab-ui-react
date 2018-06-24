import { HcsUpgradeService, IHcsClusterTask, IHcsCluster, INodeTaskStatus, IClusterStatusGridRow, INodeTaskGridRow } from 'modules/hcs/hcs-shared';
import { Notification } from 'modules/core/notifications';
import { GridService } from 'modules/core/csgrid';

export class UpgradeClusterStatusComponent implements ng.IComponentOptions {
  public controller = UpgradeClusterStatusCtrl;
  public template = require('./hcs-upgrade-cluster-status.component.html');
  public bindings = {
    groupId: '<',
    clusterId: '<',
  };
}

export class UpgradeClusterStatusCtrl implements ng.IComponentController {
  public gridOptions;
  public gridColumns;
  private clusterGridData: IClusterStatusGridRow[];
  public showGrid: boolean = false;
  public back: boolean = true;
  public groupId: string;
  public cluster: IHcsCluster;
  public clusterId: string;
  public clusterStatus: string;
  public estCompletionTime: any;
  public clusterStatuses;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private $state: ng.ui.IStateService,
    private HcsUpgradeService: HcsUpgradeService,
    private Notification: Notification,
    private GridService: GridService,
  ) {}

  public $onInit(): void {
    this.showGrid = false;
    this.initCluster();
    this.initClusterStatuses();
    this.initUIGrid();
  }

  public getNodeStatus(entity) {
    //TODO: samwi - fix when inventory is available
    this.$state.go('hcs.sidePanel', { node: entity, status: this.clusterStatuses[Object.keys(this.clusterStatuses)[0]] });
  }

  public selectRow(grid, row) {
    this.GridService.selectRow(grid, row);
    this.getNodeStatus(row.entity);
  }

  public initCluster() {
    this.HcsUpgradeService.getCluster(this.clusterId)
      .then((cluster: IHcsCluster) => {
        this.cluster = cluster;
      })
      .catch((err) => this.Notification.errorWithTrackingId(err, err.data.errors[0].message));

    this.HcsUpgradeService.getPrecheckStatus(this.clusterId).then(cluster => {
      this.clusterStatuses = cluster.statusChecks;
    });
  }

  public initClusterStatuses(): void {
    this.HcsUpgradeService.getClusterTasksStatus(this.clusterId)
      .then((clusterSatuses: IHcsClusterTask) => {
        this.formatClusterStatusGridData(clusterSatuses);
      })
      .catch((err) => this.Notification.errorWithTrackingId(err, err.data.errors[0].message));
  }
  public initUIGrid(): void {
    // ColumnDefs for the customer list grid
    const columnDefs = [
      {
        field: 'orderNumber',
        displayName: this.$translate.instant('hcs.upgrade.upgradeGroup.upgradeClusterStatus.gridColumn.order'),
        width: '10%',
        cellClass: 'cluster-grid-cell text-center',
        headerCellClass: 'cluster-grid-header align-center',
        cellTemplate: '<cs-grid-cell row="row" grid="grid" cell-click-function="grid.appScope.getNodeStatus(row.entity)" cell-value="row.entity.orderNumber"></cs-grid-cell>',
      }, {
        field: 'nodeDetails',
        displayName: this.$translate.instant('sidePanelBreadcrumb.node'),
        width: '20%',
        cellClass: 'cluster-grid-cell',
        headerCellClass: 'cluster-grid-header',
        cellTemplate: require('./templates/nodeDetailsColumn.tpl.html'),
      }, {
        field: 'previousUpgradeTime',
        displayName: this.$translate.instant('hcs.upgrade.upgradeGroup.upgradeClusterStatus.gridColumn.previousUpgradeDuration'),
        width: '15%',
        cellClass: 'cluster-grid-cell',
        headerCellClass: 'cluster-grid-header',
        cellTemplate: '<cs-grid-cell row="row" grid="grid" cell-click-function="grid.appScope.getNodeStatus(row.entity)" cell-value="row.entity.previousUpgradeTime"></cs-grid-cell>',
      }, {
        field: 'startTime',
        displayName: this.$translate.instant('hcs.upgrade.upgradeGroup.upgradeClusterStatus.gridColumn.startTime'),
        width: '15%',
        cellClass: 'cluster-grid-cell',
        headerCellClass: 'cluster-grid-header',
        cellTemplate: '<cs-grid-cell row="row" grid="grid" cell-click-function="grid.appScope.getNodeStatus(row.entity)" cell-value="row.entity.startTime"></cs-grid-cell>',
      }, {
        field: 'elapsedTime',
        displayName: this.$translate.instant('hcs.upgrade.upgradeGroup.upgradeClusterStatus.gridColumn.elapsedTime'),
        width: '15%',
        cellClass: 'cluster-grid-cell',
        headerCellClass: 'cluster-grid-header',
        //TODO: samwi - fix when inventory is available
        cellTemplate: '<cs-grid-cell row="row" grid="grid" cell-click-function="grid.appScope.getNodeStatus(row.entity)" cell-value="row.entity.elapsedTime"></cs-grid-cell>',
      }, {
        field: 'nodeStatus',
        displayName: this.$translate.instant('hcs.upgrade.upgradeGroup.upgrade.gridColumn.status'),
        width: '25%',
        cellClass: 'cluster-grid-cell',
        headerCellClass: 'cluster-grid-header',
        cellTemplate: require('./templates/nodeStatusColumn.tpl.html'),
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

  public onBack(): void {
    this.$state.go('hcs.upgradeCluster', { groupId: this.groupId });
  }

  public formatClusterStatusGridData(clusterSatuses: IHcsClusterTask): void {
    this.clusterGridData = [];
    this.clusterStatus = clusterSatuses.status;
    this.estCompletionTime = clusterSatuses.estimatedCompletion;
    _.forEach(clusterSatuses.nodeStatuses, (nodeTask: INodeTaskStatus) => {
      const nodeDetail: INodeTaskGridRow = {
        name: nodeTask.hostName,
        application: nodeTask.typeApplication,
        isPublisher: nodeTask.publisher,
      };
      const clusterStatusGridRow: IClusterStatusGridRow = {
        orderNumber: nodeTask.order,
        nodeDetails: nodeDetail,
        previousUpgradeTime: nodeTask.previousDuration,
        startTime: nodeTask.started,
        nodeStatus: nodeTask.status,
        elapsedTime: nodeTask.elapsedTime,
      };
      this.clusterGridData.push(clusterStatusGridRow);
      this.gridOptions.data = this.clusterGridData;
      this.showGrid = true;
    });

  }
}
