import { IOrderDetail, IOrderList } from './myCompanyOrders.service';

describe('Service: MyCompanyOrdersService', () => {
  const onlineCustId: string = '98765';
  const orderUrl: string = 'https://atlas-intb.ciscospark.com/admin/api/v1/commerce/purchaseorders/customer/' + onlineCustId;
  beforeEach(function () {
    this.initModules('Core');
    this.injectDependencies(
      '$httpBackend',
      'Authinfo',
      'MyCompanyOrdersService',
      'UrlConfig',
    );
    spyOn(this.Authinfo, 'getCustomerId').and.returnValue('12345');
    spyOn(this.Authinfo, 'getCustomerAccounts').and.returnValue([{
      customerId: '12345',
      customerType: 'Enterprise',
    },
    {
      customerId: onlineCustId,
      customerType: 'Online',
    } ],
    );

    const purchaseOrdersList: IOrderDetail[] = [{
      externalOrderId: '123',
      orderDate: new Date('2018-01-01T12:00:00.000Z'),
      displayDate: 'Jan 1, 2018',
      status: 'COMPLETED',
      total: 15.95,
      productDescriptionList: '',
      invoiceURL: 'digitalriver.com',
      isTrial: false,
    }];

    const purchaseOrdersResponse: IOrderList = {
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
    this.$httpBackend.expectGET(orderUrl).respond(200, this.purchaseOrdersResponse);
    this.MyCompanyOrdersService.getOrderDetails().then(response => {
      expect(response).toEqual(this.purchaseOrdersList);
    });
    this.$httpBackend.flush();
  });

  it('should reject the promise on a failed response', function () {
    this.$httpBackend.expectGET(orderUrl).respond(500);
    this.MyCompanyOrdersService.getOrderDetails().then(fail)
    .catch(response => {
      expect(response.data).toBeUndefined();
      expect(response.status).toEqual(500);
    });
    this.$httpBackend.flush();
  });
});
