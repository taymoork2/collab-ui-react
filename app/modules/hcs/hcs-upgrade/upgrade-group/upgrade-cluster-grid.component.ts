export class UpgradeClusterGridComponent implements ng.IComponentOptions {
  public controller = UpgradeClusterGridCtrl;
  public template = require('./upgrade-cluster-grid.component.html');
  public bindings = {
    customerId: '<',
  };
}

export class UpgradeClusterGridCtrl implements ng.IComponentController {
  public gridOptions;
  public gridColumns;
  public customerId: string;
  private clusterGridData;
  public showGrid: boolean = false;

  /* @ngInject */
  constructor(
    private $translate: ng.translate.ITranslateService,
  ) {}

  public $onInit() {
    //demo temp grid data
    this.clusterGridData = [
      {
        clusterName: 'sm-cucm-c1',
        currentVersion: '11.5',
        upgradeTo: '12.0.5',
        clusterStatus: 'Needs Update',
        id: '4f73f623-0197-4217-9069-50423a0cfef3',
        selected: false,
      },
      {
        clusterName: 'sm-imp-c1',
        currentVersion: '11.5',
        upgradeTo: '12.0.5',
        clusterStatus: 'Needs Update',
        id: '4f73f623-0197-4217-9069-50423a0cfef4',
        selected: false,
      },
      {
        clusterName: 'sm-expr-c1',
        currentVersion: '12.0.5',
        upgradeTo: '12.0.5',
        clusterStatus: 'Compliant',
        id: '4f73f623-0197-4217-9069-50423a0cfef5',
        selected: false,
      },
      {
        clusterName: 'sm-uxcn-c2',
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
        type: 'boolean',
        displayName: this.$translate.instant('hcs.upgrade.upgradeGroup.upgrade.gridColumn.clusters'),
        width: '25%',
        cellClass: 'cluster-grid-cell',
        headerCellClass: 'cluster-grid-header',
        cellTemplate: require('./templates/clusterNameColumn.tpl.html'),
      }, {
        field: 'currentVersion',
        displayName: this.$translate.instant('hcs.upgrade.upgradeGroup.upgrade.gridColumn.currentVersion'),
        width: '25%',
        cellClass: 'cluster-grid-cell text-center',
        headerCellClass: 'align-center cluster-grid-header',
      }, {
        field: 'upgradeTo',
        displayName: this.$translate.instant('hcs.upgrade.upgradeGroup.upgrade.gridColumn.upgradeTo'),
        width: '25%',
        cellClass: 'cluster-grid-cell text-center',
        headerCellClass: 'align-center cluster-grid-header',
      }, {
        field: 'clusterStatus',
        displayName: this.$translate.instant('hcs.upgrade.upgradeGroup.upgrade.gridColumn.status'),
        width: '25%',
        cellClass: 'cluster-grid-cell',
        headerCellClass: 'cluster-grid-header',
        cellTemplate: require('./templates/clusterStatusColumn.tpl.html'),
      },
    ];

    this.gridOptions = {
      //gridOptions.data is populated directly by the functions supplying the data.
      appScopeProvider: this,
      rowHeight: 40,
      onRegisterApi: function (gridApi) {
        this.gridApi = gridApi;
      },
      columnDefs: this.gridColumns,
    };

    this.gridColumns = columnDefs;
    this.gridOptions.columnDefs = columnDefs;
  }
}
