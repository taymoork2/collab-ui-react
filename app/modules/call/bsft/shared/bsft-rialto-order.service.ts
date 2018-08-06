import { RialtoOrder, OrderType } from './bsft-rialto-order';
import { Site } from './bsft-site';
import { ProductSKU, BsftOrder, IBsftOrder, PortedNumber, IPortedNumber } from './bsft-order';

export class RialtoOrderService {
  public rialtoOrder: RialtoOrder;
  public isLicenseAdded: boolean = false;
  public orderId: number;
  /* @ngInject */
  constructor(
    private Authinfo,
  ) {
  }

  public initRialtoOrder(site: Site, bsftOrderNumbers: BsftOrder): RialtoOrder {
    this.rialtoOrder = new RialtoOrder();
    this.initCCWOrderInfo();
    this.initOrderItemsInfo(OrderType.NEW, site);
    this.addNumbersToRialtoOrder(bsftOrderNumbers);
    return this.rialtoOrder;
  }

  public initAddRialtoOrder(site: Site, portedNumbers: IPortedNumber[]): RialtoOrder {
    this.rialtoOrder = new RialtoOrder();
    this.initCCWOrderInfo();
    this.initOrderItemsInfo(OrderType.ADD, site);
    this.addPortedNumbersToOrder(portedNumbers);
    return this.rialtoOrder;
  }

  public initCCWOrderInfo(): void {
    //To-do for purchased Org _.get(this.SetupWizardService.getOrderDetails(), 'subscriptionId');
    this.rialtoOrder.ccwSubscriptionId = 'Sub' + this.Authinfo.getOrgId();
    this.rialtoOrder.ccwOrderId = this.Authinfo.getOrgId();
  }

  public initOrderItemsInfo(orderType: OrderType, currentSite: Site): void {
    _.set(this.rialtoOrder, 'orderType', orderType);
    _.set(this.rialtoOrder, 'requestedFOCDate', moment().format('YYYY-MM-DD'));

    if (orderType === OrderType.NEW) {
      this.rialtoOrder.orderItems = [];
      this.orderId = 1;
      this.rialtoOrder.orderItems.push({
        orderItemID: _.toString(this.orderId),
        productId: ProductSKU.SP009,
        quantity: '1',
      });
    }
    if (!this.isLicenseAdded && orderType === OrderType.ADD) {
      this.rialtoOrder.orderItems = [];
      const standard = _.get(currentSite, 'licenses.standard');
      const basic = _.get(currentSite, 'licenses.places');
      this.isLicenseAdded = true;
      if (standard) {
        this.orderId++;
        this.rialtoOrder.orderItems.push({
          orderItemID: _.toString(this.orderId),
          productId: ProductSKU.FLEX001,
          quantity: _.toString(standard),
        });
      }
      if (basic) {
        this.orderId++;
        this.rialtoOrder.orderItems.push({
          orderItemID: _.toString(this.orderId),
          productId: ProductSKU.FLEX002,
          quantity: _.toString(basic),
        });
      }
    }
  }

  public addNumbersToRialtoOrder(bsftOrderNumber: IBsftOrder): void {
    const vmNum = _.get(bsftOrderNumber, 'vmNumber');
    const mainNum = _.get(bsftOrderNumber, 'mainNumber');
    const vm: PortedNumber = _.find(_.get(bsftOrderNumber, 'portedNumbers'), num => _.get(num, 'portingNumber.telephoneNumber.e164') === vmNum);
    _.set(vm, 'assignProductId', ProductSKU.SP009);
    _.set(this.rialtoOrder, 'portedNumbers', _.filter(bsftOrderNumber.portedNumbers, num => (_.get(num.portingNumber, 'telephoneNumber.e164') === vmNum || _.get(num.portingNumber, 'telephoneNumber.e164') === mainNum)));
    _.set(this.rialtoOrder, 'mainNumber.telephoneNumber.e164', _.get(bsftOrderNumber, 'mainNumber'));
  }

  public addPortedNumbersToOrder(portedNumbers: IPortedNumber[]): void {
    if (!_.isUndefined(portedNumbers) && portedNumbers.length) {
      _.set(this.rialtoOrder, 'portedNumbers', portedNumbers);
    }
  }

  public getOrderPortedNumbers(bsftOrder: IBsftOrder, isPreviouslyPorted: boolean): IPortedNumber[] {
    return _.filter(bsftOrder.portedNumbers, num => isPreviouslyPorted &&
      _.get(num.portingNumber, 'telephoneNumber.e164') !== bsftOrder.vmNumber &&
      _.get(num.portingNumber, 'telephoneNumber.e164') !== bsftOrder.mainNumber);
  }
}
