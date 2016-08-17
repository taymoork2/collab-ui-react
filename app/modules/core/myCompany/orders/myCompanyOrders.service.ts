export interface IOrderDetail {
  externalOrderId: string,
  orderDate: Date,
  status: string,
  total: number,
  productDescriptionList: string[],
}

export interface IOrderList {
  commerceOrderList: IOrderDetail[]
}

export class MyCompanyOrdersService {
  private ordersService: ng.resource.IResourceClass<ng.resource.IResource<IOrderList>>;

  /* @ngInject */
  constructor(
    private $http: ng.IHttpService,
    private $q: ng.IQService,
    private $resource: ng.resource.IResourceService,
    private Authinfo,
    private UrlConfig
  ) {
    this.ordersService = $resource(UrlConfig.getAdminServiceUrl() + 'commerce/purchaseorders/customer/:customerId');
  }

  public getOrderDetails(): ng.IPromise<IOrderDetail[]> {
    return this.ordersService.get({
      customerId: this.Authinfo.getCustomerId(),
    }).$promise
      .then(orderList => {
        return _.get<IOrderDetail[]>(orderList, 'commerceOrderList', []);
      });
  }

  public getDigitalRiverOrderHistoryUrl(): ng.IPromise<string> {
    const DIGITAL_RIVER_ORDER_HISTORY = 'https://store.digitalriver.com/store/ciscoctg/en_US/DisplayAccountOrderListPage?DRL=';
    return this.$http.get<string>(this.UrlConfig.getAdminServiceUrl() + 'commerce/online/users/authtoken')
      .then((response) => {
        return DIGITAL_RIVER_ORDER_HISTORY + encodeURIComponent(response.data);
      });
  }
}

angular
  .module('Core')
  .service('MyCompanyOrdersService', MyCompanyOrdersService);
