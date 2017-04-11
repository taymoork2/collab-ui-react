
const BLOCK_ORDER = 'BLOCK_ORDER';
export class OrderDetailCtrl implements ng.IComponentController {
  public currentOrder: any;
  public currentCustomer: any;
  public loading = true;
  public allNumbersCount = 0;
  public info: Array<any> = [];
  public tosAccepted = true;

  /* @ngInject */
  constructor(
    private PstnSetupService,
    private TelephoneNumberService,
    private $translate: angular.translate.ITranslateService,
  ) {
    this.init();
  }

  public init(): void {
    this.getToSStatus();

    //parse order
    switch (this.currentOrder.operation) {
      case BLOCK_ORDER:
        if (_.has(this.currentOrder, 'numbers')) {
          if (!_.get(this.currentOrder.numbers, '[0].number')) {
            this.info.push({
              status: this.currentOrder.status,
              tooltip: this.currentOrder.tooltip,
              label: '(' + this.currentOrder.areaCode + ') XXX-XXXX ' + this.$translate.instant('pstnSetup.quantity') +
                        ': ' + this.currentOrder.quantity,
            });
          } else {
            this.pushNumbersToView(this.currentOrder.numbers);
          }
        }
        break;
      default:
        if (_.has(this.currentOrder, 'numbers')) {
          this.pushNumbersToView(this.currentOrder.numbers);
        }
        break;
    }
  }

  public pushNumbersToView(numbers) {
    _.forEach(numbers, (num) => {
      this.info.push({
        number: num.number,
        label: this.TelephoneNumberService.getDIDLabel(num.number),
        status: num.status,
        tooltip: num.tooltip,
      });
    });
  }

  public getToSStatus() {
    this.PstnSetupService.getCustomerV2(this.currentCustomer.customerOrgId).then((customer) => {
      if (customer.trial) {
        this.PstnSetupService.getCustomerTrialV2(this.currentCustomer.customerOrgId).then((trial) => {
          if (!_.has(trial, 'acceptedDate')) {
            this.tosAccepted = false;
          }
        });
      }
    });
  }
}

export class OrderDetailComponent implements ng.IComponentOptions {
  public controller = OrderDetailCtrl;
  public templateUrl = 'modules/huron/pstnOrderManagement/orderDetail/orderDetail.html';
  public bindings = {
    currentOrder: '<',
    currentCustomer: '<',
  };
}
