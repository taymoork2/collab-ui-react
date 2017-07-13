export class ProvisioningController {

  private results: any[];
  private tabs: Object[];
  private timer: any;
  private completedResults: any;
  private pendingProgress: any;
  private gridOptions: any;

  /* @ngInject */
  constructor(
    private $scope: ng.IScope,
    private $state: ng.ui.IStateService,
    private $templateCache: ng.ITemplateCacheService,
    private $timeout: ng.ITimeoutService,
    private $translate: ng.translate.ITranslateService,
    private ProvisioningService) {
    this.init();
  }

  private init(): void {
    /*
    * Get order data from the api.
    */
    this.results = this.getOrderData();
    /*
    * Call the function that filters all the results by status.
    */
    this.getAndFilterResults();

    /*
    * Define the tabs for the header.
    */
    this.tabs = [{
      title: this.$translate.instant('provisioningConsole.tabs.pending'),
      state: 'provisioning.pending',
    }, {
      title: this.$translate.instant('provisioningConsole.tabs.completed'),
      state: 'provisioning.completed',
    }];
  }

  /*
  * Open the side panel.
  */
  public showDetails(row) {
    this.$state.go('order-details', { order: row });
  }

  /*
  * Move an order between pending, in progress and completed.
  */
  public moveTo(order, category) {
    this.results = this.ProvisioningService.updateOrderStatus(order, category);
    this.getAndFilterResults();
  }

  /*
  * Search for a specific order number.
  * TODO: Hook this up to a Service (Sarah)
  * TODO: Hook the service up to the backend (backend team)
  */
  public setCurrentSearch(searchStr) {
    if (this.timer) {
      this.$timeout.cancel(this.timer);
      this.timer = 0;
    }

    this.timer = this.$timeout( () => {
      if (searchStr.length >= 3 || searchStr === '') {
        this.results = this.getOrderData(searchStr);
        this.getAndFilterResults();
      }
    }, 500);
  }

  /*
  * Filter all the results and grid options by status.
  */
  private getAndFilterResults() {
    const pendingResults = this.filterOrders(0);
    const progressResults = this.filterOrders(1);
    this.completedResults = this.filterOrders(2);
    this.pendingProgress = _.union(pendingResults, progressResults);
    this.gridOptions = this.getGridOptions();
  }

  /*
  * Only return results with a certain status code.
  */
  private filterOrders(status) {
    return _.filter(this.results, function (res) {
      return parseInt(res.statusCode, 10) === parseInt(status, 10);
    });
  }

  /*
  * Load templates from the template folder.
  */
  private getTemplate(tpl) {
    return this.$templateCache.get('modules/squared/provisioning-console/templates/' + tpl + '.html');
  }

  /*
  * Get the data from the API.
  * TODO: Hook the service up to the back-end (back-end team)
  * TODO: If the actual API ends up returning differently formatted data, the back-end team might have to make slight changes to the front-end code to make it match.
  */
  public getOrderData(searchStr?: string) {
    if (searchStr && searchStr.length > 0) {
      return this.ProvisioningService.searchForOrders();
    } else {
      return this.ProvisioningService.getOrders();
    }
  }

  /*
  * Get the options for the pending/in progress and completed table.
  */
  private getGridOptions() {
    return {
      pending: {
        data: this.pendingProgress,
        enableHorizontalScrollbar: 0,
        rowHeight: 45,
        enableRowHeaderSelection: false,
        enableColumnMenus: false,
        multiSelect: false,
        onRegisterApi: (gridApi) => {
          this.$scope.gridApi = gridApi;
          gridApi.selection.on.rowSelectionChanged(this.$scope, (row) => {
            this.showDetails(row.entity);
          });
        },
        columnDefs: [{
          field: 'orderNumber',
          displayName: this.$translate.instant('provisioningConsole.orderNumber'),
        }, {
          field: 'customerName',
          displayName: this.$translate.instant('provisioningConsole.customerName'),
        }, {
          field: 'customerMail',
          displayName: this.$translate.instant('provisioningConsole.customerMail'),
        }, {
          field: 'manualTask',
          displayName: this.$translate.instant('provisioningConsole.manualTask'),
        }, {
          field: 'status',
          displayName: this.$translate.instant('provisioningConsole.status'),
        }, {
          field: 'received',
          displayName: this.$translate.instant('provisioningConsole.received'),
        }, {
          field: 'actions',
          displayName: this.$translate.instant('provisioningConsole.actions.title'),
          cellTemplate: this.getTemplate('actions'),
        }],
      },
      completed: {
        data: this.completedResults,
        enableHorizontalScrollbar: 0,
        rowHeight: 45,
        enableRowHeaderSelection: false,
        enableColumnMenus: false,
        multiSelect: false,
        onRegisterApi: (gridApi) => {
          this.$scope.gridApi = gridApi;
          gridApi.selection.on.rowSelectionChanged(this.$scope, (row) => {
            this.showDetails(row.entity);
          });
        },
        columnDefs: [{
          field: 'orderNumber',
          displayName: this.$translate.instant('provisioningConsole.orderNumber'),
        }, {
          field: 'customerName',
          displayName: this.$translate.instant('provisioningConsole.customerName'),
        }, {
          field: 'customerMail',
          displayName: this.$translate.instant('provisioningConsole.customerMail'),
        }, {
          field: 'manualTask',
          displayName: this.$translate.instant('provisioningConsole.manualTask'),
        }, {
          field: 'status',
          displayName: this.$translate.instant('provisioningConsole.status'),
        }, {
          field: 'completionDate',
          displayName: this.$translate.instant('provisioningConsole.completed'),
        }],
      },
    };
  }
}

