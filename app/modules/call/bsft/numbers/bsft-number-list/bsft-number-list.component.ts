import { IGridApi } from 'ui-grid';

interface IFilter {
  name: string;
  filterValue: string;
  count: number;
}

export class BsftNumberListCtrl implements ng.IComponentController {

  public loading: boolean = false;
  public activeFilter: string = 'all';
  public currentDataPosition: number = 0;
  public searchStr: string = '';
  public gridApi: uiGrid.IGridApi;
  public timeoutVal: number = 1000;
  public timer: any = undefined;
  public title: string;
  public placeholder;
  public filters: IFilter[];
  public sort;
  public currentCustomer;
  public gridOptions;
  public numberList;
  public fieldLabel: string[];
  public back: boolean = true;
  public backState: string = 'services-overview';

  public columnDefs = [{
    field: 'internalExt',
    displayName: this.$translate.instant('broadCloud.numberList.internalNum'),
    width: '15%',
    cellClass: 'internalExtensionColumn',
    headerCellClass: 'internalExt',
    sortCellFiltered: true,
    cellTemplate: '<cs-grid-cell row="row" grid="grid" cell-click-function="grid.appScope.clearRows()" cell-value="row.entity.internalExt"></cs-grid-cell>',
  }, {
    field: 'phoneNumber',
    displayName: this.$translate.instant('broadCloud.numberList.phoneNumber'),
    width: '15%',
    cellClass: 'phoneNumberColumn',
    headerCellClass: 'phoneNumber',
    sortCellFiltered: true,
    cellTemplate: '<cs-grid-cell row="row" grid="grid" cell-click-function="grid.appScope.clearRows()" cell-value="row.entity.phoneNumber"></cs-grid-cell>',
  }, {
    field: 'location',
    displayName: this.$translate.instant('broadCloud.numberList.location'),
    width: '30%',
    cellClass: 'locationColumn',
    headerCellClass: 'location',
    sortCellFiltered: true,
    cellTemplate: '<cs-grid-cell row="row" grid="grid" cell-click-function="grid.appScope.clearRows()" cell-value="row.entity.location"></cs-grid-cell>',
  }, {
    field: 'assignedTo',
    displayName: this.$translate.instant('broadCloud.numberList.assignedTo'),
    width: '30%',
    cellClass: 'assignedToColumn',
    headerCellClass: 'assignedTo',
    sort: {
      direction: 'desc',
      priority: 0,
    },
    sortCellFiltered: true,
    cellTemplate: require('./templates/_assignedToTpl.html'),
  }, {
    field: 'action',
    displayName: this.$translate.instant('broadCloud.numberList.actions'),
    width: '10%',
    sortCellFiltered: true,
    cellClass: 'action',
    headerCellClass: 'action',
    cellTemplate: require('./templates/_actionsTpl.html'),
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
      name: this.$translate.instant(''),
      filterValue: 'all',
      count: 0,
    };

    this.filters = [{
      name: this.$translate.instant('broadCloud.numberList.assigned'),
      filterValue: 'Assigned',
      count: 0,
    }, {
      name: this.$translate.instant('broadCloud.numberList.unassigned'),
      filterValue: 'unassigned',
      count: 0,
    }];
    this.setGridOptions();
    this.loading = false;

    this.currentCustomer = {
      customerOrgId: this.Authinfo.getOrgId(),
    };

    this.title = this.$translate.instant('');

  }

  public filterList(str) {
    if (this.timer) {
      this.$timeout.cancel(this.timer);
      this.timer = 0;
    }

    this.timer = this.$timeout(() => {
      if (str.length >= 3 || str === '') {
        this.searchStr = str;
        this.gridOptions.data = []; //to-do
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

    if (vm.loading) {
      vm.loading = false;
      const sortBy = sortColumns[0].name === 'assignedTo' ? 'assignedTo' : sortColumns[0].name;
      const sortOrder = '-' + sortColumns[0].sort.direction;
      if (vm.sort.by !== sortBy || vm.sort.order !== sortOrder) {
        vm.sort.by = sortBy.toLowerCase();
        vm.sort.order = sortOrder.toLowerCase();
      }
    }
  }

  public canShowActionsMenu(): void {
    return this.canShowPhoneNumberDelete();
  }

  public canShowPhoneNumberDelete(): void {
  }

  public deletePhoneNumber(): void {

  }

  public setFilter(filter) {
    if (this.activeFilter !== filter) {
      this.activeFilter = filter;
      if (this.activeFilter === 'all') {
        this.gridOptions.data = this.numberList;
      } else {
        this.gridOptions.data = this.numberList.filter(customer => this.activeFilter.toLowerCase() === customer.status.toLowerCase());
      }
      this.currentDataPosition = 0;
    }
  }
}

export class BsftNumberListComponent implements ng.IComponentOptions {
  public controller = BsftNumberListCtrl;
  public template = require('./bsft-number-list.component.html');
  public bindings = {};
}
