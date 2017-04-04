'use strict';

describe('Service: PstnSetupService', function () {

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
  var pstnPortOrder = getJSONFixture('huron/json/orderManagement/pstnPortOrder.json');
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

  var portOrderV2PstnPayload = {
    numbers: ['+19726579867'],
    numberType: "DID",
  };

  var portOrderTfnPayload = {
    numbers: ['+18004321010'],
    numberType: "TOLLFREE",
  };

  var pstnOrderPayload = {
    numbers: onlyPstnNumbers,
  };

  // dependencies
  beforeEach(function () {
    this.initModules(
      require('./pstnSetup.service'),
      require('collab-ui')
    );
    this.injectDependencies(
      '$http',
      '$httpBackend',
      '$q',
      '$rootScope',
      'Authinfo',
      'UrlConfig',
      'FeatureToggleService',
      'PstnSetupService',
      'PstnSetup',
      'HuronConfig',
      'CountryCodes',
      'TelephoneNumberService'
     );
    spyOn(this.Authinfo, 'getOrgId').and.returnValue(suite.partnerId);
    spyOn(this.FeatureToggleService, 'supports').and.returnValue(this.$q.resolve());
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
    this.$httpBackend = null;
    this.HuronConfig = null;
    this.PstnSetupService = null;
    this.PstnSetup = null;
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
    portOrderV2PstnPayload = undefined;
    portOrderTfnPayload = undefined;
    pstnOrderPayload = undefined;
  });

  function createCustomerV2() {
    this.PstnSetupService.createCustomerV2(
      customerPayload.uuid,
      customerPayload.name,
      customerPayload.firstName,
      customerPayload.lastName,
      customerPayload.email,
      customerPayload.pstnCarrierId,
      customerPayload.trial
    );
    this.$httpBackend.flush();
  }

  it('should create a customer', function () {
    this.$httpBackend.expectPOST(this.HuronConfig.getTerminusV2Url() + '/customers', customerPayload).respond(201);

    createCustomerV2.apply(this);
  });

  it('should create a customer with a reseller', function () {
    this.PstnSetup.setResellerExists(true);
    var customerResellerPayload = _.cloneDeep(customerPayload);
    customerResellerPayload.resellerId = suite.partnerId;

    this.$httpBackend.expectPOST(this.HuronConfig.getTerminusV2Url() + '/customers', customerResellerPayload).respond(201);
    createCustomerV2.apply(this);
  });

  it('should update a customer\'s carrier', function () {
    this.$httpBackend.expectPUT(this.HuronConfig.getTerminusUrl() + '/customers/' + suite.customerId, updatePayload).respond(200);

    this.PstnSetupService.updateCustomerCarrier(suite.customerId, suite.carrierId);
    this.$httpBackend.flush();
  });

  it('should get a customer', function () {
    this.$httpBackend.expectGET(this.HuronConfig.getTerminusUrl() + '/customers/' + suite.customerId).respond(customer);

    this.PstnSetupService.getCustomer(suite.customerId);
    this.$httpBackend.flush();
  });

  it('should retrieve available default carriers', function () {
    this.$httpBackend.expectGET(this.HuronConfig.getTerminusUrl() + '/carriers?defaultOffer=true&service=PSTN').respond(200);
    this.PstnSetupService.listDefaultCarriers();
    this.$httpBackend.flush();
  });

  it('should retrieve a resellers\'s carriers', function () {
    this.$httpBackend.expectGET(this.HuronConfig.getTerminusUrl() + '/resellers/' + suite.partnerId + '/carriers').respond(resellerCarrierList);
    this.$httpBackend.expectGET(this.HuronConfig.getTerminusUrl() + '/carriers/' + suite.carrierId).respond(carrierIntelepeer);

    var promise = this.PstnSetupService.listResellerCarriers();
    promise.then(function (carrierList) {
      expect(carrierList).toContain(jasmine.objectContaining({
        vendor: 'INTELEPEER',
      }));
    });
    this.$httpBackend.flush();
  });

  it('should retrieve a customer\'s carrier', function () {
    this.$httpBackend.expectGET(this.HuronConfig.getTerminusUrl() + '/customers/' + suite.customerId + '/carriers').respond(customerCarrierList);
    this.$httpBackend.expectGET(this.HuronConfig.getTerminusUrl() + '/carriers/' + suite.carrierId).respond(carrierIntelepeer);
    var promise = this.PstnSetupService.listCustomerCarriers(suite.customerId);
    promise.then(function (carrierList) {
      expect(carrierList).toContain(jasmine.objectContaining({
        vendor: 'INTELEPEER',
      }));
    });
    this.$httpBackend.flush();
  });

  it('should make different types of port order', function () {
    this.FeatureToggleService.supports.and.returnValue(this.$q.resolve(false));
    this.$httpBackend.expectPOST(this.HuronConfig.getTerminusUrl() + '/customers/' + suite.customerId + '/carriers/' + suite.carrierId + '/did/port', portOrderPstnPayload).respond(201);
    this.$httpBackend.expectPOST(this.HuronConfig.getTerminusV2Url() + '/customers/' + suite.customerId + '/numbers/orders/ports', portOrderTfnPayload).respond(201);
    var portOrderData = _.cloneDeep(portOrderPayload);
    var promise = this.PstnSetupService.portNumbers(suite.customerId, suite.carrierId, portOrderData.numbers);
    //verify the logic to split the ports
    promise.then(function () {
      expect(portOrderData.numbers.length).toEqual(1);
    });
    this.$httpBackend.flush();
  });

  it('feature toggle should make V2 DId port API call', function () {
    this.FeatureToggleService.supports.and.returnValue(this.$q.resolve(true));
    this.$httpBackend.expectPOST(this.HuronConfig.getTerminusV2Url() + '/customers/' + suite.customerId + '/numbers/orders/ports', portOrderV2PstnPayload).respond(201);
    this.$httpBackend.expectPOST(this.HuronConfig.getTerminusV2Url() + '/customers/' + suite.customerId + '/numbers/orders/ports', portOrderTfnPayload).respond(201);
    var portOrderData = _.cloneDeep(portOrderPayload);
    var promise = this.PstnSetupService.portNumbers(suite.customerId, suite.carrierId, portOrderData.numbers);
    //verify the logic to split the ports
    promise.then(function () {
      expect(portOrderData.numbers.length).toEqual(1);
    });
    this.$httpBackend.flush();
  });

  it('should make a block order', function () {
    this.$httpBackend.expectPOST(this.HuronConfig.getTerminusUrl() + '/customers/' + suite.customerId + '/carriers/' + suite.carrierId + '/did/block', blockOrderPayload).respond(201);
    this.PstnSetupService.orderBlock(suite.customerId, suite.carrierId, blockOrderPayload.npa, blockOrderPayload.quantity);
    this.$httpBackend.flush();
  });

  it('should make a block order with nxx', function () {
    this.$httpBackend.expectPOST(this.HuronConfig.getTerminusUrl() + '/customers/' + suite.customerId + '/carriers/' + suite.carrierId + '/did/block', blockOrderPayloadWithNxx).respond(201);
    this.PstnSetupService.orderBlock(suite.customerId, suite.carrierId, blockOrderPayloadWithNxx.npa, blockOrderPayloadWithNxx.quantity, blockOrderPayloadWithNxx.sequential, blockOrderPayloadWithNxx.nxx);
    this.$httpBackend.flush();
  });

  it('should make a number order', function () {
    this.$httpBackend.expectPOST(this.HuronConfig.getTerminusUrl() + '/customers/' + suite.customerId + '/carriers/' + suite.carrierId + '/did/order', pstnOrderPayload).respond(201);
    this.PstnSetupService.orderNumbers(suite.customerId, suite.carrierId, orderPayload.numbers);
    this.$httpBackend.flush();
  });

  it('should list pending orders', function () {
    this.$httpBackend.expectGET(this.HuronConfig.getTerminusV2Url() + '/customers/' + suite.customerId + '/numbers/orders?status=PENDING&type=PSTN').respond(customerOrderList);
    this.$httpBackend.expectGET(this.HuronConfig.getTerminusV2Url() + '/customers/' + suite.customerId + '/numbers/orders?status=PENDING&type=PORT').respond([]);
    var promise = this.PstnSetupService.listPendingOrders(suite.customerId);
    promise.then(function (orderList) {
      expect(angular.equals(orderList, customerOrderList)).toEqual(true);
    });
    this.$httpBackend.flush();
  });

  it('should get a single order', function () {
    this.$httpBackend.expectGET(this.HuronConfig.getTerminusV2Url() + '/customers/' + suite.customerId + '/numbers/orders/' + suite.orderId).respond(customerV2Order);
    var promise = this.PstnSetupService.getOrder(suite.customerId, suite.orderId);
    promise.then(function (order) {
      expect(angular.equals(order, customerV2Order)).toEqual(true);
    });
    this.$httpBackend.flush();
  });

  it('should list pending numbers', function () {
    this.$httpBackend.expectGET(this.HuronConfig.getTerminusV2Url() + '/customers/' + suite.customerId + '/numbers/orders?status=PENDING&type=PSTN').respond(customerOrderList);
    this.$httpBackend.expectGET(this.HuronConfig.getTerminusV2Url() + '/customers/' + suite.customerId + '/numbers/orders?status=PENDING&type=PORT').respond([]);
    this.$httpBackend.expectGET(this.HuronConfig.getTerminusV2Url() + '/customers/' + suite.customerId + '/numbers/orders/' + '29c63c1f-83b0-42b9-98ee-85624e4c7408').respond(customerV2Order);
    this.$httpBackend.expectGET(this.HuronConfig.getTerminusV2Url() + '/customers/' + suite.customerId + '/numbers/orders/' + '29c63c1f-83b0-42b9-98ee-85624e4c7409').respond(customerBlockOrder);
    var promise = this.PstnSetupService.listPendingNumbers(suite.customerId);
    promise.then(function (numbers) {
      expect(numbers).toContain(jasmine.objectContaining({
        pattern: '5125934450',
      }));
      expect(numbers).toContain(jasmine.objectContaining({
        pattern: '(123) XXX-XXXX',
        quantity: 1,
      }));
    });
    this.$httpBackend.flush();
  });

  it('should get orders and filter to formatted number orders', function () {
    this.$httpBackend.expectGET(this.HuronConfig.getTerminusV2Url() + '/customers/' + suite.customerId + '/numbers/orders').respond(orders);
    this.$httpBackend.expectGET(this.HuronConfig.getTerminusV2Url() + '/customers/' + suite.customerId + '/numbers/orders/' + 'f950f0d4-bde8-4b0d-8762-d306655f24ed').respond(pstnNumberOrder);
    this.$httpBackend.expectGET(this.HuronConfig.getTerminusV2Url() + '/customers/' + suite.customerId + '/numbers/orders/' + '8b443bec-c535-4c2d-bebb-6293122d825a').respond(pstnBlockOrder);
    this.$httpBackend.expectGET(this.HuronConfig.getTerminusV2Url() + '/customers/' + suite.customerId + '/numbers/orders/' + '62afd8be-087c-4987-b459-badc33cf964f').respond(pstnPortOrder);
    var promise = this.PstnSetupService.getFormattedNumberOrders(suite.customerId);
    promise.then(function (numbers) {
      expect(numbers).toContain(jasmine.objectContaining(acceptedOrder[0]));
      expect(numbers).toContain(jasmine.objectContaining(acceptedOrder[1]));
    });
    this.$httpBackend.flush();
  });

  it('should get translated order status message', function () {
    var translated = this.PstnSetupService.translateStatusMessage(pendingOrder[0]);
    expect(translated).toEqual('pstnSetup.orderStatus.trialStatus');
  });

  it('should get original order status message since it does not exist in translations', function () {
    var translated = this.PstnSetupService.translateStatusMessage({
      statusMessage: 'This should not be translated',
    });
    expect(translated).toEqual('This should not be translated');
  });

  it('should not get translated order status message since status is None', function () {
    var translated = this.PstnSetupService.translateStatusMessage(orders[3]);
    expect(translated).toEqual(undefined);
  });

  it('should displayBatchIdOnly order status message since status includes Batch id = None', function () {
    var translated = this.PstnSetupService.translateStatusMessage(orders[5]);
    expect(translated).toEqual("370827,370829");
  });

  describe('getCarrierTollFreeInventory', function () {
    it('should call GET on Terminus V2 carrier number count API and query for toll free numbers', function () {
      this.$httpBackend.expectGET(this.HuronConfig.getTerminusV2Url() + '/carriers/' + suite.carrierId + '/numbers/count?numberType=TOLLFREE').respond(200);
      this.PstnSetupService.getCarrierTollFreeInventory(suite.carrierId);
      this.$httpBackend.flush();
    });
  });

  describe('searchCarrierTollFreeInventory', function () {
    it('should call the Terminus V2 carrier number API and query for toll free numbers', function () {
      this.$httpBackend.expectGET(this.HuronConfig.getTerminusV2Url() + '/carriers/' + suite.carrierId + '/numbers?numberType=TOLLFREE').respond(200);
      this.PstnSetupService.searchCarrierTollFreeInventory(suite.carrierId);
      this.$httpBackend.flush();
    });
    it('should call GET on Terminus V2 carrier number API and query for toll free numbers in the 800 area code', function () {
      var params = {
        npa: "800",
      };
      this.$httpBackend.expectGET(this.HuronConfig.getTerminusV2Url() + '/carriers/' + suite.carrierId + '/numbers?npa=800&numberType=TOLLFREE').respond(200);
      this.PstnSetupService.searchCarrierTollFreeInventory(suite.carrierId, params);
      this.$httpBackend.flush();
      params = undefined;
    });
    it('should call GET on Terminus V2 carrier number API and query for ten toll free numbers', function () {
      var params = {
        count: 10,
      };
      this.$httpBackend.expectGET(this.HuronConfig.getTerminusV2Url() + '/carriers/' + suite.carrierId + '/numbers?count=10&numberType=TOLLFREE').respond(200);
      this.PstnSetupService.searchCarrierTollFreeInventory(suite.carrierId, params);
      this.$httpBackend.flush();
      params = undefined;
    });
  });

  describe('reserveCarrierTollFreeInventory', function () {
    it('should call POST on Terminus V2 customer number reservation API for existing customers', function () {
      var isCustomerExists = true;
      this.$httpBackend.expectPOST(this.HuronConfig.getTerminusV2Url() + '/customers/' + suite.customerId + '/numbers/reservations').respond(201, {}, {
        'location': 'http://some/url/123456',
      });
      this.PstnSetupService.reserveCarrierTollFreeInventory(suite.customerId, suite.carrierId, onlyTollFreeNumbers, isCustomerExists);
      this.$httpBackend.flush();
      isCustomerExists = undefined;
    });
    it('should call POST on Terminus V2 reseller carrier reservation API for non-existing customers', function () {
      var isCustomerExists = false;
      this.$httpBackend.expectPOST(this.HuronConfig.getTerminusV2Url() + '/resellers/' + suite.partnerId + '/carriers/' + suite.carrierId + '/numbers/reservations').respond(201, {}, {
        'location': 'http://some/url/123456',
      });
      this.PstnSetupService.reserveCarrierTollFreeInventory(suite.partnerId, suite.carrierId, onlyTollFreeNumbers, isCustomerExists);
      this.$httpBackend.flush();
      isCustomerExists = undefined;
    });
  });

  describe('releaseCarrierTollFreeInventory', function () {
    it('should call DELETE on Terminus V2 customer number reservation API for existing customers', function () {
      var isCustomerExists = true;
      this.$httpBackend.expectDELETE(this.HuronConfig.getTerminusV2Url() + '/customers/' + suite.customerId + '/numbers/reservations/' + suite.reservationId).respond(200);
      this.PstnSetupService.releaseCarrierTollFreeInventory(suite.customerId, suite.carrierId, onlyTollFreeNumbers, suite.reservationId, isCustomerExists);
      this.$httpBackend.flush();
      isCustomerExists = undefined;
    });
    it('should call DELETE on Terminus V2 reseller carrier reservation API for non-existing customers', function () {
      var isCustomerExists = false;
      this.$httpBackend.expectDELETE(this.HuronConfig.getTerminusV2Url() + '/resellers/' + suite.partnerId + '/numbers/reservations/' + suite.reservationId).respond(200);
      this.PstnSetupService.releaseCarrierTollFreeInventory(suite.partnerId, suite.carrierId, onlyTollFreeNumbers, suite.reservationId, isCustomerExists);
      this.$httpBackend.flush();
      isCustomerExists = undefined;
    });
  });

  describe('orderTollFreeBlock', function () {
    it('should call POST on Terminus V2 customer number order block API', function () {
      this.$httpBackend.expectPOST(this.HuronConfig.getTerminusV2Url() + '/customers/' + suite.customerId + '/numbers/orders/blocks').respond(201);
      this.PstnSetupService.orderTollFreeBlock(suite.customerId);
      this.$httpBackend.flush();
    });
  });
});
