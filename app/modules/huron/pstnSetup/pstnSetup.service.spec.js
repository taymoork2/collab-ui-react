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
  var customerBlockOrder = getJSONFixture('huron/json/pstnSetup/customerBlockOrder.json');
  var carrierIntelepeer = getJSONFixture('huron/json/pstnSetup/carrierIntelepeer.json');
  var resellerCarrierList = getJSONFixture('huron/json/pstnSetup/resellerCarrierList.json');

  var orders = getJSONFixture('huron/json/orderManagement/orderManagement.json');
  var pstnNumberOrder = getJSONFixture('huron/json/orderManagement/pstnNumberOrder.json');
  var pstnBlockOrder = getJSONFixture('huron/json/orderManagement/pstnBlockOrder.json');
  var acceptedOrder = getJSONFixture('huron/json/orderManagement/acceptedOrders.json');
  var pendingOrder = _.cloneDeep(getJSONFixture('huron/json/lines/pendingNumbers.json'));

  var onlyPstnNumbers = ['+14694691234', '+19724564567'];
  var onlyTollFreeNumbers = []; // Add valid toll-free numbers when tollfree APIs are available
  var invalidNumbers = ['123', '456'];
  var numbers = onlyPstnNumbers.concat(onlyTollFreeNumbers, invalidNumbers);
  var portNumbers = ['+19726579867', '+18004321010'];

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
    "quantity": "20",
  };

  var blockOrderPayloadWithNxx = {
    "npa": "555",
    "quantity": "20",
    "sequential": true,
    "nxx": "777"
  };

  var orderPayload = {
    numbers: numbers
  };

  var portOrderPayload = {
    numbers: portNumbers
  };

  var portOrderPstnPayload = {
    numbers: ['+19726579867'],
  };

  var portOrderTfnPayload = {
    numbers: ['+18004321010'],
    numberType: "tollfree"
  };

  var pstnOrderPayload = {
    numbers: onlyPstnNumbers
  };

  var Authinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue(partnerId)
  };

  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight')); // Remove this when FeatureToggleService is removed.

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

  it('should make different types of port order', function () {
    $httpBackend.expectPOST(HuronConfig.getTerminusUrl() + '/customers/' + customerId + '/carriers/' + carrierId + '/did/port', portOrderPstnPayload).respond(201);
    $httpBackend.expectPOST(HuronConfig.getTerminusV2Url() + '/customers/' + customerId + '/numbers/orders/ports', portOrderTfnPayload).respond(201);
    var promise = PstnSetupService.portNumbers(customerId, carrierId, portOrderPayload.numbers);
    //verify the logic to split the ports
    promise.then(function () {
      expect(portOrderPayload.numbers.length).toEqual(1);
    });
    $httpBackend.flush();
  });

  it('should make a block order', function () {
    $httpBackend.expectPOST(HuronConfig.getTerminusUrl() + '/customers/' + customerId + '/carriers/' + carrierId + '/did/block', blockOrderPayload).respond(201);
    PstnSetupService.orderBlock(customerId, carrierId, blockOrderPayload.npa, blockOrderPayload.quantity);
    $httpBackend.flush();
  });

  it('should make a block order with nxx', function () {
    $httpBackend.expectPOST(HuronConfig.getTerminusUrl() + '/customers/' + customerId + '/carriers/' + carrierId + '/did/block', blockOrderPayloadWithNxx).respond(201);
    PstnSetupService.orderBlock(customerId, carrierId, blockOrderPayloadWithNxx.npa, blockOrderPayloadWithNxx.quantity, blockOrderPayloadWithNxx.sequential, blockOrderPayloadWithNxx.nxx);
    $httpBackend.flush();
  });

  it('should make a number order', function () {
    $httpBackend.expectPOST(HuronConfig.getTerminusUrl() + '/customers/' + customerId + '/carriers/' + carrierId + '/did/order', pstnOrderPayload).respond(201);
    PstnSetupService.orderNumbers(customerId, carrierId, orderPayload.numbers);
    $httpBackend.flush();
  });

  it('should list pending orders', function () {
    $httpBackend.expectGET(HuronConfig.getTerminusV2Url() + '/customers/' + customerId + '/numbers/orders?status=PENDING&type=PSTN').respond(customerOrderList);
    $httpBackend.expectGET(HuronConfig.getTerminusV2Url() + '/customers/' + customerId + '/numbers/orders?status=PENDING&type=PORT').respond([]);
    var promise = PstnSetupService.listPendingOrders(customerId);
    promise.then(function (orderList) {
      expect(angular.equals(orderList, customerOrderList)).toEqual(true);
    });
    $httpBackend.flush();
  });

  it('should get a single order', function () {
    $httpBackend.expectGET(HuronConfig.getTerminusV2Url() + '/customers/' + customerId + '/numbers/orders/' + orderId).respond(customerOrder);
    var promise = PstnSetupService.getOrder(customerId, orderId);
    promise.then(function (order) {
      expect(angular.equals(order, customerOrder)).toEqual(true);
    });
    $httpBackend.flush();
  });

  it('should list pending numbers', function () {
    $httpBackend.expectGET(HuronConfig.getTerminusV2Url() + '/customers/' + customerId + '/numbers/orders?status=PENDING&type=PSTN').respond(customerOrderList);
    $httpBackend.expectGET(HuronConfig.getTerminusV2Url() + '/customers/' + customerId + '/numbers/orders?status=PENDING&type=PORT').respond([]);
    $httpBackend.expectGET(HuronConfig.getTerminusV2Url() + '/customers/' + customerId + '/numbers/orders/' + '29c63c1f-83b0-42b9-98ee-85624e4c7408').respond(customerOrder);
    $httpBackend.expectGET(HuronConfig.getTerminusV2Url() + '/customers/' + customerId + '/numbers/orders/' + '29c63c1f-83b0-42b9-98ee-85624e4c7409').respond(customerBlockOrder);
    var promise = PstnSetupService.listPendingNumbers(customerId);
    promise.then(function (numbers) {
      expect(numbers).toContain(jasmine.objectContaining({
        pattern: '5125934450'
      }));
      expect(numbers).toContain(jasmine.objectContaining({
        pattern: '(123) XXX-XXXX',
        quantity: 1
      }));
    });
    $httpBackend.flush();
  });

  it('should get orders and filter to formatted number orders', function () {
    $httpBackend.expectGET(HuronConfig.getTerminusV2Url() + '/customers/' + customerId + '/numbers/orders').respond(orders);
    $httpBackend.expectGET(HuronConfig.getTerminusV2Url() + '/customers/' + customerId + '/numbers/orders/' + 'f950f0d4-bde8-4b0d-8762-d306655f24ed').respond(pstnNumberOrder);
    $httpBackend.expectGET(HuronConfig.getTerminusV2Url() + '/customers/' + customerId + '/numbers/orders/' + '8b443bec-c535-4c2d-bebb-6293122d825a').respond(pstnBlockOrder);
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
    var translated = PstnSetupService.translateStatusMessage(orders[3]);
    expect(translated).toEqual(undefined);
  });
});
