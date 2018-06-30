
import { IOrder } from './provisioning.interfaces';
import { IOrderDetail } from './provisioning.interfaces';
import { IHttpResponse } from 'angular';

export const DATE_FORMAT = 'M/D/YY h:mm a';

export enum Status {
  PENDING = 'PENDING',
  PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

export const STATUS_UPDATE_EVENT_NAME = 'prov_status_update';

export class ProvisioningService {

  private getOrderUrl: string;
  private updateOrderUrl: string;
  private postProvisioningUrl: string;
  private getOrdersBaseUrl: string;
  /* @ngInject */
  constructor(
    private $http: ng.IHttpService,
    private UrlConfig,
   ) {
    const adminServiceUrl = this.UrlConfig.getAdminServiceUrl();
    this.getOrdersBaseUrl = `${adminServiceUrl}orders/postProvisioning/manualCodes?status=`;
    this.getOrderUrl = `${adminServiceUrl}commerce/orders/`;
    this.updateOrderUrl = `${adminServiceUrl}orders/`; //<orderUuid>/postProvisioning
    this.postProvisioningUrl = `${adminServiceUrl}orders/postProvisioning/`;
  }

  private formatDate(date): string {
    return moment(date).format(DATE_FORMAT);
  }

  public getOrders(status: Status, featureToggleFlag: boolean, start?: number, end?: number, filterType?: string): ng.IPromise<IOrder[]> {
    return this.$http.get<IOrder[]>(this.getOrdersBaseUrl + status, { params: { start: start, end: end, filterType: filterType } }).then((response) => {
      return _.each(_.get(response, 'data.orderList'), (order) => {
        order.orderReceived = this.formatDate(order.orderReceived);
        if (featureToggleFlag) {
          order.queueReceived = this.formatDate(order.queueReceived);
        } else {
          order.lastModified = this.formatDate(order.lastModified);
        }
      });
    });
  }

  public getOrder(orderUuid: string): ng.IPromise<IOrderDetail> {
    return this.$http.get<IOrderDetail>(this.getOrderUrl + orderUuid).then((response) => {
      return _.get(response, 'data');
    });
  }

  public updateOrderStatus<T>(order: IOrder, newStatus: Status, assignedTo?: string): ng.IPromise<T> {
    if (assignedTo) {
      const results: string[] = _.split(assignedTo, '@');
      assignedTo = results[0];
    }
    const payload = {
      orderId: order.orderUUID,
      postProvisioningStatus: [
        {
          manualCode: order.manualCode,
          siteUrl: order.siteUrl,
          status: newStatus,
          assignedTo: assignedTo,
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

  public saveNote(uuid: string , noteText: string): ng.IPromise<IHttpResponse<string>> {
    const payload = {
      postProvisioningStatus: [
        {
          note: noteText,
        }],
    };
    const url = `${this.postProvisioningUrl}${uuid}/note`;
    return  this.$http.post(url, payload);
  }
}
