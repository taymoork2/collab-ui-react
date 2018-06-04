import { IUpgradeClusterGridRow } from 'modules/hcs/hcs-shared';

export class UpgradeClusterStatusComponent implements ng.IComponentOptions {
  public controller = UpgradeClusterStatusCtrl;
  public template = require('./hcs-upgrade-cluster-status.component.html');
  public bindings = {
    groupId: '<',
    cluster: '<',
    clusterId: '<',
  };
}

export class UpgradeClusterStatusCtrl implements ng.IComponentController {
  public gridOptions;
  public gridColumns;
  private clusterGridData;
  public showGrid: boolean = false;
  public back: boolean = true;
  public groupId: string;
  public cluster: IUpgradeClusterGridRow;
  public clusterId: string;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
    private $state: ng.ui.IStateService,
  ) {}

  public $onInit(): void {
    //demo temp grid data
    this.clusterGridData = [
      {
        orderNumber: '1',
        nodeDetails: {
          name: 'CUCM-01',
          application: 'CUCM',
          isPublisher: true,
        },
        previousUpgradeTime: '00:59:00',
        startTime: '2018-05-04:00:29',
        nodeStatus: 'Needs Update',
        elapsedTime: '00:59:00',
      },
    ];
    this.initUIGrid();
    this.gridOptions.data = this.clusterGridData;
    this.showGrid = true;
  }

  public initUIGrid() {
    // ColumnDefs for the customer list grid
    const columnDefs = [
      {
        field: 'orderNumber',
        displayName: this.$translate.instant('hcs.upgrade.upgradeGroup.upgradeClusterStatus.gridColumn.order'),
        width: '10%',
        cellClass: 'cluster-grid-cell text-center',
        headerCellClass: 'cluster-grid-header align-center',
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
      }, {
        field: 'startTime',
        displayName: this.$translate.instant('hcs.upgrade.upgradeGroup.upgradeClusterStatus.gridColumn.startTime'),
        width: '15%',
        cellClass: 'cluster-grid-cell',
        headerCellClass: 'cluster-grid-header',
      }, {
        field: 'elapsedTime',
        displayName: this.$translate.instant('hcs.upgrade.upgradeGroup.upgradeClusterStatus.gridColumn.elapsedTime'),
        width: '15%',
        cellClass: 'cluster-grid-cell',
        headerCellClass: 'cluster-grid-header',
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
}
