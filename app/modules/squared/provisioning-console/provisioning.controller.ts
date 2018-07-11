import { ProvisioningService } from './provisioning.service';
import { IOrders, IReportOption, IOrder } from './provisioning.interfaces';
import { Status } from './provisioning.service';
import { Notification } from 'modules/core/notifications';
import { FeatureToggleService } from 'modules/core/featureToggle';
import { STATUS_UPDATE_EVENT_NAME } from './provisioning.service';
import * as moment from 'moment-timezone';

export class ProvisioningController {

  public tabs = [{
    title: this.$translate.instant('provisioningConsole.tabs.pending'),
    state: 'provisioning.pending',
  }, {
    title: this.$translate.instant('provisioningConsole.tabs.completed'),
    state: 'provisioning.completed',
  }];

  public csvFilterOptions: IReportOption[] = [{
    label: this.$translate.instant('provisioningConsole.actions.export.csvFilterOptions.queueReceived'),
    value: 'created',
  }, {
    label: this.$translate.instant('provisioningConsole.actions.export.csvFilterOptions.queueCompleted'),
    value: 'completed',
  }];

  public selectedFilterValue: IReportOption = this.csvFilterOptions[0];
  public isLoading: boolean = false;
  public gridApi: uiGrid.IGridApi;
  public exportLoading = false;
  public status = Status;
  public completedOrders: any;
  public pendingOrders: any;
  private featureToggleFlag: boolean;
  public tooltipMessage: string;
  public selectedFilterOptionStartDate: string = '';
  public selectedFilterOptionEndDate: string = '';
  private timer: any;
  private gridOptions: { pending: uiGrid.IGridOptions, completed: uiGrid.IGridOptions };
  private sharedColumDefs: uiGrid.IColumnDef[];
  private actionMenuOpened: boolean;
  private static sharedGridOptions: uiGrid.IGridOptions = {
    rowHeight: 45,
    enableRowSelection: true,
  };

  /* @ngInject */
  constructor(
    private $state: ng.ui.IStateService,
    private $q: ng.IQService,
    private $scope: ng.IScope,
    private $timeout: ng.ITimeoutService,
    private $translate: ng.translate.ITranslateService,
    private ProvisioningService: ProvisioningService,
    private Notification: Notification,
    private FeatureToggleService: FeatureToggleService ) {

    this.sharedColumDefs = [{
      field: 'webOrderID',
      displayName: this.$translate.instant('provisioningConsole.orderNumber'),
    }, {
      field: 'customerName',
      displayName: this.$translate.instant('provisioningConsole.customerName'),
      width: '20%',
    }, {
      field: 'adminEmail',
      displayName: this.$translate.instant('provisioningConsole.customerMail'),
    }, {
      field: 'manualCode',
      displayName: this.$translate.instant('provisioningConsole.manualCode'),
      width: '7%',
    }, {
      field: 'siteUrl',
      displayName: this.$translate.instant('provisioningConsole.siteUrl'),
    }, {
      field: 'orderReceived',
      displayName: this.$translate.instant('provisioningConsole.orderReceived'),
      type: 'date',
    }, {
      field: 'lastModified',
      displayName: this.$translate.instant('provisioningConsole.lastModified'),
      type: 'date',
    }, {
      field: 'status',
      displayName: this.$translate.instant('provisioningConsole.status'),
    }];
    this.init();
  }

