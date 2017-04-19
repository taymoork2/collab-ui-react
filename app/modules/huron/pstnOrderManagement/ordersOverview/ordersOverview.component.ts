export class OrdersOverviewComponent implements ng.IComponentOptions {
  public controller = OrdersOverviewCtrl;
  public templateUrl = 'modules/huron/pstnOrderManagement/ordersOverview/ordersOverview.html';
  public bindings = {
    currentCustomer: '<',
    isPartner: '<',
  };
}

export class OrdersOverviewCtrl implements ng.IComponentController {
  public currentCustomer: any;
  public loading: boolean = true;
  private orders: Array<any> = [];
  private ordersWithDuplicates: Array<any> = [];
  private PENDING = this.$translate.instant('pstnOrderOverview.inProgress');
  public isPartner: boolean;
  /* @ngInject */
  constructor(
    private PstnSetupService,
    private $translate: angular.translate.ITranslateService,
  ) {
    this.init();
  }

  public init(): void {
    return this.PstnSetupService.getFormattedNumberOrders(this.currentCustomer.customerOrgId).then((response) => {
      this.ordersWithDuplicates = response;
      //club all the batches with same OrderId into one Order.
      //V2 Terminus orders API returns different batches for same order as 2 separate orders with different batchID
      this.orders = _.cloneDeep(this.condenseOrderBatches());
      this.loading = false;
    }, () => {
      this.loading = false;
    });
  }

  public condenseOrderBatches(): any {
    let finalOrders: Array<any> = [];
    _.forEach(this.ordersWithDuplicates, (order) => {
      let orderIndex = _.findIndex(finalOrders, { carrierOrderId: order.carrierOrderId });
      if (orderIndex === -1) {
        finalOrders.push(order);
      } else {
        finalOrders[orderIndex].numbers = _.concat(finalOrders[orderIndex].numbers, order.numbers);
        // Due to combining the batches with same order compute the final status of the overall order
        // if one of them is pending, set the over all status to pending
        finalOrders[orderIndex].status = order.status === this.PENDING ? this.PENDING : finalOrders[orderIndex].status;
      }
    });
    return finalOrders;
  }
}

