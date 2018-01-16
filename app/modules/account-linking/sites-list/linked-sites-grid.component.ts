import { LinkingOperation } from './../account-linking.interface';
import { IACSiteInfo } from './../account-linking.interface';

class LinkedSitesGridComponentCtrl implements ng.IComponentController {
  public gridApi;
  public siteInfo;
  public gridConfig;
  public loading: boolean = true;

  public sitesInfo: any;
  public onSiteSelectedFn: Function;
  public launchWebexFn: Function;
  public webexPage;

  private selectedRow;

  /* @ngInject */
  constructor(
    private $log: ng.ILogService,
    private $state: ng.ui.IStateService,
    //private $rootScope: ng.IRootScopeService,
    private $translate,
    private uiGridConstants: uiGrid.IUiGridConstants,
  ) {
    this.$log.debug('LinkedSitesGridComponentCtrl constructor, sitesInfo:', this.sitesInfo);
  }

  public $onChanges = (ch: {[bindings: string]: ng.IChangesObject<any>}) => {
    if (ch.sitesInfo && ch.sitesInfo.currentValue) {
      this.sitesInfo = ch.sitesInfo.currentValue;
      this.gridConfig.data = this.sitesInfo;
      this.loading = !this.loading;
      this.gridApi.core.notifyDataChange(this.uiGridConstants.dataChange.ALL);
    }
  }

  public $onInit = () => {
    this.$log.debug('$onInit');
    this.$log.debug('onInit LinkedSitesGridComponentCtrl, sitesInfo:', this.sitesInfo);
    this.createGridConfig();
  }

  private createGridConfig() {
    this.gridConfig = { excludeProperties: '__metadata' };
    this.gridConfig.enableRowHeaderSelection = false;
    this.gridConfig.enableFullRowSelection = true;
    this.gridConfig.enableColumnMenus = false;
    this.gridConfig.enableRowSelection = true;
    this.gridConfig.enableSorting = true;
    this.gridConfig.appScopeProvider = this;
    this.gridConfig.data = [];
    this.gridConfig.columnDefs = [
      {
        field: 'linkedSiteUrl',
        displayName: this.$translate.instant('accountLinking.grid.header.siteUrl'),
        enableColumnMenu: false,
        sort: {
          direction: this.uiGridConstants.ASC,
          priority: 0,
        },
      },
      {
        field: 'linkingMode',
        displayName: this.$translate.instant('accountLinking.grid.header.accountLinkingMode'),
        enableColumnMenu: false,
        cellTemplate: require('./linking-mode.tpl.html'),
        sort: {
          direction: this.uiGridConstants.ASC,
          priority: 1,
        },
      },
      {
        field: 'usersLinkedToTotal',
        displayName: this.$translate.instant('accountLinking.grid.header.linkedAccounts'),
        cellTemplate: require('./linked-accounts.tpl.html'),
        enableColumnMenu: false,
        sortingAlgorithm: (_a: any, _b: any, rowA: any, rowB: any, dir: any): number => {
          return this.sortLinkedAccounts(rowA, rowB, dir);
        },
        sort: {
          direction: this.uiGridConstants.ASC,
          priority: 2,
          ignoreSort: true,
        },
      },
      {
        field: 'action',
        displayName: this.$translate.instant('accountLinking.grid.header.action'),
        cellTemplate: require('./actions.tpl.html'),
        enableColumnMenu: false,
        enableSorting: false,
      },
    ];

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
  }

  public showDetails = (selectedRow) => {
    this.$log.debug('Clicked on grid, siteInfo:', selectedRow);
    this.selectedRow = selectedRow;
  }

  public modifyLinkingMethod(siteInfo) {
    this.$state.go('site-list.linked.details.wizard', {
      siteInfo: siteInfo, //TODO: url or the whole object ????
      operation: LinkingOperation.Modify,
      launchWebexFn: this.launchWebexFn,
    });
  }

  public allowModifyingLinkingMode(selectedRowInfo: IACSiteInfo): boolean {
    return selectedRowInfo.isSiteAdmin === true;
  }

  public gotoWebexListSitesPage(siteInfo) {
    this.$log.info('Launch Webex site admin from grid list for site', siteInfo);
    this.launchWebexFn({ site: siteInfo, useHomepage: false });
  }

  public gotoWebexHomePage(siteInfo) {
    this.$log.debug('selected site:', siteInfo);
    this.launchWebexFn({
      site: siteInfo,
      useHomepage: true,
      launchWebexFn: this.launchWebexFn,
    });
  }

  public showReports(siteInfo) {
    this.$state.go('reports.webex-metrics', { siteUrl: siteInfo.siteUrl });
  }

  private sortLinkedAccounts(rowA: any, rowB: any, _dir: any): number {
    const aCalc: number = rowA.entity.linkingStatus.accountsLinked / rowA.entity.linkingStatus.totalWebExAccounts;
    const bCalc: number = rowB.entity.linkingStatus.accountsLinked / rowB.entity.linkingStatus.totalWebExAccounts;
    if (aCalc < bCalc) {
      return -1;
    }
    if (aCalc === bCalc) {
      return 0;
    }
    return 1;
  }

}

export class LinkedSitesGridComponent implements ng.IComponentOptions {

  public controller = LinkedSitesGridComponentCtrl;
  public template = require('modules/account-linking/sites-list/linked-sites-grid.component.html');

  public bindings = {
    sitesInfo: '<',
    onSiteSelectedFn: '&',
    launchWebexFn: '&',
  };
}