  private init(): void {
    this.isLoading = true;
    this.actionMenuOpened = false;
    this.gridOptions = this.getGridOptions();
    this.$scope.$on(STATUS_UPDATE_EVENT_NAME, (_event, order) => {
      this.updateOrderStatusInGrid(order);
    });
    this.$q.all({
      featureTogglePromise : this.FeatureToggleService.supports(this.FeatureToggleService.features.atlasWebexProvisioningConsole),
      orderDataPromise : this.getOrderData() }).then(promises => {
        this.featureToggleFlag = promises.featureTogglePromise;
        if (this.featureToggleFlag) {
          this.updateGridOptions();
        }
        const results: IOrders = promises.orderDataPromise;

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
    if (!this.actionMenuOpened) {
      this.$state.go('order-details', { order: row });
    } else {
      this.actionMenuOpened = false;
    }
  }

  public updateOrderStatusInGrid(order) {
    if (order.status === Status.COMPLETED) {
      //moving from pending dataset to completed no reason to get results again - just modify existing datasets
      const completedOrder = _.head(_.remove(this.pendingOrders, { orderUUID: order.orderUUID, siteUrl: order.siteUrl, manualCode: order.manualCode }));
      if (completedOrder) {
        this.completedOrders.push(completedOrder);
      }
    }
  }

/**
 *  Navigation to csv downlad screen
 */
  public navigateToCSVDownloadModal() {
    this.$state.go('provisioning.csvdownload');
  }

  /**
   * To download the post provisioning order details as CSV file.
   */
  public exportCSV(): ng.IPromise<void | IOrder[]>   {
    this.exportLoading = true;
    return this.postProvisioningExportCSV().then((res) => {
      this.Notification.success('provisioningConsole.actions.export.success');
      this.$state.go('provisioning.completed');
      return res;
    }).catch((res) => {
      this.Notification.errorResponse(res, 'provisioningConsole.actions.export.failure');
    }).finally(() => {
      this.$timeout(() => {
        this.exportLoading = false;
      }, 5000);
    });
  }

  private postProvisioningExportCSV(): ng.IPromise<IOrder[]> {
    let startDate;
    let endDate;
    let today;
    let start;
    let end;
    let isFilterOn = true;
    if (_.isEmpty(this.selectedFilterOptionStartDate) || _.isEmpty(this.selectedFilterOptionEndDate)) {
      isFilterOn = false;
    } else {
      startDate = moment(this.selectedFilterOptionStartDate, 'YYYY-MM-DD');
      endDate = moment(this.selectedFilterOptionEndDate, 'YYYY-MM-DD');
      today = moment(moment().format('YYYY-MM-DD'));
      start = today.diff(endDate, 'days');
      end = today.diff(startDate, 'days');
    }
    const exportedLines: any[] = [];
    const headerLine = {
      webOrderID: this.$translate.instant('provisioningConsole.orderNumber'),
      customerName: this.$translate.instant('provisioningConsole.customerName'),
      adminEmail: this.$translate.instant('provisioningConsole.customerMail'),
      manualCode: this.$translate.instant('provisioningConsole.manualCode'),
      siteUrl: this.$translate.instant('provisioningConsole.siteUrl'),
      orderReceived: this.$translate.instant('provisioningConsole.orderReceived'),
      lastModified: this.$translate.instant('provisioningConsole.lastModified'),
      status: this.$translate.instant('provisioningConsole.status'),
      queueReceived: this.$translate.instant('provisioningConsole.queueReceived'),
      queueCompleted: this.$translate.instant('provisioningConsole.queueCompleted'),
      assignedTo: this.$translate.instant('provisioningConsole.assignedTo'),
      completedBy: this.$translate.instant('provisioningConsole.completedBy'),
    };
    exportedLines.push(headerLine);
    const uiparams = { isFilterOn: isFilterOn, startDate: startDate, endDate: endDate };
    this.filterProcessOrderToCsvDownload(this.pendingOrders, uiparams, exportedLines);

    if (start === undefined || end === undefined) {
      start = 0;
      end = 30;  // By default setting for 1 month
    }
    return this.ProvisioningService.getOrders(Status.COMPLETED, this.featureToggleFlag, start, end, this.selectedFilterValue.value).then((res: IOrder[]) => {
      if (!res.length) {
        return exportedLines; // only export the header when is empty
      }
      _.forEach(res, (line) => {
        this.formatCompletedStatusData(line, exportedLines);
      });
      return exportedLines;
    });
  }
  private formatCompletedStatusData(order: any, exportedLines: any): any[] {
    exportedLines = this.collectData(order, exportedLines);
    return exportedLines;
  }

  private filterProcessOrderToCsvDownload(orderType: any, options: any, exportedLines: any[]): any [] {
    let dateTypeToFilter;
    _.forEach(orderType, (order) => {
      if (options.isFilterOn) {
        if (this.selectedFilterValue.value === 'created') {
          dateTypeToFilter = moment(order.queueReceived, 'YYYY-MM-DD');
        } else if (this.selectedFilterValue.value === 'completed') {
          dateTypeToFilter = moment(order.queueCompleted, 'YYYY-MM-DD');
        }
      }
      if (!options.isFilterOn) {
        exportedLines = this.collectData(order, exportedLines);
      } else if ((dateTypeToFilter >= options.startDate) && (dateTypeToFilter <= options.endDate)) {
        exportedLines = this.collectData(order, exportedLines);
      }
    });
    return exportedLines;
  }

  private collectData(order: any, exportedLines: any[]): any[] {
    const extractData = {
      webOrderID: order.webOrderID,
      customerName: order.customerName,
      adminEmail: order.adminEmail,
      manualCode: order.manualCode,
      siteUrl: order.siteUrl,
      orderReceived: order.orderReceived,
      lastModified: order.lastModified,
      status: order.status,
      queueReceived: order.queueReceived,
      queueCompleted: order.queueCompleted,
      assignedTo: order.assignedTo,
      completedBy: order.completedBy,
    };
    exportedLines.push(extractData);
    return exportedLines;
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

  private getOrderData(searchStr?: string): ng.IPromise<{ pending: IOrder[], completed: IOrder[] }> {
    const orders = {
      pending: this.ProvisioningService.getOrders(Status.PENDING, this.featureToggleFlag),
      completed: this.ProvisioningService.getOrders(Status.COMPLETED, this.featureToggleFlag),
    };
    return this.$q.all(orders).then((results) => {
      if (searchStr && searchStr.length > 0) {
        results.completed = this.findCriteria(results.completed, searchStr);
        results.pending = this.findCriteria(results.pending, searchStr);
      }
      return results;
    });
  }

  /*
  * Get the options for the pending/in progress and completed table.
  */
  private getGridOptions(): { pending: uiGrid.IGridOptions, completed: uiGrid.IGridOptions } {
    const result = {
      pending: _.extend({}, ProvisioningController.sharedGridOptions),
      completed: _.merge({}, ProvisioningController.sharedGridOptions),
    };

    result.pending.columnDefs = _.cloneDeep(this.sharedColumDefs);
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

  private updateGridOptions(): void {
    const pendingDefs = this.gridOptions.pending.columnDefs || [];
    const completedDefs = this.gridOptions.completed.columnDefs || [];
    pendingDefs.push({
      field: 'queueReceived',
      displayName: this.$translate.instant('provisioningConsole.queueReceived'),
    }, {
      field: 'assignedTo',
      displayName: this.$translate.instant('provisioningConsole.assignedTo'),
    }, {
      field: 'note',
      displayName: this.$translate.instant('provisioningConsole.notes'),
      cellTooltip: true,
    });
    this.gridOptions.pending.columnDefs = _.reject(pendingDefs, obj => obj.field === 'lastModified');
    completedDefs.push({
      field: 'queueReceived',
      displayName: this.$translate.instant('provisioningConsole.queueReceived'),
    }, {
      field: 'queueCompleted',
      displayName: this.$translate.instant('provisioningConsole.queueCompleted'),
    }, {
      field: 'completedBy',
      displayName: this.$translate.instant('provisioningConsole.completedBy'),
    }, {
      field: 'note',
      displayName: this.$translate.instant('provisioningConsole.notes'),
      cellTooltip: true,
    });
    this.gridOptions.completed.columnDefs = _.reject(completedDefs, obj => obj.field === 'lastModified');
  }

  private findCriteria( order: IOrder[], searchStr: string): IOrder[] {
    return _.filter(order, (order) => {
      return (_.includes(order.siteUrl, searchStr) || _.includes(order.adminEmail, searchStr) || _.includes(order.webOrderID, searchStr) || _.includes(order.manualCode, searchStr));
    });
  }

}
