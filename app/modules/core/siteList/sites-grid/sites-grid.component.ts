class SitesGridComponentCtrl implements ng.IComponentController {
  public loading: boolean;
  public sites: any;
  // TODO: Figure out why cs-grid `state` property must be set in template
  // and not in a $ctrl property in order for stateChange to be triggered
  // public state: string;
  public onSiteSelected: Function;

  public gridApi;
  public gridConfig;

  /* @ngInject */
  constructor(
    private $translate,
    private uiGridConstants: uiGrid.IUiGridConstants,
  ) {
  }

  public $onInit() {
    this.configureGrid();
  }

  public $onChanges(changes: {[bindings: string]: ng.IChangesObject<any>}) {
    if (changes.sites && changes.sites.currentValue && !changes.sites.isFirstChange()) {
      this.sites = changes.sites.currentValue;
      this.gridConfig.data = this.sites;
      this.gridApi.core.notifyDataChange(this.uiGridConstants.dataChange.ALL);
    }
  }

  public deselectRow() {
    this.gridApi.selection.clearSelectedRows();
  }

  private configureGrid() {
    this.gridConfig = { excludeProperties: '__metadata' };
    this.gridConfig.enableRowHeaderSelection = false;
    this.gridConfig.enableFullRowSelection = true;
    this.gridConfig.enableColumnMenus = false;
    this.gridConfig.enableRowSelection = true;
    this.gridConfig.appScopeProvider = this;
    this.gridConfig.data = this.sites || [];
    this.gridConfig.rowHeight = 45,
    this.gridConfig.multiSelect = false;
    this.gridConfig.modifierKeysToMultiSelect = false;
    this.gridConfig.noUnselect = true;

    this.gridConfig.columnDefs = this.makeGridColumns();

    this.gridConfig.onRegisterApi = (gridApi) => {
      this.gridApi = gridApi;
      gridApi.selection.on.rowSelectionChanged.call(this, null, (selectedRow) => {
        this.onSiteSelected({ site: selectedRow.entity });
      });
    };
  }

  private makeGridColumns(): uiGrid.IColumnDef[] {
    return [
      {
        field: 'siteUrl',
        displayName: this.$translate.instant('siteList.siteName'),
        width: '25%',
      },
      {
        field: 'siteConfLicenses',
        displayName: this.$translate.instant('siteList.licenseTypes'),
        cellTemplate: require('modules/core/siteList/siteLicenseTypesColumn.tpl.html'),
        width: '17%',
      },
      {
        field: 'license.billingServiceId',
        displayName: this.$translate.instant('siteList.subscriptionId'),
        width: '15%',
      },
      {
        field: 'siteActions',
        displayName: '',
        cellTemplate: require('modules/core/siteList/siteActionsColumn.tpl.html'),
      },
    ];
  }

}

export class SitesGridComponent implements ng.IComponentOptions {

  public controller = SitesGridComponentCtrl;
  public template = require('./sites-grid.html');

  public bindings = {
    loading: '<',
    sites: '<',
    state: '<',
    onSiteSelected: '&',
  };
}
