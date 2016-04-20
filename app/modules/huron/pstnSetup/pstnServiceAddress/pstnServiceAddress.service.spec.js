'use strict';

describe('Service: PstnServiceAddressService', function () {
  var $httpBackend, HuronConfig, PstnServiceAddressService;

  var customerId = '744d58c5-9205-47d6-b7de-a176e3ca431f';
  var siteId = '29c63c1f-83b0-42b9-98ee-85624e4c9234';

  var customerSiteList = getJSONFixture('huron/json/pstnSetup/customerSiteList.json');
  var customerSite = getJSONFixture('huron/json/pstnSetup/customerSite.json');

  var address, terminusAddress, serviceAddress;

  beforeEach(module('Huron'));

  beforeEach(inject(function (_$httpBackend_, _HuronConfig_, _PstnServiceAddressService_) {
    $httpBackend = _$httpBackend_;
    HuronConfig = _HuronConfig_;
    PstnServiceAddressService = _PstnServiceAddressService_;

    address = {
      streetAddress: '123 My Street Drive',
      unit: 'Apt 100',
      city: 'Richardson',
      state: 'TX',
      zip: '75082'
    };

    terminusAddress = {
      address1: '123 My Street Drive',
      address2: 'Apt 100',
      city: 'Richardson',
      state: 'TX',
      zip: '75082'
    };

    serviceAddress = {
      serviceName: '',
      serviceStreetNumber: '123',
      serviceStreetDirection: '',
      serviceStreetName: 'My Street',
      serviceStreetSuffix: 'Drive',
      serviceAddressSub: 'Apt 100',
      serviceCity: 'Richardson',
      serviceState: 'TX',
      serviceZip: '75082'
    };
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should lookup an address through terminus and find a match', function () {
    $httpBackend.expectPOST(HuronConfig.getTerminusUrl() + '/lookup/e911', terminusAddress).respond({
      addresses: [terminusAddress]
    });
    PstnServiceAddressService.lookupAddress(address).then(function (response) {
      expect(response).toEqual(jasmine.objectContaining(address));
    });
    $httpBackend.flush();
  });

  it('should list customer sites', function () {
    $httpBackend.expectGET(HuronConfig.getTerminusUrl() + '/customers/' + customerId + '/sites').respond(customerSiteList);
    $httpBackend.expectGET(HuronConfig.getTerminusUrl() + '/customers/' + customerId + '/sites/' + siteId).respond(customerSite);
    PstnServiceAddressService.listCustomerSites(customerId).then(function (response) {
      expect(response).toEqual([jasmine.objectContaining({
        "uuid": "29c63c1f-83b0-42b9-98ee-85624e4c9234",
        "name": "Test Customer Site",
        "serviceAddress": {
          "serviceName": "",
          "serviceStreetNumber": "123",
          "serviceStreetDirection": "",
          "serviceStreetName": "My Street",
          "serviceStreetSuffix": "Drive",
          "serviceAddressSub": "Apt 100",
          "serviceCity": "Richardson",
          "serviceState": "TX",
          "serviceZip": "75082"
        }
      })]);
    });
    $httpBackend.flush();
  });

  it('should create a customer site', function () {
    $httpBackend.expectPOST(HuronConfig.getTerminusUrl() + '/customers/' + customerId + '/sites', {
      name: '',
      serviceAddress: serviceAddress
    }).respond(201);
    PstnServiceAddressService.createCustomerSite(customerId, '', address);
    $httpBackend.flush();
  });

  it('should get a customer\'s address', function () {
    $httpBackend.expectGET(HuronConfig.getTerminusUrl() + '/customers/' + customerId + '/sites').respond(customerSiteList);
    $httpBackend.expectGET(HuronConfig.getTerminusUrl() + '/customers/' + customerId + '/sites/' + siteId).respond(customerSite);
    PstnServiceAddressService.getAddress(customerId).then(function (response) {
      expect(response).toEqual(address);
    });
    $httpBackend.flush();
  });

  describe('update street address', function () {
    beforeEach(function () {
      $httpBackend.expectGET(HuronConfig.getTerminusUrl() + '/customers/' + customerId + '/sites').respond(customerSiteList);
      $httpBackend.expectGET(HuronConfig.getTerminusUrl() + '/customers/' + customerId + '/sites/' + siteId).respond(customerSite);
      $httpBackend.expectPUT(HuronConfig.getTerminusUrl() + '/customers/' + customerId + '/sites/' + siteId, {
        serviceAddress: serviceAddress
      }).respond(200);
    });
    afterEach(function () {
      PstnServiceAddressService.updateAddress(customerId, address);
      $httpBackend.flush();
    });

    it('should update address with a nondescript address and no suffix', function () {
      address.streetAddress = '123 Lexi Petal';

      // Expected values
      serviceAddress.serviceStreetNumber = '123';
      serviceAddress.serviceStreetName = 'Lexi Petal';
      serviceAddress.serviceStreetSuffix = '';
    });

    it('should update address with a street address containing possible suffix', function () {
      address.streetAddress = '123 My Street';

      // Expected values
      serviceAddress.serviceStreetNumber = '123';
      serviceAddress.serviceStreetName = 'My';
      serviceAddress.serviceStreetSuffix = 'Street';
    });

    it('should update address with a suffix', function () {
      address.streetAddress = '123 My Street Drive';

      // Expected values
      serviceAddress.serviceStreetNumber = '123';
      serviceAddress.serviceStreetName = 'My Street';
      serviceAddress.serviceStreetSuffix = 'Drive';
    });
  });

});
