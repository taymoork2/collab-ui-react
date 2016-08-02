'use strict';

describe('Service: CmiKemService', function () {
  var CmiKemService, $httpBackend, HuronConfig;
  // require('jasmine-collection-matchers');
  var Authinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('1')
  };

  var successSpy;
  var failureSpy;

  beforeEach(module('Squared'));
  beforeEach(module('Huron'));

  beforeEach(module(function ($provide) {
    $provide.value("Authinfo", Authinfo);
  }));

  beforeEach(inject(function (_CmiKemService_, _$httpBackend_, _HuronConfig_) {
    CmiKemService = _CmiKemService_;
    $httpBackend = _$httpBackend_;
    HuronConfig = _HuronConfig_;

    successSpy = jasmine.createSpy('success');
    failureSpy = jasmine.createSpy('failure');
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('getKEM', function () {
    it('should get list of KEM', function () {
      $httpBackend.whenGET(HuronConfig.getCmiUrl() + '/voice/customers/1/sipendpoints/2/addonmodules').respond(200);
      CmiKemService.getKEM(2).then(
        successSpy,
        failureSpy
      );
      $httpBackend.flush();
      expect(successSpy).toHaveBeenCalled();
      expect(failureSpy).not.toHaveBeenCalled();
    });

    it('should NOT notify on Not Found 404', function () {
      $httpBackend.whenGET(HuronConfig.getCmiUrl() + '/voice/customers/1/sipendpoints/2/addonmodules').respond(404);
      CmiKemService.getKEM(2).then(
        successSpy,
        failureSpy
      );
      $httpBackend.flush();
      expect(successSpy).not.toHaveBeenCalled();
      expect(failureSpy).toHaveBeenCalled();
    });
  });

  describe('createKEM', function () {
    it('should get list of KEM', function () {
      $httpBackend.whenPOST(HuronConfig.getCmiUrl() + '/voice/customers/1/sipendpoints/2/addonmodules').respond(200);
      CmiKemService.createKEM(2, 1).then(
        successSpy,
        failureSpy
      );
      $httpBackend.flush();
      expect(successSpy).toHaveBeenCalled();
      expect(failureSpy).not.toHaveBeenCalled();
    });

    it('should NOT notify on Not Found 404', function () {
      $httpBackend.whenPOST(HuronConfig.getCmiUrl() + '/voice/customers/1/sipendpoints/2/addonmodules').respond(404);
      CmiKemService.createKEM(2, 1).then(
        successSpy,
        failureSpy
      );
      $httpBackend.flush();
      expect(successSpy).not.toHaveBeenCalled();
      expect(failureSpy).toHaveBeenCalled();
    });
  });

  describe('deleteKEM', function () {
    it('should get list of KEM', function () {
      $httpBackend.whenDELETE(HuronConfig.getCmiUrl() + '/voice/customers/1/sipendpoints/2/addonmodules/1').respond(200);
      CmiKemService.deleteKEM(2, 1).then(
        successSpy,
        failureSpy
      );
      $httpBackend.flush();
      expect(successSpy).toHaveBeenCalled();
      expect(failureSpy).not.toHaveBeenCalled();
    });

    it('should NOT notify on Not Found 404', function () {
      $httpBackend.whenDELETE(HuronConfig.getCmiUrl() + '/voice/customers/1/sipendpoints/2/addonmodules/1').respond(404);
      CmiKemService.deleteKEM(2, 1).then(
        successSpy,
        failureSpy
      );
      $httpBackend.flush();
      expect(successSpy).not.toHaveBeenCalled();
      expect(failureSpy).toHaveBeenCalled();
    });
  });
});
