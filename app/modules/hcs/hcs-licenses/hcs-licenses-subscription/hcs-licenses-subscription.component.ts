import { IGridApi } from 'ui-grid';
import { HcsCustomerLicense, HcsCustomerReport, IHcsCustomerReport, IHcsLicense } from 'modules/hcs/shared';
type ITab = {
  title: string;
  state: string;
};

interface IFilter {
  name: string;
  filterValue: string;
  count: number;
}

export class HcsLicensesSubscriptionCtrl implements ng.IComponentController {

  public loading: boolean = false;
  public loadData: boolean = true;
  public activeFilter: string = 'all';
  public gridRefresh: boolean = true;
  public currentDataPosition: number = 0;
  public searchStr: string = '';
  public gridApi: uiGrid.IGridApi;
  public timeoutVal: number = 1000;
  public timer: any = undefined;
  public tabs: ITab[];
  public title: string;
  public placeholder;
  public filters: IFilter[];
  public sort;
  public currentCustomer;
  public gridOptions;
  public licenses: HcsCustomerLicense[] = [];
  public licenseSubscriptionList: HcsCustomerReport[] = [];
  public fieldLabel: string[];

  public columnDefs = [{
    field: 'customer',
    displayName: this.$translate.instant('reportsPage.customer'),
    width: '20%',
    cellClass: 'customerColumn',
    headerCellClass: 'customer',
    sort: {
      direction: 'desc',
      priority: 0,
    },
    sortCellFiltered: true,
    cellTemplate: '<cs-grid-cell row="row" grid="grid" cell-click-function="grid.appScope.clearRows()" cell-value="row.entity.customerName"></cs-grid-cell>',
  }, {
    field: 'subscriptionId',
    displayName: this.$translate.instant('hcs.license.subscriptionId'),
    width: '20%',
    cellClass: 'subscriptionIdColumn',
    headerCellClass: 'subscriptionId',
    sort: {
      direction: 'desc',
      priority: 0,
    },
    sortCellFiltered: true,
    cellTemplate: '<cs-grid-cell row="row" grid="grid" cell-click-function="grid.appScope.clearRows()" cell-value="row.entity.subscriptionId"></cs-grid-cell>',
  }, {
    field: 'standard',
    displayName: this.$translate.instant('hcs.license.standard'),
    cellClass: 'standardColumn',
    headerCellClass: 'standard',
    sort: {
      direction: 'desc',
      priority: 0,
    },
    sortCellFiltered: true,
    width: '20%',
    cellTemplate: require('./templates/_standardTpl.html'),
  }, {
    field: 'foundation',
    displayName: this.$translate.instant('hcs.license.foundation'),
    cellClass: 'foundationColumn',
    headerCellClass: 'foundation',
    sort: {
      direction: 'desc',
      priority: 0,
    },
    sortCellFiltered: true,
    width: '20%',
    cellTemplate: require('./templates/_foundationTpl.html'),
  }, {
    field: 'displayField()',
    displayName: this.$translate.instant('hcs.license.status'),
    cellTemplate: require('./templates/_statusTpl.html'),
    sort: {
      direction: 'desc',
      priority: 0,
    },
    sortCellFiltered: true,
    cellClass: 'status',
    headerCellClass: 'status',
  }];


  /* @ngInject */
  constructor(
    private $scope,
    private $timeout: ng.ITimeoutService,
    private $translate: ng.translate.ITranslateService,
    private Authinfo,
  ) {}

  public $onInit() {
    this.placeholder = {
      name: this.$translate.instant('hcs.license.all'),
      filterValue: 'all',
      count: 0,
    };

    this.filters = [{
      name: this.$translate.instant('hcs.license.compliant'),
      filterValue: 'Compliant',
      count: 0,
    }, {
      name: this.$translate.instant('hcs.license.nonCompliant'),
      filterValue: 'Non-Compliant',
      count: 0,
    }];
    this.setGridOptions();
    this.loading = true;
    //TBD-- remove when Apis are ready
    this.licenses.push({
      partnerOrgId: '1234',
      customerId: '1236',
      customerOrgId: null,
      customerName: 'Arizona Diamondbacks',
      subscriptionList: [{
        id: 'Sub101123',
        licenseType: 'standard',
        ordered: 100,
      }, {
        id: 'Sub101123',
        licenseType: 'foundation',
        ordered: 100,
      }, {
        id: 'Sub101124',
        licenseType: 'basic',
        ordered: 100,
      }],
      plmList: [{
        plmId: 'PLMWest',
        plmName: 'PLMWest',
        violationsCount: 1,
      }],
      licenseList: [{
        licenseType: 'HCS_Basic',
        productType: 'CUCM',
        required: 10, //sum of usages for this license type for the products belonging to this customer.
        ordered: 100,
      }, {
        licenseType: 'HCS_Standard',
        productType: 'CUCM',
        required: 10, //sum of usages for this license type for the products belonging to this customer.
        ordered: 100,
      }, {
        licenseType: 'HCS_Foundation',
        productType: 'CUCM',
        required: 10, //sum of usages for this license type for the products belonging to this customer.
        ordered: 100,
      },
      ]}, {
        partnerOrgId: '1234',
        customerId: '1235',
        customerOrgId: null,
        customerName: 'Allen Eagles',
        subscriptionList: [{
          id: 'Sub101126',
          licenseType: 'standard',
          ordered: 100,
        }, {
          id: 'Sub101127',
          licenseType: 'foundation',
          ordered: 100,
        }, {
          id: 'Sub101127',
          licenseType: 'basic',
          ordered: 100,
        }],
        plmList: [{
          plmId: 'PLMWest',
          plmName: 'PLMWest',
          violationsCount: 0,
        }],
        licenseList: [{
          licenseType: 'HCS_Basic',
          productType: 'CUCM',
          required: 5, //sum of usages for this license type for the products belonging to this customer.
          ordered: 200,
        }, {
          licenseType: 'HCS_Standard',
          productType: 'CUCM',
          required: 0, //sum of usages for this license type for the products belonging to this customer.
          ordered: 20,
        }, {
          licenseType: 'HCS_Foundation',
          productType: 'CUCM',
          required: 10, //sum of usages for this license type for the products belonging to this customer.
          ordered: 100,
        }],
      });

    this.initCustomerLicenseReport();
    this.loading = false;

    this.sort = {
      by: 'customer',
      order: '-asc',
    };
    this.currentCustomer = {
      customerOrgId: this.Authinfo.getOrgId(),
    };

    this.title = this.$translate.instant('hcs.license.title');

    this.tabs = [{
      title: this.$translate.instant('hcs.license.plmReport.title'),
      state: 'hcs.plmReport',
    }, {
      title: this.$translate.instant('hcs.license.customerReport'),
      state: 'hcs.subscription',
    }];
  }

