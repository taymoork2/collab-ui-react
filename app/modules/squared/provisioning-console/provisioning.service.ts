
import { IOrder } from './provisioning.interfaces';
import { IOrderDetail } from './provisioning.interfaces';

export const DATE_FORMAT = 'M/d/YY h:mm a';

export enum Status {
  pending = 'PENDING',
  progress = 'PROGRESS',
  completed = 'COMPLETED',
}

export class ProvisioningService {

  private getOrdersUrl: string;
  private getOrderUrl: string;
  private updateOrderUrl: string;
  /* @ngInject */
  constructor(
    private $http: ng.IHttpService,
    private UrlConfig,
  ) {
    const adminServiceUrl = this.UrlConfig.getAdminServiceUrl();
    this.getOrdersUrl = `${adminServiceUrl}orders/postProvisioning/manualCodes?status=`;
    this.getOrderUrl = `${adminServiceUrl}commerce/orders/`;
    this.updateOrderUrl = `${adminServiceUrl}orders/`; //<orderUuid>/postProvisioning
  }

  public getOrders(status: Status): ng.IPromise<IOrder[]> {
    return this.$http.get(this.getOrdersUrl + status).then((response) => {
      return <IOrder[]>_.get(response, 'data.orderList');
    });
  }

  public getOrder(orderUuid: string): ng.IPromise<IOrderDetail> {
    return this.$http.get(this.getOrderUrl + orderUuid).then((response) => {
      return <IOrderDetail>_.get(response, 'data', {});
    });
  }

  public updateOrderStatus(order: IOrder, newStatus: Status): ng.IPromise<{}> {
    const payload = {
      orderId: order.orderUUID,
      postProvisioningStatus: [
        {
          manualCode: order.manualCode,
          siteUrl: order.siteUrl,
          status: newStatus,
        },
      ],
    };
    const config = {
      method: 'POST',
      url: this.updateOrderUrl + order.orderUUID + '/postProvisioning',
      headers: {
        'Content-Type': 'text/plain',
      },
      data: payload,
    };
    return this.$http(config);
  }
}

