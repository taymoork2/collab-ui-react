'use strict';

import { SWIVEL } from './pstn.const';

describe('Service: PstnService', function () {

  let suite: any = {};
  suite.customerId = '744d58c5-9205-47d6-b7de-a176e3ca431f';
  suite.partnerId = '4e2befa3-9d82-4fdf-ad31-bb862133f078';
  suite.carrierId = '4f5f5bf7-0034-4ade-8b1c-db63777f062c';
  suite.orderId = '29c63c1f-83b0-42b9-98ee-85624e4c7409';
  suite.reservationId = '061762cc-0f01-42aa-802c-97c293189476';
  suite.userId = 'bc847524-4f88-11e7-b114-b2f933d5fe66';

  let customer = getJSONFixture('huron/json/pstnSetup/customer.json');
  let customerCarrierList = getJSONFixture('huron/json/pstnSetup/customerCarrierList.json');
  let customerOrderList = getJSONFixture('huron/json/pstnSetup/customerOrderList.json');
  let customerV2Order = getJSONFixture('huron/json/pstnSetup/customerV2Order.json');
  const customerBlockOrder = getJSONFixture('huron/json/pstnSetup/customerBlockOrder.json');
  let carrierIntelepeer = getJSONFixture('huron/json/pstnSetup/carrierIntelepeer.json');
  let resellerCarrierList = getJSONFixture('huron/json/pstnSetup/resellerCarrierList.json');

  let orders = getJSONFixture('huron/json/orderManagement/orderManagement.json');
  const pstnNumberOrder = getJSONFixture('huron/json/orderManagement/pstnNumberOrder.json');
  const pstnBlockOrder = getJSONFixture('huron/json/orderManagement/pstnBlockOrder.json');
  const pstnPortOrder = getJSONFixture('huron/json/orderManagement/pstnPortOrder.json');
  let acceptedOrder = getJSONFixture('huron/json/orderManagement/acceptedOrders.json');
  let pendingOrder = _.cloneDeep(getJSONFixture('huron/json/lines/pendingNumbers.json'));

  let onlyPstnNumbers: any = ['+14694691234', '+19724564567'];
  let onlyTollFreeNumbers: any = ['+18554929632', '+18554929636'];
  const onlyImportedNumbers: any = ['3365', '23445'];
  let invalidNumbers: any = ['123', '456'];
  let numbers = onlyPstnNumbers.concat(onlyTollFreeNumbers, invalidNumbers);
  let portNumbers: any = ['+19726579867', '+18004321010'];

  let customerPayload: any = {
    uuid: suite.customerId,
    name: 'myCustomer',
    firstName: 'myFirstName',
    lastName: 'myLastName',
    email: 'myEmail',
    pstnCarrierId: suite.carrierId,
    trial: true,
  };

  let updatePayload: any = {
    pstnCarrierId: suite.carrierId,
  };

  let blockOrderPayload: any = {
    npa: '555',
    quantity: '20',
    numberType: 'DID',
    createdBy: 'PARTNER',
  };

  let blockOrderPayloadWithNxx: any = {
    npa: '555',
    quantity: '20',
    numberType: 'DID',
    sequential: true,
    nxx: '777',
    createdBy: 'CUSTOMER',
  };

  const TollFreeBlockOrderPayload: any = {
    npa: '800',
    quantity: '20',
    numberType: 'TOLLFREE',
    createdBy: 'PARTNER',
  };

  let orderPayload: any = {
    numbers: numbers,
  };

  let portOrderPayload: any = {
    numbers: portNumbers,
  };

  let portOrderV2PstnPayload: any = {
    numbers: ['+19726579867'],
    numberType: 'DID',
    createdBy: 'CUSTOMER',
  };

  let portOrderTfnPayload: any = {
    numbers: ['+18004321010'],
    numberType: 'TOLLFREE',
    createdBy: 'CUSTOMER',
  };

  let pstnOrderPayload: any = {
    numbers: onlyPstnNumbers,
  };

  const swivelOrderPayload: any = {
    numbers: onlyPstnNumbers.concat(onlyTollFreeNumbers).concat(onlyImportedNumbers),
  };

  const swivelOrderV2DidPayload: any = {
    numbers: onlyPstnNumbers,
    numberType: 'DID',
    createdBy: 'PARTNER',
  };

  const e911SigneePayload = {
    e911Signee: suite.userId,
  };

  const swivelOrderV2TfnPayload: any = {
    numbers: onlyTollFreeNumbers,
    numberType: 'TOLLFREE',
    createdBy: 'PARTNER',
  };

  const swivelOrderV2ImportedPayload: any = {
    numbers: onlyImportedNumbers,
    numberType: 'IMPORTED',
    createdBy: 'PARTNER',
  };

  const numberSearchPayload: any = {
    count: '100',
    npa: '206',
    numberType: 'DID',
  };

  const numberSearchPayloadWithSequential: any = {
    count: '100',
    npa: '206',
    numberType: 'DID',
    sequential: true,
  };

  const numberSearchPayloadWithState: any = {
    count: '100',
    npa: '206',
    numberType: 'DID',
    sequential: true,
    state: 'WA',
  };

  // dependencies
  beforeEach(function () {
    this.initModules(
      require('./pstn.service').default,
    );
    this.injectDependencies(
      '$http',
      '$httpBackend',
      '$q',
      '$rootScope',
      'Authinfo',
      'UrlConfig',
      'FeatureToggleService',
      'PstnService',
      'PstnModel',
      'HuronConfig',
      'CountryCodes',
      'PhoneNumberService',
     );
    spyOn(this.Authinfo, 'getCallPartnerOrgId').and.returnValue(suite.partnerId);
    spyOn(this.Authinfo, 'getUserId').and.returnValue(suite.userId);
    spyOn(this.Authinfo, 'isPartner');
    spyOn(this.FeatureToggleService, 'supports').and.returnValue(this.$q.resolve());
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
    this.$httpBackend = null;
    this.HuronConfig = null;
    this.PstnService = null;
    this.PstnModel = null;
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
    portOrderV2PstnPayload = undefined;
    portOrderTfnPayload = undefined;
    pstnOrderPayload = undefined;
  });

  function createCustomerV2() {
    this.PstnService.createCustomerV2(
      customerPayload.uuid,
      customerPayload.name,
      customerPayload.firstName,
      customerPayload.lastName,
      customerPayload.email,
      customerPayload.pstnCarrierId,
      customerPayload.trial,
    );
    this.$httpBackend.flush();
  }

  it('should create a customer', function () {
    this.$httpBackend.expectPOST(this.HuronConfig.getTerminusV2Url() + '/customers', customerPayload).respond(201);

    createCustomerV2.apply(this);
  });

  it('should create a customer with a reseller', function () {
    this.PstnModel.setResellerExists(true);
    const customerResellerPayload = _.cloneDeep(customerPayload);
    customerResellerPayload.resellerId = suite.partnerId;

    this.$httpBackend.expectPOST(this.HuronConfig.getTerminusV2Url() + '/customers', customerResellerPayload).respond(201);
    createCustomerV2.apply(this);
  });

  it('should update a customer\'s carrier', function () {
    this.$httpBackend.expectPUT(this.HuronConfig.getTerminusUrl() + '/customers/' + suite.customerId, updatePayload).respond(200);

    this.PstnService.updateCustomerCarrier(suite.customerId, suite.carrierId);
    this.$httpBackend.flush();
  });

  it('should get a customer', function () {
    this.$httpBackend.expectGET(this.HuronConfig.getTerminusUrl() + '/customers/' + suite.customerId).respond(customer);

    this.PstnService.getCustomer(suite.customerId);
    this.$httpBackend.flush();
  });

  it('should retrieve available default carriers', function () {
    this.$httpBackend.expectGET(this.HuronConfig.getTerminusUrl() + '/carriers?defaultOffer=true&service=PSTN').respond(200);
    this.PstnService.listDefaultCarriers();
    this.$httpBackend.flush();
  });

  it('should retrieve a resellers\'s carriers', function () {
    this.$httpBackend.expectGET(this.HuronConfig.getTerminusV2Url() + '/resellers/' + suite.partnerId + '/carriers').respond(resellerCarrierList);
    this.$httpBackend.expectGET(this.HuronConfig.getTerminusUrl() + '/carriers/' + suite.carrierId).respond(carrierIntelepeer);

    const promise = this.PstnService.listResellerCarriers();
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
    const promise = this.PstnService.listCustomerCarriers(suite.customerId);
    promise.then(function (carrierList) {
      expect(carrierList).toContain(jasmine.objectContaining({
        vendor: 'INTELEPEER',
      }));
    });
    this.$httpBackend.flush();
  });

  it('should make V2 DId port API call', function () {
    this.FeatureToggleService.supports.and.returnValue(this.$q.resolve(true));
    this.Authinfo.isPartner.and.returnValue(false);
    this.$httpBackend.expectPOST(this.HuronConfig.getTerminusV2Url() + '/customers/' + suite.customerId + '/numbers/orders/ports', portOrderV2PstnPayload).respond(201);
    this.$httpBackend.expectPOST(this.HuronConfig.getTerminusV2Url() + '/customers/' + suite.customerId + '/numbers/orders/ports', portOrderTfnPayload).respond(201);
    const portOrderData = _.cloneDeep(portOrderPayload);
    const promise = this.PstnService.portNumbers(suite.customerId, suite.carrierId, portOrderData.numbers);
    //verify the logic to split the ports
    promise.then(function () {
      expect(portOrderData.numbers.length).toEqual(1);
    });
    this.$httpBackend.flush();
  });

  it('should make a block order', function () {
    this.Authinfo.isPartner.and.returnValue(true);
    this.$httpBackend.expectPOST(this.HuronConfig.getTerminusV2Url() + '/customers/' + suite.customerId + '/numbers/orders/blocks', blockOrderPayload).respond(201);
    this.PstnService.orderBlock(suite.customerId, suite.carrierId, blockOrderPayload.npa, blockOrderPayload.quantity);
    this.$httpBackend.flush();
  });

  it('should make a block order with nxx', function () {
    this.Authinfo.isPartner.and.returnValue(false);
    this.$httpBackend.expectPOST(this.HuronConfig.getTerminusV2Url() + '/customers/' + suite.customerId + '/numbers/orders/blocks', blockOrderPayloadWithNxx).respond(201);
    this.PstnService.orderBlock(suite.customerId, suite.carrierId, blockOrderPayloadWithNxx.npa, blockOrderPayloadWithNxx.quantity, blockOrderPayloadWithNxx.sequential, blockOrderPayloadWithNxx.nxx);
    this.$httpBackend.flush();
  });

  it('should make a number order', function () {
    this.$httpBackend.expectPOST(this.HuronConfig.getTerminusUrl() + '/customers/' + suite.customerId + '/carriers/' + suite.carrierId + '/did/order', pstnOrderPayload).respond(201);
    this.PstnService.orderNumbers(suite.customerId, suite.carrierId, orderPayload.numbers);
    this.$httpBackend.flush();
  });

  it('should list pending orders', function () {
    this.$httpBackend.expectGET(this.HuronConfig.getTerminusV2Url() + '/customers/' + suite.customerId + '/numbers/orders?status=PENDING&type=PSTN').respond(customerOrderList);
    this.$httpBackend.expectGET(this.HuronConfig.getTerminusV2Url() + '/customers/' + suite.customerId + '/numbers/orders?status=PENDING&type=PORT').respond([]);
    const promise = this.PstnService.listPendingOrders(suite.customerId);
    promise.then(function (orderList) {
      expect(angular.equals(orderList, customerOrderList)).toEqual(true);
    });
    this.$httpBackend.flush();
  });

  it('should get a single order', function () {
    this.$httpBackend.expectGET(this.HuronConfig.getTerminusV2Url() + '/customers/' + suite.customerId + '/numbers/orders/' + suite.orderId).respond(customerV2Order);
    const promise = this.PstnService.getOrder(suite.customerId, suite.orderId);
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
    const promise = this.PstnService.listPendingNumbers(suite.customerId);
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
    const promise = this.PstnService.getFormattedNumberOrders(suite.customerId);
    promise.then(function (numbers) {
      expect(numbers).toContain(jasmine.objectContaining(acceptedOrder[0]));
      expect(numbers).toContain(jasmine.objectContaining(acceptedOrder[1]));
    });
    this.$httpBackend.flush();
  });

  it('should get translated order status message', function () {
    const translated = this.PstnService.translateStatusMessage(pendingOrder[0]);
    expect(translated).toEqual('pstnSetup.orderStatus.tosNotSigned');
  });

  it('should get original order status message since it does not exist in translations', function () {
    const translated = this.PstnService.translateStatusMessage({
      statusMessage: 'This should not be translated',
    });
    expect(translated).toEqual('This should not be translated');
  });

  it('should not get translated order status message since status is None', function () {
    const translated = this.PstnService.translateStatusMessage(orders[3]);
    expect(translated).toEqual(undefined);
  });

  it('should displayBatchIdOnly order status message since status includes Batch id = None', function () {
    const translated = this.PstnService.translateStatusMessage(orders[5]);
    expect(translated).toEqual('370827,370829');
  });

  it('should make V2 SWIVEL order API call', function () {
    this.FeatureToggleService.supports.and.returnValue(this.$q.resolve(true));
    this.Authinfo.isPartner.and.returnValue(true);
    this.$httpBackend.expectPOST(this.HuronConfig.getTerminusV2Url() + '/customers/' + suite.customerId + '/numbers/orders', swivelOrderV2DidPayload).respond(201);
    this.$httpBackend.expectPOST(this.HuronConfig.getTerminusV2Url() + '/customers/' + suite.customerId + '/numbers/orders', swivelOrderV2TfnPayload).respond(201);
    this.$httpBackend.expectPOST(this.HuronConfig.getTerminusV2Url() + '/customers/' + suite.customerId + '/numbers/orders', swivelOrderV2ImportedPayload).respond(201);
    const swivelOrderData = _.cloneDeep(swivelOrderPayload);
    const promise = this.PstnService.orderNumbersV2Swivel(suite.customerId, swivelOrderData.numbers);
    promise.then(function () {
      expect(swivelOrderData.numbers.length).toEqual(2);
      expect(swivelOrderData.numbers.sort()).toEqual(onlyPstnNumbers.sort());
    });
    this.$httpBackend.flush();
  });

  it('should update the e911Signee', function () {
    this.$httpBackend.expectPUT(this.HuronConfig.getTerminusUrl() + '/customers/' + suite.customerId, e911SigneePayload).respond(200);

    this.PstnService.updateCustomerE911Signee(suite.customerId);
    this.$httpBackend.flush();
  });

  it('should return byop customer esa disclaimer status', function () {
    const byopCustomer = { pstnCarrierId: suite.carrierId };
    const swivelCarrier = { apiImplementation: SWIVEL };

    this.$httpBackend.expectGET(this.HuronConfig.getTerminusV2Url() + '/customers/' + suite.customerId).respond(byopCustomer);
    this.$httpBackend.expectGET(this.HuronConfig.getTerminusUrl() + '/carriers/' + suite.carrierId).respond(swivelCarrier);
    const promise = this.PstnService.isSwivelCustomerAndEsaUnsigned(suite.customerId);
    promise.then(function (result) {
      expect(result).toBe(true);
    });
    this.$httpBackend.flush();
  });

  describe('getCarrierTollFreeInventory', function () {
    it('should call GET on Terminus V2 carrier number count API and query for toll free numbers', function () {
      this.$httpBackend.expectGET(this.HuronConfig.getTerminusV2Url() + '/carriers/' + suite.carrierId + '/numbers/count?numberType=TOLLFREE').respond(200);
      this.PstnService.getCarrierTollFreeInventory(suite.carrierId);
      this.$httpBackend.flush();
    });
  });

  describe('searchCarrierTollFreeInventory', function () {
    it('should call the Terminus V2 carrier number API and query for toll free numbers', function () {
      this.$httpBackend.expectGET(this.HuronConfig.getTerminusV2Url() + '/carriers/' + suite.carrierId + '/numbers?numberType=TOLLFREE').respond(200);
      this.PstnService.searchCarrierTollFreeInventory(suite.carrierId);
      this.$httpBackend.flush();
    });
    it('should call GET on Terminus V2 carrier number API and query for toll free numbers in the 800 area code', function () {
      let params: any = {
        npa: '800',
      };
      this.$httpBackend.expectGET(this.HuronConfig.getTerminusV2Url() + '/carriers/' + suite.carrierId + '/numbers?npa=800&numberType=TOLLFREE').respond(200);
      this.PstnService.searchCarrierTollFreeInventory(suite.carrierId, params);
      this.$httpBackend.flush();
      params = undefined;
    });
    it('should call GET on Terminus V2 carrier number API and query for ten toll free numbers', function () {
      let params: any = {
        count: 10,
      };
      this.$httpBackend.expectGET(this.HuronConfig.getTerminusV2Url() + '/carriers/' + suite.carrierId + '/numbers?count=10&numberType=TOLLFREE').respond(200);
      this.PstnService.searchCarrierTollFreeInventory(suite.carrierId, params);
      this.$httpBackend.flush();
      params = undefined;
    });
  });

  describe('reserveCarrierTollFreeInventory', function () {
    it('should call POST on Terminus V2 customer number reservation API for existing customers', function () {
      let isCustomerExists = true;
      this.$httpBackend.expectPOST(this.HuronConfig.getTerminusV2Url() + '/customers/' + suite.customerId + '/numbers/reservations').respond(201, {}, {
        location: 'http://some/url/123456',
      });
      this.PstnService.reserveCarrierTollFreeInventory(suite.customerId, suite.carrierId, onlyTollFreeNumbers, isCustomerExists);
      this.$httpBackend.flush();
      isCustomerExists = false;
    });
    it('should call POST on Terminus V2 reseller carrier reservation API for non-existing customers', function () {
      let isCustomerExists = false;
      this.$httpBackend.expectPOST(this.HuronConfig.getTerminusV2Url() + '/resellers/' + suite.partnerId + '/carriers/' + suite.carrierId + '/numbers/reservations').respond(201, {}, {
        location: 'http://some/url/123456',
      });
      this.PstnService.reserveCarrierTollFreeInventory(suite.partnerId, suite.carrierId, onlyTollFreeNumbers, isCustomerExists);
      this.$httpBackend.flush();
      isCustomerExists = false;
    });
  });

  describe('releaseCarrierTollFreeInventory', function () {
    it('should call DELETE on Terminus V2 customer number reservation API for existing customers', function () {
      let isCustomerExists = true;
      this.$httpBackend.expectDELETE(this.HuronConfig.getTerminusV2Url() + '/customers/' + suite.customerId + '/numbers/reservations/' + suite.reservationId).respond(200);
      this.PstnService.releaseCarrierTollFreeInventory(suite.customerId, suite.carrierId, onlyTollFreeNumbers, suite.reservationId, isCustomerExists);
      this.$httpBackend.flush();
      isCustomerExists = false;
    });
    it('should call DELETE on Terminus V2 reseller carrier reservation API for non-existing customers', function () {
      let isCustomerExists = false;
      this.$httpBackend.expectDELETE(this.HuronConfig.getTerminusV2Url() + '/resellers/' + suite.partnerId + '/numbers/reservations/' + suite.reservationId).respond(200);
      this.PstnService.releaseCarrierTollFreeInventory(suite.partnerId, suite.carrierId, onlyTollFreeNumbers, suite.reservationId, isCustomerExists);
      this.$httpBackend.flush();
      isCustomerExists = false;
    });
  });

  describe('orderTollFreeBlock', function () {
    it('should call POST on Terminus V2 customer number order block API', function () {
      this.Authinfo.isPartner.and.returnValue(true);
      this.$httpBackend.expectPOST(this.HuronConfig.getTerminusV2Url() + '/customers/' + suite.customerId + '/numbers/orders/blocks', TollFreeBlockOrderPayload).respond(201);
      this.PstnService.orderTollFreeBlock(suite.customerId, suite.carrierId, TollFreeBlockOrderPayload.npa, TollFreeBlockOrderPayload.quantity);
      this.$httpBackend.flush();
    });
  });

  describe('deleteNumber', function () {
    it('should call DELETE on Terminus V2 customer number API', function () {
      this.$httpBackend.expectDELETE(this.HuronConfig.getTerminusV2Url() + '/customers/' + suite.customerId + '/numbers/+155512345678').respond(204);
      this.PstnService.deleteNumber(suite.customerId, '+155512345678');
      this.$httpBackend.flush();
    });
  });

  describe('searchCarrierInventory', function () {
    it('should call carriers/{id}/numbers on Terminus V2 with params matching payload', function () {
      this.$httpBackend.expectGET(this.HuronConfig.getTerminusV2Url() + '/carriers/' + suite.customerId + '/numbers?count=100&npa=206&numberType=DID').respond(201);
      this.PstnService.searchCarrierInventory(suite.customerId, numberSearchPayload);
      this.$httpBackend.flush();
    });

    it('should call carriers/{id}/numbers on Terminus V2 with params matching payload, adding sequential', function () {
      this.$httpBackend.expectGET(this.HuronConfig.getTerminusV2Url() + '/carriers/' + suite.customerId + '/numbers?count=100&npa=206&numberType=DID&sequential=true').respond(201);
      this.PstnService.searchCarrierInventory(suite.customerId, numberSearchPayloadWithSequential);
      this.$httpBackend.flush();
    });

    it('should call carriers/{id}/numbers on Terminus V2 with params matching payload, adding state', function () {
      this.$httpBackend.expectGET(this.HuronConfig.getTerminusV2Url() + '/carriers/' + suite.customerId + '/numbers?count=100&npa=206&numberType=DID&sequential=true&state=WA').respond(201);
      this.PstnService.searchCarrierInventory(suite.customerId, numberSearchPayloadWithState);
      this.$httpBackend.flush();
    });
  });

});
