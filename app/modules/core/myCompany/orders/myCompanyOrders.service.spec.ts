import { IOrderDetail, IOrderList } from './myCompanyOrders.service';

describe('Service: MyCompanyOrdersService', () => {
  beforeEach(function () {
    this.initModules('Core');
    this.injectDependencies(
      '$httpBackend',
      'Authinfo',
      'MyCompanyOrdersService',
      'UrlConfig'
    );
    spyOn(this.Authinfo, 'getCustomerId').and.returnValue('12345');

    let purchaseOrdersList: IOrderDetail[] = [{
      externalOrderId: '123',
      orderDate: new Date(),
      status: 'COMPLETED',
      total: 15.95,
      productDescriptionList: [],
    }];

    let purchaseOrdersResponse: IOrderList = {
      commerceOrderList: purchaseOrdersList,
    };

    this.purchaseOrdersList = purchaseOrdersList;
    this.purchaseOrdersResponse = purchaseOrdersResponse;
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  it('should get order list from purchase response', function () {
    this.$httpBackend.expectGET(this.UrlConfig.getAdminServiceUrl() + 'commerce/purchaseorders/customer/' + this.Authinfo.getCustomerId()).respond(200, this.purchaseOrdersResponse);
    this.MyCompanyOrdersService.getOrderDetails().then(response => {
      expect(response).toEqual(this.purchaseOrdersList);
    });
    this.$httpBackend.flush();
  });

  it('should reject the promise on a failed response', function () {
    this.$httpBackend.expectGET(this.UrlConfig.getAdminServiceUrl() + 'commerce/purchaseorders/customer/' + this.Authinfo.getCustomerId()).respond(500);
    this.MyCompanyOrdersService.getOrderDetails().catch(response => {
      expect(response.data).toBeUndefined();
      expect(response.status).toEqual(500);
    });
    this.$httpBackend.flush();
  });

  it('should get digital river order history url', function () {
    this.$httpBackend.expectGET(this.UrlConfig.getAdminServiceUrl() + 'commerce/online/users/authtoken').respond(200, 'abc+123');
    this.MyCompanyOrdersService.getDigitalRiverOrderHistoryUrl().then(response => {
      expect(response).toEqual('https://store.digitalriver.com/store/ciscoctg/en_US/DisplayAccountOrderListPage?DRL=abc%2B123');
    });
    this.$httpBackend.flush();
  });
});
