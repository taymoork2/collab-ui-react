import { LinkingOperation } from './../account-linking.interface';

class LinkedSitesGridComponentCtrl implements ng.IComponentController {
  public gridApi;
  public siteInfo;
  public gridConfig;
  public loading: boolean = true;

  public sitesInfo: any;
  public onSiteSelectedFn: Function;

  public webexPage;

  private selectedRow;

  /* @ngInject */
  constructor(
    private $log: ng.ILogService,
    private $state,
  ) {
    this.$log.debug('LinkedSitesGridComponentCtrl constructor, sitesInfo:', this.sitesInfo);
    this.createGridConfig();
  }

  public $onChanges = (ch) => {
    if (ch.sitesInfo && ch.sitesInfo.currentValue) {
      this.sitesInfo = ch.sitesInfo.currentValue;
      this.gridConfig.data = this.sitesInfo;
      this.loading = !this.loading;
    }
  }

  public $onInit = () => {
    this.$log.debug('$onInit');
    this.$log.debug('onInit LinkedSitesGridComponentCtrl, sitesInfo:', this.sitesInfo);
  }

  private createGridConfig() {
    this.gridConfig = { excludeProperties: '__metadata' };
    this.gridConfig.enableRowHeaderSelection = false,
      this.gridConfig.enableFullRowSelection = true;
    this.gridConfig.enableColumnMenus = false;
    this.gridConfig.enableRowSelection = true;
    this.gridConfig.enableSorting = true;
    this.gridConfig.appScopeProvider = this;
    this.gridConfig.data = [];
    this.gridConfig.columnDefs = [
      { field: 'linkedSiteUrl', displayName: 'Site URL', enableColumnMenu: false },
      { field: 'accountLinkingStatus', displayName: 'Account Linking Status', enableColumnMenu: false },
      { field: 'usersLinked', displayName: 'Users Linked', enableColumnMenu: false },
    ];

    this.gridConfig.columnDefs.push({
      field: 'action',
      displayName: 'Action',
      cellTemplate: require('./actions.tpl.html'),
    });

    this.gridConfig.rowHeight = 45,
    this.gridConfig.multiSelect = false;
    this.gridConfig.modifierKeysToMultiSelect = false;
    this.gridConfig.noUnselect = true;
    this.gridConfig.onRegisterApi = function(gridApi) {
      this.gridApi = gridApi;
      this.gridApi.grid.element.on('click', (event) => {
        this.$log.debug('grid clicked', event);
        if (event.target.className.includes('ui-grid-cell-contents') || event.target.className.includes('grid-contents')) {
          if (this.selectedRow) {
            this.onSiteSelectedFn({ site: this.selectedRow.entity });
          }
        }
      });
      this.gridApi.selection.on.rowSelectionChanged.call(this, null, this.showDetails);
    }.bind(this);
    // this.gridConfig.data = this.sitesInfo;
  }

  public showDetails = (selectedRow) => {
    this.$log.debug('Clicked on grid, siteInfo:', selectedRow);
    this.selectedRow = selectedRow;
  }

  public modifyLinkingMethod(siteUrl) {
    this.$state.go('site-list.linked.details.wizard', { siteInfo: siteUrl, operation: LinkingOperation.Modify });
  }

  public gotoWebexListSitesPage(siteUrl) {
    this.$log.debug('selected site:', siteUrl);
    this.prepareLaunchButton(siteUrl, true);
  }

  public gotoWebexHomePage(siteUrl) {
    this.$log.debug('selected site:', siteUrl);
    this.prepareLaunchButton(siteUrl, false);
  }

  public showReports(siteUrl) {
    this.$state.go('reports.webex-metrics', { siteUrl: siteUrl });
  }

  private prepareLaunchButton(siteUrl, toSiteListPage) {

    this.webexPage = {
      siteUrl: siteUrl,
      toSiteListPage: toSiteListPage,
    };

    this.$log.debug(' webexPage', this.webexPage);
  }

  public readyToLaunch(buttonId) {
    this.$log.debug('ready to launch with buttonId', buttonId);
    angular.element('#' + buttonId).click();
  }

}

export class LinkedSitesGridComponent implements ng.IComponentOptions {

  /* @ngInject */
  constructor() {
  }

  public controller = LinkedSitesGridComponentCtrl;
  public template = require('modules/account-linking/sites-list/linked-sites-grid.component.html');

  public bindings = {
    sitesInfo: '<',
    onSiteSelectedFn: '&',
  };
}
