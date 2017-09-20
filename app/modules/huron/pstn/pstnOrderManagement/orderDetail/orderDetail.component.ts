import { PstnService } from 'modules/huron/pstn/pstn.service';
import { PhoneNumberService } from 'modules/huron/phoneNumber';

const BLOCK_ORDER = 'BLOCK_ORDER';
const CUSTOMER = 'CUSTOMER';
const PARTNER = 'PARTNER';

export class OrderDetailCtrl implements ng.IComponentController {
  public currentOrder: any;
  public currentCustomer: any;
  public allNumbersCount = 0;
  public info: any[] = [];
  public tosAccepted = true;
  public createdBy: string;
  /* @ngInject */
  constructor(
    private PstnService: PstnService,
    private PhoneNumberService: PhoneNumberService,
    private $translate: angular.translate.ITranslateService,
  ) {
    if (_.isUndefined(this.currentOrder.createdBy) ||
    (!_.isUndefined(this.currentOrder.createdBy) && this.currentOrder.createdBy.toUpperCase() === PARTNER)) {
      this.createdBy = this.$translate.instant('pstnOrderDetail.orderCreatedBy');
    }
  }

  public $onInit() {
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
        label: this.PhoneNumberService.getNationalFormat(num.number),
        status: num.status,
        tooltip: num.tooltip,
      });
    });
  }

  public getToSStatus() {
    this.PstnService.getCustomerV2(this.currentCustomer.customerOrgId).then((customer) => {
      if (customer.trial) {
        this.PstnService.getCustomerTrialV2(this.currentCustomer.customerOrgId).then((trial) => {
          if (!_.has(trial, 'acceptedDate')) {
            this.tosAccepted = false;
          }
        });
      }
      if (!_.isUndefined(this.currentOrder.createdBy) && (this.currentOrder.createdBy).toUpperCase() === CUSTOMER ) {
        this.createdBy = customer.name;
      }
    });
  }
}

export class OrderDetailComponent implements ng.IComponentOptions {
  public controller = OrderDetailCtrl;
  public template = require('modules/huron/pstn/pstnOrderManagement/orderDetail/orderDetail.html');
  public bindings = {
    currentOrder: '<',
    currentCustomer: '<',
    isCarrierByopstn: '<',
  };
}
