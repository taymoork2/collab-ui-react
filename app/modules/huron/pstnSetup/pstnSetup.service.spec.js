'use strict';

describe('Service: PstnSetupService', function () {
  var $httpBackend, HuronConfig, PstnSetupService, PstnSetup;

  var suite = {};
  suite.customerId = '744d58c5-9205-47d6-b7de-a176e3ca431f';
  suite.partnerId = '4e2befa3-9d82-4fdf-ad31-bb862133f078';
  suite.carrierId = '4f5f5bf7-0034-4ade-8b1c-db63777f062c';
  suite.orderId = '29c63c1f-83b0-42b9-98ee-85624e4c7409';
  suite.reservationId = '061762cc-0f01-42aa-802c-97c293189476';

  var customer = getJSONFixture('huron/json/pstnSetup/customer.json');
  var customerCarrierList = getJSONFixture('huron/json/pstnSetup/customerCarrierList.json');
  var customerOrderList = getJSONFixture('huron/json/pstnSetup/customerOrderList.json');
  var customerV2Order = getJSONFixture('huron/json/pstnSetup/customerV2Order.json');
  var customerBlockOrder = getJSONFixture('huron/json/pstnSetup/customerBlockOrder.json');
  var carrierIntelepeer = getJSONFixture('huron/json/pstnSetup/carrierIntelepeer.json');
  var resellerCarrierList = getJSONFixture('huron/json/pstnSetup/resellerCarrierList.json');

  var orders = getJSONFixture('huron/json/orderManagement/orderManagement.json');
  var pstnNumberOrder = getJSONFixture('huron/json/orderManagement/pstnNumberOrder.json');
  var pstnBlockOrder = getJSONFixture('huron/json/orderManagement/pstnBlockOrder.json');
  var acceptedOrder = getJSONFixture('huron/json/orderManagement/acceptedOrders.json');
  var pendingOrder = _.cloneDeep(getJSONFixture('huron/json/lines/pendingNumbers.json'));

  var onlyPstnNumbers = ['+14694691234', '+19724564567'];
  var onlyTollFreeNumbers = ['+18554929632', '+18554929636'];
  var invalidNumbers = ['123', '456'];
  var numbers = onlyPstnNumbers.concat(onlyTollFreeNumbers, invalidNumbers);
  var portNumbers = ['+19726579867', '+18004321010'];

  var customerPayload = {
    uuid: suite.customerId,
    name: "myCustomer",
    firstName: "myFirstName",
    lastName: "myLastName",
    email: "myEmail",
    pstnCarrierId: suite.carrierId,
    trial: true,
  };

  var updatePayload = {
    pstnCarrierId: suite.carrierId,
  };

  var blockOrderPayload = {
    "npa": "555",
    "quantity": "20",
  };

  var blockOrderPayloadWithNxx = {
    "npa": "555",
    "quantity": "20",
    "sequential": true,
    "nxx": "777",
  };

  var orderPayload = {
    numbers: numbers,
  };

  var portOrderPayload = {
    numbers: portNumbers,
  };

  var portOrderPstnPayload = {
    numbers: ['+19726579867'],
  };

  var portOrderTfnPayload = {
    numbers: ['+18004321010'],
    numberType: "TOLLFREE",
  };

  var pstnOrderPayload = {
    numbers: onlyPstnNumbers,
  };

  var Authinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue(suite.partnerId),
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
    $httpBackend = null;
    HuronConfig = null;
    PstnSetupService = null;
    PstnSetup = null;
  });

  afterAll(function () {
    suite = undefined;
    customer = undefined;
    customerCarrierList = undefined;
    customerOrderList = undefined;
    customerV2Order = undefined;
    carrierIntelepeer = undefined;
    resellerCarrierList = undefined;
    orders = undefined;
    acceptedOrder = undefined;
    pendingOrder = undefined;
    onlyPstnNumbers = undefined;
    onlyTollFreeNumbers = undefined;
    invalidNumbers = undefined;
    numbers = undefined;
    portNumbers = undefined;
    customerPayload = undefined;
    updatePayload = undefined;
    blockOrderPayload = undefined;
    blockOrderPayloadWithNxx = undefined;
    orderPayload = undefined;
    portOrderPayload = undefined;
    portOrderPstnPayload = undefined;
    portOrderTfnPayload = undefined;
    pstnOrderPayload = undefined;
    Authinfo = undefined;
  });

  function createCustomerV2() {
    PstnSetupService.createCustomerV2(
      customerPayload.uuid,
      customerPayload.name,
      customerPayload.firstName,
      customerPayload.lastName,
      customerPayload.email,
      customerPayload.pstnCarrierId,
      customerPayload.trial
    );
    $httpBackend.flush();
  }

  it('should create a customer', function () {
    $httpBackend.expectPOST(HuronConfig.getTerminusV2Url() + '/customers', customerPayload).respond(201);

    createCustomerV2();
  });

  it('should create a customer with a reseller', function () {
    PstnSetup.setResellerExists(true);
    var customerResellerPayload = angular.copy(customerPayload);
    customerResellerPayload.resellerId = suite.partnerId;

    $httpBackend.expectPOST(HuronConfig.getTerminusV2Url() + '/customers', customerResellerPayload).respond(201);

    createCustomerV2();
  });

  it('should update a customer\'s carrier', function () {
    $httpBackend.expectPUT(HuronConfig.getTerminusUrl() + '/customers/' + suite.customerId, updatePayload).respond(200);

    PstnSetupService.updateCustomerCarrier(suite.customerId, suite.carrierId);
    $httpBackend.flush();
  });

  it('should get a customer', function () {
    $httpBackend.expectGET(HuronConfig.getTerminusUrl() + '/customers/' + suite.customerId).respond(customer);

    PstnSetupService.getCustomer(suite.customerId);
    $httpBackend.flush();
  });

  it('should retrieve available default carriers', function () {
    $httpBackend.expectGET(HuronConfig.getTerminusUrl() + '/carriers?country=US&defaultOffer=true&service=PSTN').respond(200);
    PstnSetupService.listDefaultCarriers();
    $httpBackend.flush();
  });

  it('should retrieve a resellers\'s carriers', function () {
    $httpBackend.expectGET(HuronConfig.getTerminusUrl() + '/resellers/' + suite.partnerId + '/carriers?country=US').respond(resellerCarrierList);
    $httpBackend.expectGET(HuronConfig.getTerminusUrl() + '/carriers/' + suite.carrierId).respond(carrierIntelepeer);

    var promise = PstnSetupService.listResellerCarriers();
    promise.then(function (carrierList) {
      expect(carrierList).toContain(jasmine.objectContaining({
        vendor: 'INTELEPEER',
      }));
    });
    $httpBackend.flush();
  });

  it('should retrieve a customer\'s carrier', function () {
    $httpBackend.expectGET(HuronConfig.getTerminusUrl() + '/customers/' + suite.customerId + '/carriers').respond(customerCarrierList);
    $httpBackend.expectGET(HuronConfig.getTerminusUrl() + '/carriers/' + suite.carrierId).respond(carrierIntelepeer);
    var promise = PstnSetupService.listCustomerCarriers(suite.customerId);
    promise.then(function (carrierList) {
      expect(carrierList).toContain(jasmine.objectContaining({
        vendor: 'INTELEPEER',
      }));
    });
    $httpBackend.flush();
  });

  it('should make different types of port order', function () {
    $httpBackend.expectPOST(HuronConfig.getTerminusUrl() + '/customers/' + suite.customerId + '/carriers/' + suite.carrierId + '/did/port', portOrderPstnPayload).respond(201);
    $httpBackend.expectPOST(HuronConfig.getTerminusV2Url() + '/customers/' + suite.customerId + '/numbers/orders/ports', portOrderTfnPayload).respond(201);
    var promise = PstnSetupService.portNumbers(suite.customerId, suite.carrierId, portOrderPayload.numbers);
    //verify the logic to split the ports
    promise.then(function () {
      expect(portOrderPayload.numbers.length).toEqual(1);
    });
    $httpBackend.flush();
  });

  it('should make a block order', function () {
    $httpBackend.expectPOST(HuronConfig.getTerminusUrl() + '/customers/' + suite.customerId + '/carriers/' + suite.carrierId + '/did/block', blockOrderPayload).respond(201);
    PstnSetupService.orderBlock(suite.customerId, suite.carrierId, blockOrderPayload.npa, blockOrderPayload.quantity);
    $httpBackend.flush();
  });

  it('should make a block order with nxx', function () {
    $httpBackend.expectPOST(HuronConfig.getTerminusUrl() + '/customers/' + suite.customerId + '/carriers/' + suite.carrierId + '/did/block', blockOrderPayloadWithNxx).respond(201);
    PstnSetupService.orderBlock(suite.customerId, suite.carrierId, blockOrderPayloadWithNxx.npa, blockOrderPayloadWithNxx.quantity, blockOrderPayloadWithNxx.sequential, blockOrderPayloadWithNxx.nxx);
    $httpBackend.flush();
  });

  it('should make a number order', function () {
    $httpBackend.expectPOST(HuronConfig.getTerminusUrl() + '/customers/' + suite.customerId + '/carriers/' + suite.carrierId + '/did/order', pstnOrderPayload).respond(201);
    PstnSetupService.orderNumbers(suite.customerId, suite.carrierId, orderPayload.numbers);
    $httpBackend.flush();
  });

  it('should list pending orders', function () {
    $httpBackend.expectGET(HuronConfig.getTerminusV2Url() + '/customers/' + suite.customerId + '/numbers/orders?status=PENDING&type=PSTN').respond(customerOrderList);
    $httpBackend.expectGET(HuronConfig.getTerminusV2Url() + '/customers/' + suite.customerId + '/numbers/orders?status=PENDING&type=PORT').respond([]);
    var promise = PstnSetupService.listPendingOrders(suite.customerId);
    promise.then(function (orderList) {
      expect(angular.equals(orderList, customerOrderList)).toEqual(true);
    });
    $httpBackend.flush();
  });

  it('should get a single order', function () {
    $httpBackend.expectGET(HuronConfig.getTerminusV2Url() + '/customers/' + suite.customerId + '/numbers/orders/' + suite.orderId).respond(customerV2Order);
    var promise = PstnSetupService.getOrder(suite.customerId, suite.orderId);
    promise.then(function (order) {
      expect(angular.equals(order, customerV2Order)).toEqual(true);
    });
    $httpBackend.flush();
  });

  it('should list pending numbers', function () {
    $httpBackend.expectGET(HuronConfig.getTerminusV2Url() + '/customers/' + suite.customerId + '/numbers/orders?status=PENDING&type=PSTN').respond(customerOrderList);
    $httpBackend.expectGET(HuronConfig.getTerminusV2Url() + '/customers/' + suite.customerId + '/numbers/orders?status=PENDING&type=PORT').respond([]);
    $httpBackend.expectGET(HuronConfig.getTerminusV2Url() + '/customers/' + suite.customerId + '/numbers/orders/' + '29c63c1f-83b0-42b9-98ee-85624e4c7408').respond(customerV2Order);
    $httpBackend.expectGET(HuronConfig.getTerminusV2Url() + '/customers/' + suite.customerId + '/numbers/orders/' + '29c63c1f-83b0-42b9-98ee-85624e4c7409').respond(customerBlockOrder);
    var promise = PstnSetupService.listPendingNumbers(suite.customerId);
    promise.then(function (numbers) {
      expect(numbers).toContain(jasmine.objectContaining({
        pattern: '5125934450',
      }));
      expect(numbers).toContain(jasmine.objectContaining({
        pattern: '(123) XXX-XXXX',
        quantity: 1,
      }));
    });
    $httpBackend.flush();
  });

  it('should get orders and filter to formatted number orders', function () {
    $httpBackend.expectGET(HuronConfig.getTerminusV2Url() + '/customers/' + suite.customerId + '/numbers/orders').respond(orders);
    $httpBackend.expectGET(HuronConfig.getTerminusV2Url() + '/customers/' + suite.customerId + '/numbers/orders/' + 'f950f0d4-bde8-4b0d-8762-d306655f24ed').respond(pstnNumberOrder);
    $httpBackend.expectGET(HuronConfig.getTerminusV2Url() + '/customers/' + suite.customerId + '/numbers/orders/' + '8b443bec-c535-4c2d-bebb-6293122d825a').respond(pstnBlockOrder);
    var promise = PstnSetupService.getFormattedNumberOrders(suite.customerId);
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
      statusMessage: 'This should not be translated',
    });
    expect(translated).toEqual('This should not be translated');
  });

  it('should not get translated order status message since status is None', function () {
    var translated = PstnSetupService.translateStatusMessage(orders[3]);
    expect(translated).toEqual(undefined);
  });

  describe('getCarrierTollFreeInventory', function () {
    it('should call GET on Terminus V2 carrier number count API and query for toll free numbers', function () {
      $httpBackend.expectGET(HuronConfig.getTerminusV2Url() + '/carriers/' + suite.carrierId + '/numbers/count?numberType=TOLLFREE').respond(200);
      PstnSetupService.getCarrierTollFreeInventory(suite.carrierId);
      $httpBackend.flush();
    });
  });

  describe('searchCarrierTollFreeInventory', function () {
    it('should call the Terminus V2 carrier number API and query for toll free numbers', function () {
      $httpBackend.expectGET(HuronConfig.getTerminusV2Url() + '/carriers/' + suite.carrierId + '/numbers?numberType=TOLLFREE').respond(200);
      PstnSetupService.searchCarrierTollFreeInventory(suite.carrierId);
      $httpBackend.flush();
    });
    it('should call GET on Terminus V2 carrier number API and query for toll free numbers in the 800 area code', function () {
      var params = {
        npa: "800",
      };
      $httpBackend.expectGET(HuronConfig.getTerminusV2Url() + '/carriers/' + suite.carrierId + '/numbers?npa=800&numberType=TOLLFREE').respond(200);
      PstnSetupService.searchCarrierTollFreeInventory(suite.carrierId, params);
      $httpBackend.flush();
      params = undefined;
    });
    it('should call GET on Terminus V2 carrier number API and query for ten toll free numbers', function () {
      var params = {
        count: 10,
      };
      $httpBackend.expectGET(HuronConfig.getTerminusV2Url() + '/carriers/' + suite.carrierId + '/numbers?count=10&numberType=TOLLFREE').respond(200);
      PstnSetupService.searchCarrierTollFreeInventory(suite.carrierId, params);
      $httpBackend.flush();
      params = undefined;
    });
  });

  describe('reserveCarrierTollFreeInventory', function () {
    it('should call POST on Terminus V2 customer number reservation API for existing customers', function () {
      var isCustomerExists = true;
      $httpBackend.expectPOST(HuronConfig.getTerminusV2Url() + '/customers/' + suite.customerId + '/numbers/reservations').respond(201, {}, {
        'location': 'http://some/url/123456',
      });
      PstnSetupService.reserveCarrierTollFreeInventory(suite.customerId, suite.carrierId, onlyTollFreeNumbers, isCustomerExists);
      $httpBackend.flush();
      isCustomerExists = undefined;
    });
    it('should call POST on Terminus V2 reseller carrier reservation API for non-existing customers', function () {
      var isCustomerExists = false;
      $httpBackend.expectPOST(HuronConfig.getTerminusV2Url() + '/resellers/' + suite.partnerId + '/carriers/' + suite.carrierId + '/numbers/reservations').respond(201, {}, {
        'location': 'http://some/url/123456',
      });
      PstnSetupService.reserveCarrierTollFreeInventory(suite.partnerId, suite.carrierId, onlyTollFreeNumbers, isCustomerExists);
      $httpBackend.flush();
      isCustomerExists = undefined;
    });
  });

  describe('releaseCarrierTollFreeInventory', function () {
    it('should call DELETE on Terminus V2 customer number reservation API for existing customers', function () {
      var isCustomerExists = true;
      $httpBackend.expectDELETE(HuronConfig.getTerminusV2Url() + '/customers/' + suite.customerId + '/numbers/reservations/' + suite.reservationId).respond(200);
      PstnSetupService.releaseCarrierTollFreeInventory(suite.customerId, suite.carrierId, onlyTollFreeNumbers, suite.reservationId, isCustomerExists);
      $httpBackend.flush();
      isCustomerExists = undefined;
    });
    it('should call DELETE on Terminus V2 reseller carrier reservation API for non-existing customers', function () {
      var isCustomerExists = false;
      $httpBackend.expectDELETE(HuronConfig.getTerminusV2Url() + '/resellers/' + suite.partnerId + '/numbers/reservations/' + suite.reservationId).respond(200);
      PstnSetupService.releaseCarrierTollFreeInventory(suite.partnerId, suite.carrierId, onlyTollFreeNumbers, suite.reservationId, isCustomerExists);
      $httpBackend.flush();
      isCustomerExists = undefined;
    });
  });

  describe('orderTollFreeBlock', function () {
    it('should call POST on Terminus V2 customer number order block API', function () {
      $httpBackend.expectPOST(HuronConfig.getTerminusV2Url() + '/customers/' + suite.customerId + '/numbers/orders/blocks').respond(201);
      PstnSetupService.orderTollFreeBlock(suite.customerId);
      $httpBackend.flush();
    });
  });
});
