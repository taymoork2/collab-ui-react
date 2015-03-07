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
      $httpBackend.whenPOST(HuronConfig.getCmiUrl() + '/common/customers').respond(201);
      HuronCustomer.create('123', 'My Customer', 'myCustomer@cisco.com').then(function (response) {
        expect(response['$resolved']).toEqual(true);
      });
      $httpBackend.flush();
    });

    it('should handle an error', function () {
      $httpBackend.whenPOST(HuronConfig.getCmiUrl() + '/common/customers').respond(500);
      HuronCustomer.create('123', 'My Customer', 'myCustomer@cisco.com').catch(function (response) {
        expect(response.status).toEqual(500);
      });
      $httpBackend.flush();
    });

  });

});
