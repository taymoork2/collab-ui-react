import { ProvisioningService } from './provisioning.service';
import { IOrders } from './provisioning.interfaces';
import { IOrder } from './provisioning.interfaces';
import { Status } from './provisioning.service';
import { Notification } from 'modules/core/notifications';

export class ProvisioningController {

  public tabs = [{
    title: this.$translate.instant('provisioningConsole.tabs.pending'),
    state: 'provisioning.pending',
  }, {
    title: this.$translate.instant('provisioningConsole.tabs.completed'),
    state: 'provisioning.completed',
  }];
  public isLoading: boolean = false;
  public gridApi: uiGrid.IGridApi;
  public status = Status;
  public completedOrders: any;
  public pendingOrders: any;

  private timer: any;
  private gridOptions: { pending: uiGrid.IGridOptions, completed: uiGrid.IGridOptions };
  private sharedColumDefs: uiGrid.IColumnDef[];
  private static sharedGridOptions: uiGrid.IGridOptions = {
    rowHeight: 45,
    enableRowSelection: true,
  };

  /* @ngInject */
  constructor(

    private $state: ng.ui.IStateService,
    private $templateCache: ng.ITemplateCacheService,
    private $q: ng.IQService,
    private $scope: ng.IScope,
    private $timeout: ng.ITimeoutService,
    private $translate: ng.translate.ITranslateService,
    private ProvisioningService: ProvisioningService,
    private Notification: Notification) {


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
    },
    {
      field: 'lastModified',
      displayName: this.$translate.instant('provisioningConsole.lastModified'),
    },
    {
      field: 'status',
      displayName: this.$translate.instant('provisioningConsole.status'),
    }];

    this.init();
  }

  private init(): void {
    this.isLoading = true;
    this.gridOptions = this.getGridOptions();
    this.getOrderData().then((results: IOrders) => {
      this.setGridData(results);
    })
    .catch((error) => {
      this.pendingOrders = [];
      this.completedOrders = [];
      this.Notification.errorResponse(error);
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
  */
  public moveTo(order, newStatus: Status): void {
    this.isLoading = true;
    this.ProvisioningService.updateOrderStatus<{status: string}>(order, newStatus)
    .then((result) => {
      if (result) {
        order.status = newStatus;
        if (newStatus === Status.COMPLETED) {
          //moving from pending dataset to completed no reason to get results again - just modify existing datasets
          const completedOrder =  _.head(_.remove(this.pendingOrders, { orderUUID: order.orderUUID, siteUrl: order.siteUrl }));
          if (completedOrder) {
            this.completedOrders.push(completedOrder);
          }
        }
      }
    })
    .catch((error) => {
      this.Notification.errorResponse(error);
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
        .catch((error) => {
          this.Notification.errorResponse(error);
        })
        .finally(() => {
          this.isLoading = false;
        });
      }
    }, 500);
  }

  private setGridData(orders: IOrders): void {
    this.pendingOrders = this.gridOptions.pending.data = orders.pending;
    this.completedOrders = this.gridOptions.completed.data = orders.completed;

  }

  private getTemplate(tpl): {} {
    return this.$templateCache.get('modules/squared/provisioning-console/templates/' + tpl + '.html');
  }

  private getOrderData(searchStr?: string): ng.IPromise<{ pending: IOrder[], completed: IOrder[] }> {
    const orders = {
      pending: this.ProvisioningService.getOrders(Status.PENDING),
      completed: this.ProvisioningService.getOrders(Status.COMPLETED),
    };
    return this.$q.all(orders).then((results) => {
      if (searchStr && searchStr.length > 0) {
        results.completed = _.filter(results.completed, { webOrderID: searchStr });
        results.pending = _.filter(results.pending, { webOrderID: searchStr });
      }
      return results;
    });
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

    result.pending.columnDefs = this.sharedColumDefs.concat(customPendingFields);
    result.pending.appScopeProvider = this;
    result.completed.appScopeProvider = this;
    result.completed.columnDefs = _.filter(this.sharedColumDefs, (def) => {
      return def.field !== 'orderReceived';
    });

    result.pending.onRegisterApi = (gridApi) => {
      this.gridApi = gridApi;
      this.gridApi.selection.on.rowSelectionChanged(this.$scope, (row) => {
        this.showDetails(row.entity);
      });
    };
    result.completed.onRegisterApi = (gridApi) => {
      this.gridApi = gridApi;
      this.gridApi.selection.on.rowSelectionChanged(this.$scope, (row) => {
        this.showDetails(row.entity);
      });
    };
    return result;

  }
}

