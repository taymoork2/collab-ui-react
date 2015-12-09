'use strict';

describe('Service: Huron Customer', function () {
  var $httpBackend, HuronCustomer, HuronConfig;

  beforeEach(module('Huron'));

  var Authinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('1')
  };

  beforeEach(module(function ($provide) {
    $provide.value("Authinfo", Authinfo);
  }));

  beforeEach(inject(function (_$httpBackend_, _HuronCustomer_, _HuronConfig_) {
    $httpBackend = _$httpBackend_;
    HuronCustomer = _HuronCustomer_;
    HuronConfig = _HuronConfig_;
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should exist', function () {
    expect(HuronCustomer).toBeDefined();
  });

  describe('startTrial function', function () {

    it('should start a new trial', function () {
      $httpBackend.expectPOST(HuronConfig.getCmiUrl() + '/common/customers').respond(201);
      HuronCustomer.create('123', 'My Customer', 'myCustomer@cisco.com').then(function (response) {
        expect(response.$resolved).toEqual(true);
      });
      $httpBackend.flush();
    });

    it('should handle an error', function () {
      $httpBackend.expectPOST(HuronConfig.getCmiUrl() + '/common/customers').respond(500);
      HuronCustomer.create('123', 'My Customer', 'myCustomer@cisco.com').catch(function (response) {
        expect(response.status).toEqual(500);
      });
      $httpBackend.flush();
    });

    it('should update an existing customer if receiving a conflict on create', function () {
      $httpBackend.expectPOST(HuronConfig.getCmiUrl() + '/common/customers').respond(409);
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/common/customers/123').respond(200, {
        uuid: '123',
        name: 'My Customer'
      });
      $httpBackend.expectPUT(HuronConfig.getCmiUrl() + '/common/customers/123').respond(200);
      HuronCustomer.create('123', 'My Customer', 'myCustomer@cisco.com').catch(function (response) {
        expect(response.status).toEqual(200);
      });
      $httpBackend.flush();
    });

  });

});
