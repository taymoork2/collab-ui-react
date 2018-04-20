import { IToolkitModalService } from 'modules/core/modal';
import { Notification } from 'modules/core/notifications';
import { TelephonyDomainService } from './telephonyDomain.service';

export interface IGridApiScope extends ng.IScope {
  gridApi?: uiGrid.IGridApi;
}

class TelephonyDomains implements ng.IComponentController {

  public gridData: any[] = [];
  public gridData_: any[] = []; // the data source for search
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
    private $scope: IGridApiScope,
    private Notification: Notification,
    private $filter: ng.IFilterService,
    private $state: ng.ui.IStateService,
    private $timeout: ng.ITimeoutService,
    private $modal: IToolkitModalService,
    private $rootScope: ng.IRootScopeService,
    private $stateParams: ng.ui.IStateParamsService,
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
    const deregister = this.$rootScope.$on('tdUpdated', () => {
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
    this.gemService.setStorage('currentTelephonyDomain', {});
    this.$modal.open({
      type: 'full',
      template: '<gm-td-modal-request dismiss="$dismiss()" close="$close()" class="new-field-modal"></gm-td-modal-request>',
    }).result.then(() => {
      this.$state.go('gmTdNumbersRequest');
    });
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
    const info = {
      tds: this.gridData_,
      customerId: this.customerId,
      ccaDomainId: item.ccaDomainId,
      domainName: item.domainName,
    };
    this.$state.go('gmTdDetails', { info: info });
  }

  private initParameters(): void {
    if (!this.customerId) {
      const customerId = this.gemService.getStorage('gmCustomerId');
      const companyName = this.gemService.getStorage('gmCompanyName');
      this.$state.go('gem.base.tds', { companyName: companyName, customerId: customerId });
      return;
    }

    this.customerId = this.customerId && this.gemService.setStorage('gmCustomerId', this.customerId);
    this.companyName = this.companyName && this.gemService.setStorage('gmCompanyName', this.companyName);

    this.setGridData();
  }

  private setGridData(): void {
    this.TelephonyDomainService.getTelephonyDomains(this.customerId)
      .then((res: any[]) => {
        _.forEach(res, (item) => {
          const text = 'N/A';
          const text_ = (item.backupBridgeName || 'N/A') + ' + ' + (item.primaryBridgeName || 'N/A');

          item.domainName = item.telephonyDomainName || item.domainName;
          item.totalSites = item.telephonyDomainSites.length;
          item.bridgeSet = (!item.primaryBridgeName && !item.backupBridgeName) ? text : text_;
          item.status_ = (item.status ? this.$translate.instant('gemini.cbgs.field.status.' + item.status) : '');
        });
        this.gridData = this.gridData_ = res;
      })
      .catch((err) => {
        this.Notification.errorResponse(err, 'errors.statusError', { status: err.status });
      })
      .finally(() => {
        this.gridRefresh = false;
      });
  }

  private setGridOptions(): void {
    const columnDefs = [{
      width: '30%',
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
      width: '12%',
      field: 'status',
      displayName: this.$translate.instant('gemini.cbgs.field.status_'),
      cellTemplate: require('modules/gemini/callbackGroup/cbgsStatus.tpl.html'),
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
  public template = require('modules/gemini/telephonyDomain/telephonyDomains.html');
}
