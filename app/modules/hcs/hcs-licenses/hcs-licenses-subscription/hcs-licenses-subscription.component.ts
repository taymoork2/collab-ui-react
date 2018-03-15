// import { Config } from 'modules/core/config/config';
import { IGridApi } from 'ui-grid';
type ITab = {
  title: string;
  state: string;
};
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
    cellTemplate: '<cs-grid-cell row="row" grid="grid" cell-click-function="grid.appScope.clearRows()" cell-value="row.entity.customer"></cs-grid-cell>',
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
    sort: {
      direction: 'desc',
      priority: 0,
    },
    sortCellFiltered: true,
    width: '16.5%',
    headerCellTemplate: require('./templates/_headerTpl.html'),
    cellTemplate: '<cs-grid-cell row="row" grid="grid" cell-click-function="grid.appScope.clearRows()" cell-value="row.entity.standard"></cs-grid-cell>',
  }, {
    field: 'telepresence',
    displayName: this.$translate.instant('hcs.license.telepresence'),
    cellClass: 'telepresenceColumn',
    headerCellClass: 'subscriptionId',
    sort: {
      direction: 'desc',
      priority: 0,
    },
    sortCellFiltered: true,
    width: '16.5%',
    cellTemplate: '<cs-grid-cell row="row" grid="grid" cell-click-function="grid.appScope.clearRows()" cell-value="row.entity.telepresence"></cs-grid-cell>',
  }, {
    field: 'other',
    displayName: this.$translate.instant('hcs.license.other'),
    cellClass: 'otherColumn',
    headerCellClass: 'other',
    sort: {
      direction: 'desc',
      priority: 0,
    },
    sortCellFiltered: true,
    width: '16.5%',
    cellTemplate: '<cs-grid-cell row="row" grid="grid" cell-click-function="grid.appScope.clearRows()" cell-value="row.entity.other"></cs-grid-cell>',
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
  public placeholder;
  public filters;
  public sort;
  public currentCustomer;
  public gridOptions;
  public licenseSubscriptionList: any[] = [];
  public totalLicenses: any;
  public fieldLabel: string[];


  /* @ngInject */
  constructor(
    private $scope,
    private $timeout: ng.ITimeoutService,
    private $translate: ng.translate.ITranslateService,
    private Authinfo,
  ) {}

  public $onInit() {
    this.setGridOptions();
    this.loading = true;
    //To-Do Temp code until apis are ready
    this.totalLicenses = {
      hcs_standard: {
        used: 350,
        purchased: 1000,
      },
      hcs_telepresence: {
        used: 350,
        purchased: 1000,
      },
    };

    this.licenseSubscriptionList.push({
      customer: 'Arizona Diamondbacks',
      subscriptionId: 'Sub101123, Sub101111',
      standard: 100,
      telepresence: 5,
      other: 3,
      status: 'Valid',
    }, {
      customer: 'Atlanta Braves',
      subscriptionId: 'Sub101124',
      standard: 100,
      telepresence: 15,
      other: 3,
      status: 'Valid',
    }, {
      customer: 'Allen Eagles',
      subscriptionId: 'Sub101125',
      standard: 150,
      telepresence: 10,
      other: 3,
      status: 'Invalid',
    });

    this.getLicensesSubscription();
    this.loading = false;

    this.placeholder = {
      name: this.$translate.instant('hcs.license.all'),
      filterValue: 'all',
      count: 0,
    };

    this.filters = [{
      name: this.$translate.instant('hcs.license.valid'),
      filterValue: 'Valid',
    }, {
      name: this.$translate.instant('hcs.license.invalid'),
      filterValue: 'Invalid',
    }];

    this.sort = {
      by: 'customer',
      order: '-asc',
    };
    this.currentCustomer = {
      customerOrgId: this.Authinfo.getOrgId(),
    };

    this.title = this.$translate.instant('hcs.license.title');

    this.tabs = [{
      title: this.$translate.instant('hcs.license.perpetual'),
      state: 'hcs.subscription',
    }, {
      title: this.$translate.instant('hcs.license.subscriptions'),
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
        this.getLicensesSubscription();
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
      vm.getLicensesSubscription();
    }
  }

  public setFilter(filter) {
    if (this.activeFilter !== filter) {
      this.activeFilter = filter;
      this.getLicensesSubscription();
      this.currentDataPosition = 0;
    }
  }

  public getLicensesSubscription() {
    this.gridOptions.data = this.licenseSubscriptionList;
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
