'use strict';

describe('Service: PstnSetupService', function () {
  var $httpBackend, HuronConfig, PstnSetupService, PstnSetup;

  var customerId = '744d58c5-9205-47d6-b7de-a176e3ca431f';
  var partnerId = '4e2befa3-9d82-4fdf-ad31-bb862133f078';
  var carrierId = '4f5f5bf7-0034-4ade-8b1c-db63777f062c';
  var orderId = '29c63c1f-83b0-42b9-98ee-85624e4c7409';

  var customer = getJSONFixture('huron/json/pstnSetup/customer.json');
  var customerCarrierList = getJSONFixture('huron/json/pstnSetup/customerCarrierList.json');
  var customerOrderList = getJSONFixture('huron/json/pstnSetup/customerOrderList.json');
  var customerOrder = getJSONFixture('huron/json/pstnSetup/customerOrder.json');
  var carrierIntelepeer = getJSONFixture('huron/json/pstnSetup/carrierIntelepeer.json');
  var resellerCarrierList = getJSONFixture('huron/json/pstnSetup/resellerCarrierList.json');

  var orders = getJSONFixture('huron/json/orderManagement/orderManagement.json');
  var acceptedOrder = getJSONFixture('huron/json/orderManagement/acceptedOrders.json');
  var pendingOrder = _.cloneDeep(getJSONFixture('huron/json/lines/pendingNumbers.json'));

  var numbers = ['123', '456'];

  var customerPayload = {
    uuid: customerId,
    name: "myCustomer",
    firstName: "myFirstName",
    lastName: "myLastName",
    email: "myEmail",
    pstnCarrierId: carrierId,
    numbers: numbers,
    trial: true
  };

  var updatePayload = {
    pstnCarrierId: carrierId
  };

  var blockOrderPayload = {
    "npa": "555",
    "quantity": "20"
  };

  var orderPayload = {
    numbers: numbers
  };

  var Authinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue(partnerId)
  };

  beforeEach(angular.mock.module('Huron'));

  beforeEach(angular.mock.module(function ($provide) {
    $provide.value("Authinfo", Authinfo);
  }));

  beforeEach(inject(function (_$httpBackend_, _HuronConfig_, _PstnSetupService_, _PstnSetup_) {
    $httpBackend = _$httpBackend_;
    HuronConfig = _HuronConfig_;
    PstnSetupService = _PstnSetupService_;
    PstnSetup = _PstnSetup_;
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  function createCustomer() {
    PstnSetupService.createCustomer(
      customerPayload.uuid,
      customerPayload.name,
      customerPayload.firstName,
      customerPayload.lastName,
      customerPayload.email,
      customerPayload.pstnCarrierId,
      customerPayload.numbers,
      customerPayload.trial
    );
    $httpBackend.flush();
  }

  it('should create a customer', function () {
    $httpBackend.expectPOST(HuronConfig.getTerminusUrl() + '/customers', customerPayload).respond(201);

    createCustomer();
  });

  it('should create a customer with a reseller', function () {
    PstnSetup.setResellerExists(true);
    var customerResellerPayload = angular.copy(customerPayload);
    customerResellerPayload.resellerId = partnerId;

    $httpBackend.expectPOST(HuronConfig.getTerminusUrl() + '/customers', customerResellerPayload).respond(201);

    createCustomer();
  });

  it('should update a customer\'s carrier', function () {
    $httpBackend.expectPUT(HuronConfig.getTerminusUrl() + '/customers/' + customerId, updatePayload).respond(200);

    PstnSetupService.updateCustomerCarrier(customerId, carrierId);
    $httpBackend.flush();
  });

  it('should get a customer', function () {
    $httpBackend.expectGET(HuronConfig.getTerminusUrl() + '/customers/' + customerId).respond(customer);

    PstnSetupService.getCustomer(customerId);
    $httpBackend.flush();
  });

  it('should retrieve available default carriers', function () {
    $httpBackend.expectGET(HuronConfig.getTerminusUrl() + '/carriers?defaultOffer=true&service=PSTN').respond(200);
    PstnSetupService.listDefaultCarriers();
    $httpBackend.flush();
  });

  it('should retrieve a resellers\'s carriers', function () {
    $httpBackend.expectGET(HuronConfig.getTerminusUrl() + '/resellers/' + partnerId + '/carriers').respond(resellerCarrierList);
    $httpBackend.expectGET(HuronConfig.getTerminusUrl() + '/carriers/' + carrierId).respond(carrierIntelepeer);

    var promise = PstnSetupService.listResellerCarriers();
    promise.then(function (carrierList) {
      expect(carrierList).toContain(jasmine.objectContaining({
        vendor: 'INTELEPEER'
      }));
    });
    $httpBackend.flush();
  });

  it('should retrieve a customer\'s carrier', function () {
    $httpBackend.expectGET(HuronConfig.getTerminusUrl() + '/customers/' + customerId + '/carriers').respond(customerCarrierList);
    $httpBackend.expectGET(HuronConfig.getTerminusUrl() + '/carriers/' + carrierId).respond(carrierIntelepeer);
    var promise = PstnSetupService.listCustomerCarriers(customerId);
    promise.then(function (carrierList) {
      expect(carrierList).toContain(jasmine.objectContaining({
        vendor: 'INTELEPEER'
      }));
    });
    $httpBackend.flush();
  });

  it('should make a block order', function () {
    $httpBackend.expectPOST(HuronConfig.getTerminusUrl() + '/customers/' + customerId + '/carriers/' + carrierId + '/did/block', blockOrderPayload).respond(201);
    PstnSetupService.orderBlock(customerId, carrierId, blockOrderPayload.npa, blockOrderPayload.quantity);
    $httpBackend.flush();
  });

  it('should make a number order', function () {
    $httpBackend.expectPOST(HuronConfig.getTerminusUrl() + '/customers/' + customerId + '/carriers/' + carrierId + '/did/order', orderPayload).respond(201);
    PstnSetupService.orderNumbers(customerId, carrierId, orderPayload.numbers);
    $httpBackend.flush();
  });

  it('should list pending orders', function () {
    $httpBackend.expectGET(HuronConfig.getTerminusUrl() + '/customers/' + customerId + '/orders?status=PENDING&type=PSTN').respond(customerOrderList);
    $httpBackend.expectGET(HuronConfig.getTerminusUrl() + '/customers/' + customerId + '/orders?status=PENDING&type=PORT').respond([]);
    var promise = PstnSetupService.listPendingOrders(customerId);
    promise.then(function (orderList) {
      expect(angular.equals(orderList, customerOrderList)).toEqual(true);
    });
    $httpBackend.flush();
  });

  it('should get a single order', function () {
    $httpBackend.expectGET(HuronConfig.getTerminusUrl() + '/customers/' + customerId + '/orders/' + orderId).respond(customerOrder);
    var promise = PstnSetupService.getOrder(customerId, orderId);
    promise.then(function (order) {
      expect(angular.equals(order, customerOrder)).toEqual(true);
    });
    $httpBackend.flush();
  });

  it('should list pending numbers', function () {
    $httpBackend.expectGET(HuronConfig.getTerminusUrl() + '/customers/' + customerId + '/orders?status=PENDING&type=PSTN').respond(customerOrderList);
    $httpBackend.expectGET(HuronConfig.getTerminusUrl() + '/customers/' + customerId + '/orders?status=PENDING&type=PORT').respond([]);
    $httpBackend.expectGET(HuronConfig.getTerminusUrl() + '/customers/' + customerId + '/orders/' + orderId).respond(customerOrder);
    var promise = PstnSetupService.listPendingNumbers(customerId, 'INTELEPEER');
    promise.then(function (numbers) {
      expect(numbers).toContain(jasmine.objectContaining({
        pattern: '5125934450'
      }));
      expect(numbers).toContain(jasmine.objectContaining({
        pattern: '(123) XXX-XXXX',
        quantity: 1
      }));
      expect(numbers).toContain(jasmine.objectContaining({
        orderNumber: 654987
      }));
    });
    $httpBackend.flush();
  });

  it('should get orders and filter to formatted number orders', function () {
    $httpBackend.expectGET(HuronConfig.getTerminusUrl() + '/customers/' + customerId + '/orders').respond(orders);
    var promise = PstnSetupService.getFormattedNumberOrders(customerId);
    promise.then(function (numbers) {
      expect(numbers).toContain(jasmine.objectContaining(acceptedOrder[0]));
      expect(numbers).toContain(jasmine.objectContaining(acceptedOrder[1]));
    });
    $httpBackend.flush();
  });

  it('should get translated order status message', function () {
    var translated = PstnSetupService.translateStatusMessage(pendingOrder[0]);
    expect(translated).toEqual('pstnSetup.orderStatus.trialStatus');
  });

  it('should get original order status message since it does not exist in translations', function () {
    var translated = PstnSetupService.translateStatusMessage({
      statusMessage: 'This should not be translated'
    });
    expect(translated).toEqual('This should not be translated');
  });

  it('should not get translated order status message since status is None', function () {
    var translated = PstnSetupService.translateStatusMessage(orders[0]);
    expect(translated).toEqual(undefined);
  });
});
