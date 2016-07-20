/// <reference path="myCompanyOrders.component.ts" />
namespace myCompanyPage {
  export class MyCompanyOrdersService {

    private ordersService: ng.resource.IResourceClass<ng.resource.IResource<any>>;
    private commerceService: ng.resource.IResourceClass<ng.resource.IResource<any>>;

    /* @ngInject */
    constructor(
      private $resource: ng.resource.IResourceService,
      private $q: ng.IQService,
      private UrlConfig
    ) {
      this.ordersService = $resource(UrlConfig.getAdminServiceUrl() + 'orders/customers/:customerId');
      this.commerceService = $resource(UrlConfig.getAdminServiceUrl() + 'commerce/online/users/email');
    }

    public supportsOrderHistory(): ng.IPromise<boolean> {
      return this.$q.reject();
    }

    public getOrderDetails(): ng.IPromise<IOrderDetail[]> {
      return this.$q((resolve: ng.IQResolveReject<myCompanyPage.IOrderDetail[]>) => {
        resolve([]);
      });
    }
  }

  angular
    .module('Core')
    .service('MyCompanyOrdersService', MyCompanyOrdersService);
}