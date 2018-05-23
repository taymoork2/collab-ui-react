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
  public groupType: string;
  private clusterGridData;
  public showGrid: boolean = false;
  public tabs: IHeaderTab[] = [];
  public back: boolean = true;
  public backState: string = 'hcs.shared.inventoryList';

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
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
    this.clusterGridData = [
      {
        clusterName: 'sm-cucm-c1',
        applicationName: 'CUCM',
        currentVersion: '11.5',
        upgradeTo: '12.0.5',
        clusterStatus: 'Needs Update',
        id: '4f73f623-0197-4217-9069-50423a0cfef3',
        selected: false,
      },
      {
        clusterName: 'sm-imp-c1',
        applicationName: 'IM&P',
        currentVersion: '11.5',
        upgradeTo: '12.0.5',
        clusterStatus: 'Needs Update',
        id: '4f73f623-0197-4217-9069-50423a0cfef4',
        selected: false,
      },
      {
        clusterName: 'sm-expr-c1',
        applicationName: 'EXPR',
        currentVersion: '12.0.5',
        upgradeTo: '12.0.5',
        clusterStatus: 'Compliant',
        id: '4f73f623-0197-4217-9069-50423a0cfef5',
        selected: false,
      },
      {
        clusterName: 'sm-uxcn-c2',
        applicationName: 'UXCN',
        currentVersion: '11.5',
        upgradeTo: '12.0.5',
        clusterStatus: 'Needs Update',
        id: '4f73f623-0197-4217-9069-50423a0cfef6',
        selected: false,
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
        field: 'clusterName',
        displayName: this.$translate.instant('hcs.upgrade.upgradeGroup.upgrade.gridColumn.clusters'),
        width: '25%',
        cellClass: 'cluster-grid-cell',
        headerCellClass: 'cluster-grid-header',
      }, {
        field: 'applicationName',
        displayName: this.$translate.instant('hcs.upgrade.upgradeGroup.upgrade.gridColumn.application'),
        width: '17%',
        cellClass: 'cluster-grid-cell',
        headerCellClass: 'cluster-grid-header',
      }, {
        field: 'currentVersion',
        displayName: this.$translate.instant('hcs.upgrade.upgradeGroup.upgrade.gridColumn.currentVersion'),
        width: '16%',
        cellClass: 'cluster-grid-cell',
        headerCellClass: 'cluster-grid-header',
      }, {
        field: 'upgradeTo',
        displayName: this.$translate.instant('hcs.upgrade.upgradeGroup.upgrade.gridColumn.upgradeTo'),
        width: '16%',
        cellClass: 'cluster-grid-cell',
        headerCellClass: 'cluster-grid-header',
      }, {
        field: 'clusterStatus',
        displayName: this.$translate.instant('hcs.upgrade.upgradeGroup.upgrade.gridColumn.status'),
        width: '17%',
        cellClass: 'cluster-grid-cell',
        headerCellClass: 'cluster-grid-header',
        cellTemplate: require('./templates/clusterStatusColumn.tpl.html'),
      }, {
        field: 'actions',
        displayName: this.$translate.instant('common.actions'),
        width: '9%',
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
}