  public exportCsv() {
    // To-Do
  }

  public filterList(str) {
    if (this.timer) {
      this.$timeout.cancel(this.timer);
      this.timer = 0;
    }

    this.timer = this.$timeout(() => {
      if (str.length >= 3 || str === '') {
        this.searchStr = str;
        this.gridOptions.data = this.licenseSubscriptionList.filter(customer => _.includes(customer.customerName.toLowerCase(), str.toLowerCase()));
        this.currentDataPosition = 0;
      }
    }, this.timeoutVal);
  }

  public setGridOptions() {
    this.gridOptions = {
      data: [],
      appScopeProvider: this,
      showFilter: false,
      rowHeight: 44,
      useExternalSorting: false,
      noUnselect: true,
      onRegisterApi: (gridApi: IGridApi) => {
        this.gridApi = gridApi;
        gridApi.core.on.sortChanged(this.$scope, this.sortColumn);
      },
      columnDefs: this.columnDefs,
    };
  }

  public sortColumn(grid, sortColumns) {
    if (_.isUndefined(_.get(sortColumns, '[0]'))) {
      return;
    }

    const vm = grid.options.appScopeProvider;

    if (vm.loadData) {
      vm.loadData = false;
      const sortBy = sortColumns[0].name === 'displayField()' ? 'status' : sortColumns[0].name;
      const sortOrder = '-' + sortColumns[0].sort.direction;
      if (vm.sort.by !== sortBy || vm.sort.order !== sortOrder) {
        vm.sort.by = sortBy.toLowerCase();
        vm.sort.order = sortOrder.toLowerCase();
      }
      vm.getLicenseSubscription();
    }
  }

  public setFilter(filter) {
    if (this.activeFilter !== filter) {
      this.activeFilter = filter;
      if (this.activeFilter === 'all') {
        this.gridOptions.data = this.licenseSubscriptionList;
      } else {
        this.gridOptions.data = this.licenseSubscriptionList.filter(customer => this.activeFilter.toLowerCase() === customer.status.toLowerCase());
      }
      this.currentDataPosition = 0;
    }
  }

  public initCustomerLicenseReport(): void {
    _.each(this.licenses, (lic) => {
      const subIds = _.map(_.get(lic, 'subscriptionList'), sub => _.get(sub, 'id'));
      const licenses = _.get<IHcsLicense[]>(lic, 'licenseList');
      const licenseCust: IHcsCustomerReport = {
        customerName: _.get(lic, 'customerName'),
        subscriptionId: _.join(_.uniq(subIds), ', '),
        standard: _.find(licenses, { licenseType: 'HCS_Standard' }),
        foundation: _.find(licenses, { licenseType: 'HCS_Foundation' }),
        basic: _.find(licenses, { licenseType: 'HCS_Basic' }),
        telepresence: _.find(licenses, { licenseType: 'HCS_Telepresence' }),
        essential: _.find(licenses, { licenseType: 'HCS_Essential' }),
        status: (_.isUndefined(_.find(_.get(lic, 'plmList'), plm => plm.violationsCount > 0 ))) ? 'Compliant' : 'Non-Compliant',
      };
      this.licenseSubscriptionList.push(licenseCust);
    });
    this.gridOptions.data = this.licenseSubscriptionList;
    this.gridRefresh = false;
    this.placeholder.count = this.licenseSubscriptionList.length;
    this.filters[0].count = this.licenseSubscriptionList.filter(customer => 'compliant' === customer.status.toLowerCase()).length;
    this.filters[1].count = this.placeholder.count - this.filters[0].count;
  }

  public getLicenseSubscription(): void {
    if (!_.isEmpty(this.searchStr)) {
      this.gridOptions.data = _.filter(this.licenseSubscriptionList, lic => {
        return lic.customerName.toLowerCase().indexOf(this.searchStr.toLowerCase()) !== -1;
      });
    } else {
      this.gridOptions.data = this.licenseSubscriptionList;
    }
    this.gridRefresh = false;
    //TO-DO
  }

  public clearRows() {
    this.gridApi.selection.clearSelectedRows();
  }

}

export class HcsLicensesSubscriptionComponent implements ng.IComponentOptions {
  public controller = HcsLicensesSubscriptionCtrl;
  public template = require('modules/hcs/hcs-licenses/hcs-licenses-subscription/hcs-licenses-subscription.component.html');
  public bindings = {};
}
