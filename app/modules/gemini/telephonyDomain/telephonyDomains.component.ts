import { TelephonyDomainService } from './telephonyDomain.service';
import { Notification } from '../../core/notifications/notification.service';

export interface IGridApiScope extends ng.IScope {
  gridApi?: uiGrid.IGridApi;
}

class TelephonyDomains implements ng.IComponentController {

  public gridData = [];
  public gridData_ = []; // the data source for search
  public gridOptions = {};
  public searchStr: string;
  public gridRefresh = true;
  public customerId: string;
  public companyName: string;
  public placeholder: string;
  public exportLoading = false;

  /* @ngInject */
  public constructor(
    private gemService,
    private $stateParams,
    private $scope: IGridApiScope,
    private $rootScope: ng.IRootScopeService,
    private Notification: Notification,
    private $filter: ng.IFilterService,
    private $state: ng.ui.IStateService,
    private $timeout: ng.ITimeoutService,
    private $templateCache: ng.ITemplateCacheService,
    private $translate: ng.translate.ITranslateService,
    private TelephonyDomainService: TelephonyDomainService,
  ) {
    this.customerId = _.get(this.$stateParams, 'customerId', '');
    this.companyName = _.get(this.$stateParams, 'companyName', '');
    this.placeholder = this.$translate.instant('gemini.cbgs.placeholder-text');
  }

  public $onInit(): void {
    this.listenTdUpdated();

    this.initParameters();
    this.setGridOptions();
    this.$scope.$emit('headerTitle', this.companyName);
  }

  private listenTdUpdated(): void {
    let deregister = this.$rootScope.$on('tdUpdated', () => {
      this.gridData = [];
      this.gridRefresh = true;
      this.setGridData();
      this.setGridOptions();
    });
    this.$scope.$on('$destroy', deregister);
  }

  public filterList(searchStr: string) {
    let timeout;
    this.gridRefresh = true;
    this.searchStr = searchStr;
    this.$timeout.cancel(timeout); // _.debounce ,it's hard to do unit test, so i replace $timeout;
    timeout = this.$timeout(() => {
      this.gridRefresh = false;
    }, 350);

    this.gridData = this.$filter('filter')(this.gridData_, this.searchStr);
  }

  public onRequest() {
    // TODO DO in next sprint
  }

  public exportCSV() {
    this.exportLoading = true;
    return this.TelephonyDomainService.telephonyDomainsExportCSV(this.customerId).then((res) => {
      this.Notification.success('gemini.tds.export.result.success');
      return res;
    }).catch((res) => {
      this.Notification.errorResponse(res, 'gemini.tds.export.result.failed');
    }).finally(() => {
      this.$timeout(() => {
        this.exportLoading = false;
      }, 1500);
    });
  }

  public showDetail(item) {
    let info = {
      tds: this.gridData_,
      customerId: this.customerId,
      ccaDomainId: item.ccaDomainId,
      domainName: item.domainName,
    };
    this.$state.go('gmTdDetails', { info: info });
  }

  private initParameters(): void {
    if (!this.customerId) {
      let customerId = this.gemService.getStorage('gmCustomerId');
      let companyName = this.gemService.getStorage('gmCompanyName');
      this.$state.go('gem.base.tds', { companyName: companyName, customerId: customerId });
      return;
    }

    this.customerId = this.customerId && this.gemService.setStorage('gmCustomerId', this.customerId);
    this.companyName = this.companyName && this.gemService.setStorage('gmCompanyName', this.companyName);

    this.setGridData();
  }

  private setGridData(): void {
    this.TelephonyDomainService.getTelephonyDomains(this.customerId)
      .then((res) => {
        if (_.get(res, 'content.data.returnCode')) {
          this.Notification.error('error'); //TODO Wording
        }

        let data: any = _.get(res, 'content.data.body');
        _.forEach(data, (item) => {
          let text = 'N/A';
          let text_ = (item.backupBridgeName || 'N/A') + ' + ' + (item.primaryBridgeName || 'N/A');

          item.domainName = item.telephonyDomainName || item.domainName;
          item.totalSites = item.telephonyDomainSites.length;
          item.bridgeSet = (!item.primaryBridgeName && !item.backupBridgeName) ? text : text_;
          item.webDomainName = !item.webDomainName ? text : item.webDomainName;
          item.status_ = (item.status ? this.$translate.instant('gemini.cbgs.field.status.' + item.status) : '');
        });
        this.gridData = this.gridData_ =  data;
        this.gridRefresh = false;
      })
      .catch((err) => {
        this.Notification.errorResponse(err, 'errors.statusError', { status: err.status });
      });
  }

  private setGridOptions(): void {
    let columnDefs = [{
      width: '18%',
      sortable: true,
      cellTooltip: true,
      field: 'domainName',
      displayName: this.$translate.instant('gemini.tds.field.telephonyDomains'),
    }, {
      width: '16%',
      sortable: true,
      field: 'totalSites',
      cellClass: 'text-right',
      sort: { direction: 'asc', priority: 0 },
      displayName: this.$translate.instant('gemini.tds.field.totalSites'),
    }, {
      width: '16%',
      cellTooltip: true,
      field: 'bridgeSet',
      displayName: this.$translate.instant('gemini.tds.field.bridgeSet'),
    }, {
      width: '16%',
      cellTooltip: true,
      field: 'webDomainName',
      displayName: this.$translate.instant('gemini.tds.field.webDomain'),
    }, {
      width: '12%',
      field: 'status',
      displayName: this.$translate.instant('gemini.cbgs.field.status_'),
      cellTemplate: this.$templateCache.get('modules/gemini/callbackGroup/cbgsStatus.tpl.html'),
    }, {
      field: 'customerAttribute',
      cellTooltip: true,
      displayName: this.$translate.instant('gemini.tds.field.partnerTdName'),
    }];

    this.gridOptions = {
      rowHeight: 44,
      data: '$ctrl.gridData',
      multiSelect: false,
      columnDefs: columnDefs,
      enableColumnMenus: false,
      enableColumnResizing: true,
      enableRowHeaderSelection: false,
      onRegisterApi: (gridApi) => {
        this.$scope.gridApi = gridApi;
        gridApi.selection.on.rowSelectionChanged(this.$scope, (row) => {
          this.showDetail(row.entity);
        });
      },
    };
  }
}

export class TelephonyDomainsComponent implements ng.IComponentOptions {
  public controller = TelephonyDomains;
  public templateUrl = 'modules/gemini/telephonyDomain/telephonyDomains.html';
}
