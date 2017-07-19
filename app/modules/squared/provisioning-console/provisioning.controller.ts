import { ProvisioningService } from './provisioning.service';
import { IOrders } from './provisioning.interfaces';
import { IOrder } from './provisioning.interfaces';
import { Status } from './provisioning.service';
import { DATE_FORMAT } from './provisioning.service';

export interface IGridApiScope extends ng.IScope {
  gridApi?: uiGrid.IGridApi;
}

export class ProvisioningController {

  public tabs = [{
    title: 'provisioningConsole.tabs.pending',
    state: 'provisioning.pending',
  }, {
    title: 'provisioningConsole.tabs.completed',
    state: 'provisioning.completed',
  }];
  public isLoading: boolean = false;

  private timer: any;
  public completedOrders: any;
  public pendingOrders: any;
  private gridOptions: { pending: uiGrid.IGridOptions, completed: uiGrid.IGridOptions };
  private sharedColumDefs: uiGrid.IColumnDef[];
  private static sharedGridOptions: uiGrid.IGridOptions = {
    enableHorizontalScrollbar: 0,
    rowHeight: 45,
    enableRowHeaderSelection: false,
    enableColumnMenus: false,
    multiSelect: false,
  };

  /* @ngInject */
  constructor(
    private $scope: IGridApiScope,
    private $state: ng.ui.IStateService,
    private $templateCache: ng.ITemplateCacheService,
    private $q: ng.IQService,
    private $timeout: ng.ITimeoutService,
    private $translate: ng.translate.ITranslateService,
    private ProvisioningService: ProvisioningService) {


    this.sharedColumDefs = [{
      field: 'webOrderID',
      displayName: this.$translate.instant('provisioningConsole.orderNumber'),
    }, {
      field: 'customerName',
      displayName: this.$translate.instant('provisioningConsole.customerName'),
    }, {
      field: 'adminEmail',
      displayName: this.$translate.instant('provisioningConsole.customerMail'),
    }, {
      field: 'manualCode',
      displayName: this.$translate.instant('provisioningConsole.manualCode'),
      width: '7%',
    },
    {
      field: 'siteUrl',
      displayName: this.$translate.instant('provisioningConsole.siteUrl'),
    },
    {
      field: 'orderReceived',
      displayName: this.$translate.instant('provisioningConsole.orderReceived'),
      cellTemplate: '<div class="ui-grid-cell-contents"> {{grid.appScope.provisioningCtrl.formatDate(row.entity.orderReceived)}} </div>',
      type: 'date',
    },
    {
      field: 'lastModified',
      displayName: this.$translate.instant('provisioningConsole.lastModified'),
      type: 'date',
      cellTemplate: '<div class="ui-grid-cell-contents"> {{grid.appScope.provisioningCtrl.formatDate(row.entity.lastModified)}} </div>',
    },
    {
      field: 'status',
      displayName: this.$translate.instant('provisioningConsole.status'),
    }];

    /*
    * Define the tabs for the header.
    */
    this.tabs = [{
      title: 'provisioningConsole.tabs.pending',
      state: 'provisioning.pending',
    }, {
      title: 'provisioningConsole.tabs.completed',
      state: 'provisioning.completed',
    }];

    this.init();
  }

  private init(): void {
    this.isLoading = true;
    this.gridOptions = this.getGridOptions();
    this.getOrderData().then((results: IOrders) => {
      this.setGridData(results);
    })
    .finally(() => {
      this.isLoading = false;
    });
  }


  public showDetails(row) {
    this.$state.go('order-details', { order: row });
  }

  /*
  * Move an order between pending, in progress and completed.
  * TODO: algendel - the logic of this function will change once back end is plalce
  */
  public moveTo(order, newStatus: Status): void {
    this.isLoading = true;
    this.ProvisioningService.updateOrderStatus(order, newStatus).then((results) => {
      if (results) {
        order.status = newStatus;
        if (newStatus === Status.completed) {
          //moving from pending dataset to completed no reason to get results again - just modify existing datasets
          const pendingIndex = _.findIndex(this.pendingOrders, { orderUUID: order.orderUUID, siteUrl: order.siteUrl });
          if (pendingIndex > -1) {
            this.completedOrders.push(this.pendingOrders.splice(pendingIndex, 1));
          }
        }
      }
    })
      .finally(() => {
        this.isLoading = false;
      });
  }

  /*
  * Search for a specific order number.
  */
  public setCurrentSearch(searchStr) {
    if (this.timer) {
      this.$timeout.cancel(this.timer);
      this.timer = 0;
    }

    this.timer = this.$timeout(() => {
      if (searchStr.length >= 3 || searchStr === '') {
        this.pendingOrders = [];
        this.completedOrders = [];
        this.isLoading = true;
        this.getOrderData(searchStr).then((results: IOrders) => {
          this.setGridData(results);
        })
          .finally(() => {
            this.isLoading = false;
          });
      }
    }, 500);
  }

  private setGridData(orders: IOrders): void {
    this.pendingOrders = orders.pending;
    this.completedOrders = orders.completed;

  }

  private getTemplate(tpl): {} {
    return this.$templateCache.get('modules/squared/provisioning-console/templates/' + tpl + '.html');
  }

  public getOrderData(searchStr?: string): ng.IPromise<{ pending: IOrder[], completed: IOrder[] }> {
    const orders = {
      pending: this.ProvisioningService.getOrders(Status.pending),
      completed: this.ProvisioningService.getOrders(Status.completed),
    };
    return this.$q.all(orders).then((results) => {
      if (searchStr && searchStr.length > 0) {
        results.completed = _.filter(results.completed, { webOrderID: searchStr });
        results.pending = _.filter(results.pending, { webOrderID: searchStr });
      }

      return results;
    });
  }

  public formatDate(date): string {
    return moment(date).format(DATE_FORMAT);
  }
  /*
  * Get the options for the pending/in progress and completed table.
  */
  private getGridOptions(): { pending: uiGrid.IGridOptions, completed: uiGrid.IGridOptions } {
    const customPendingFields = [{
      field: 'actions',
      displayName: this.$translate.instant('provisioningConsole.actions.title'),
      cellTemplate: this.getTemplate('actions'),
    }];

    const result = {
      pending: _.extend({}, ProvisioningController.sharedGridOptions),
      completed: _.merge({}, ProvisioningController.sharedGridOptions),
    };

    result.pending.data = 'provisioningCtrl.pendingOrders';
    result.completed.data = 'provisioningCtrl.completedOrders';
    result.pending.columnDefs = this.sharedColumDefs.concat(customPendingFields);
    result.completed.columnDefs = _.filter(this.sharedColumDefs, (def) => {
      return def.field !== 'orderReceived';
    });

    result.pending.onRegisterApi = (gridApi) => {
      this.$scope.gridApi = gridApi;
      gridApi.selection.on.rowSelectionChanged(this.$scope, (row) => {
        this.showDetails(row.entity);
      });
    };
    result.completed.onRegisterApi = (gridApi) => {
      this.$scope.gridApi = gridApi;
      gridApi.selection.on.rowSelectionChanged(this.$scope, (row) => {
        this.showDetails(row.entity);
      });
    };
    return result;

  }
}

