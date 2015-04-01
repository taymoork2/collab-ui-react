'use strict';

describe('Service: TelephonyInfoService', function () {
  var $httpBackend, $q, TelephonyInfoService, ServiceSetup;

  beforeEach(module('Huron'));

  var authInfo = {
    getOrgId: sinon.stub().returns('1')
  };

  beforeEach(module(function ($provide) {
    $provide.value("Authinfo", authInfo);
  }));

  beforeEach(inject(function (_$httpBackend_, _$q_, _TelephonyInfoService_, _ServiceSetup_) {
    $httpBackend = _$httpBackend_;
    $q = _$q_;
    TelephonyInfoService = _TelephonyInfoService_;
    ServiceSetup = _ServiceSetup_;
    spyOn(ServiceSetup, 'listSites').and.returnValue($q.when([]));
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should be registered', function () {
    expect(TelephonyInfoService).toBeDefined();
  });

  describe('getTelephonyInfo function', function () {
    it('should exist', function () {
      expect(TelephonyInfoService.getTelephonyInfo).toBeDefined();
    });

    it('should call listSites', function () {
      TelephonyInfoService.getTelephonyInfo();
      expect(ServiceSetup.listSites).toHaveBeenCalled();
    });
  });

});
