
import { IOrder } from './provisioning.interfaces';
import { IOrderDetail } from './provisioning.interfaces';

export const DATE_FORMAT = 'M/d/YY h:mm a';

export enum Status {
  PENDING = 'PENDING',
  PROGRESS = 'PROGRESS',
  COMPLETED = 'COMPLETED',
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

  private formatDate(date): string {
    return moment(date).format(DATE_FORMAT);
  }

  public getOrders(status: Status): ng.IPromise<IOrder[]> {
    return this.$http.get<IOrder[]>(this.getOrdersUrl + status).then((response) => {
      return _.each(_.get(response, 'data.orderList'), (order) => {
        order.orderReceived = this.formatDate( order.orderReceived);
        order.lastModified = this.formatDate(order.lastModified);
      });
    });
  }

  public getOrder(orderUuid: string): ng.IPromise<IOrderDetail> {
    return this.$http.get<IOrderDetail>(this.getOrderUrl + orderUuid).then((response) => {
      return _.get(response, 'data');
    });
  }

  public updateOrderStatus<T>(order: IOrder, newStatus: Status): ng.IPromise<T> {
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
    return this.$http(config).then((response) => {
      return _.get(response, 'data.postProvisioningStatus[0]');
    });
  }
}

