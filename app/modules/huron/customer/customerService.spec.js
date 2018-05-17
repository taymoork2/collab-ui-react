'use strict';

describe('Service: Huron Customer', function () {
  var $httpBackend, $q, HuronCustomer, HuronConfig, PstnService;

  beforeEach(angular.mock.module('Huron'));

  var Authinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('1'),
  };

  beforeEach(angular.mock.module(function ($provide) {
    $provide.value('Authinfo', Authinfo);
  }));

  beforeEach(inject(function (_$httpBackend_, _$q_, _HuronCustomer_, _HuronConfig_, _PstnService_) {
    $httpBackend = _$httpBackend_;
    $q = _$q_;
    HuronCustomer = _HuronCustomer_;
    HuronConfig = _HuronConfig_;
    PstnService = _PstnService_;

    spyOn(PstnService, 'listResellerCarriers').and.returnValue($q.resolve());
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
      HuronCustomer.create('123', 'My Customer', 'myCustomer@cisco.com');
      $httpBackend.flush();
    });

    it('should lookup the pstn reseller carriers', function () {
      $httpBackend.expectPOST(HuronConfig.getCmiUrl() + '/common/customers').respond(201);
      HuronCustomer.create('123', 'My Customer', 'myCustomer@cisco.com');
      $httpBackend.flush();
      expect(PstnService.listResellerCarriers).toHaveBeenCalled();
    });

    it('should update voice customer when one pstn reseller carrier is found', function () {
      PstnService.listResellerCarriers.and.returnValue($q.resolve([{
        name: 'AUDP_INT',
      }]));
      $httpBackend.expectPOST(HuronConfig.getCmiUrl() + '/common/customers').respond(201);
      $httpBackend.expectPUT(HuronConfig.getCmiUrl() + '/voice/customers/123', {
        carrier: {
          name: 'AUDP_INT',
        },
      }).respond(200);
      HuronCustomer.create('123', 'My Customer', 'myCustomer@cisco.com');
      $httpBackend.flush();
      expect(PstnService.listResellerCarriers).toHaveBeenCalled();
    });

    it('should not update voice customer if pstn reseller is not found', function () {
      PstnService.listResellerCarriers.and.callFake(function () {
        return $q.reject({ status: 404 });
      });
      $httpBackend.expectPOST(HuronConfig.getCmiUrl() + '/common/customers').respond(201);
      HuronCustomer.create('123', 'My Customer', 'myCustomer@cisco.com');
      $httpBackend.flush();
      expect(PstnService.listResellerCarriers).toHaveBeenCalled();
    });

    it('should handle an error', function () {
      $httpBackend.expectPOST(HuronConfig.getCmiUrl() + '/common/customers').respond(500);
      HuronCustomer.create('123', 'My Customer', 'myCustomer@cisco.com').then(fail)
        .catch(function (response) {
          expect(response.status).toEqual(500);
        });
      $httpBackend.flush();
    });

    it('should update an existing customer if receiving a conflict on create', function () {
      $httpBackend.expectPOST(HuronConfig.getCmiUrl() + '/common/customers').respond(409);
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/common/customers/123').respond(200, {
        uuid: '123',
        name: 'My Customer',
      });
      $httpBackend.expectPUT(HuronConfig.getCmiUrl() + '/common/customers/123').respond(200);
      HuronCustomer.create('123', 'My Customer', 'myCustomer@cisco.com').then(function (response) {
        // NOTE: HuronCustomer.create() is coded to not return anything in success case
        expect(response).toBe(undefined);
      });
      $httpBackend.flush();
    });
  });
});
