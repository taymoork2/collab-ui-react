export interface IOrderDetail {
  externalOrderId: string;
  orderDate: Date;
  status: string;
  total: number;
  productDescriptionList: string[];
}

export interface IOrderList {
  commerceOrderList: IOrderDetail[];
}

export class MyCompanyOrdersService {
  private ordersService: ng.resource.IResourceClass<ng.resource.IResource<IOrderList>>;

  /* @ngInject */
  constructor(
    private $resource: ng.resource.IResourceService,
    private Authinfo,
    private UrlConfig,
  ) {
    this.ordersService = this.$resource(this.UrlConfig.getAdminServiceUrl() + 'commerce/purchaseorders/customer/:customerId');
  }

  public getOrderDetails(): ng.IPromise<IOrderDetail[]> {
    // we only want the online account for Order History
    let customerId = _.get(_.find(this.Authinfo.getCustomerAccounts(), {
      customerType: 'Online',
    }), 'customerId', this.Authinfo.getCustomerId());

    return this.ordersService.get({
      customerId: customerId,
    }).$promise
      .then(orderList => {
        return _.get<IOrderDetail[]>(orderList, 'commerceOrderList', []);
      });
  }
}

angular
  .module('Core')
  .service('MyCompanyOrdersService', MyCompanyOrdersService);
