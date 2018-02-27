export interface IOrderDetail {
  externalOrderId: string;
  orderDate: Date;
  displayDate: string;
  status: string;
  total: number;
  productDescriptionList: string;
  invoiceURL: string;
  isTrial: boolean;
}

export interface IOrderList {
  commerceOrderList: IOrderDetail[];
}

export class MyCompanyOrdersService {
  private ordersService: ng.resource.IResourceClass<ng.resource.IResource<IOrderList>>;
  private userIdURL: ng.resource.IResourceClass<ng.resource.IResource<IOrderList>>;

  /* @ngInject */
  constructor(
    private $q: ng.IQService,
    private $resource: ng.resource.IResourceService,
    private Authinfo,
    private UrlConfig,
    private UserListService,
  ) {
    this.ordersService = this.$resource(this.UrlConfig.getAdminServiceUrl() + 'commerce/purchaseorders/customer/:customerId');
    this.userIdURL = this.$resource(this.UrlConfig.getAdminServiceUrl() + 'user?email=:emailAddress');
  }

  public getOrderDetails(): ng.IPromise<any[]> {
    // we only want the online account for Order History
    const customerId = _.get(_.find(this.Authinfo.getCustomerAccounts(), {
      customerType: 'Online',
    }), 'customerId', this.Authinfo.getCustomerId());

    return this.ordersService.get({
      customerId: customerId,
    }).$promise
      .then(orderList => {
        return _.get<IOrderDetail[]>(orderList, 'commerceOrderList', []);
      });
  }

  // Return the CI UUID for the given email address
  public getUserId(orgId: string, emailAddress: string): ng.IPromise<string> {
    const params = { orgId,
      filter: {
        nameStartsWith: emailAddress,
      },
    };
    return this.UserListService.listUsersAsPromise(params)
      .then((reply) => {
        const userId: string = _.get(reply.data, 'Resources[0].id');
        if (userId) {
          return userId;
        } else {
          return this.$q.reject();
        }
      });
  }
}

angular
  .module('Core')
  .service('MyCompanyOrdersService', MyCompanyOrdersService);
