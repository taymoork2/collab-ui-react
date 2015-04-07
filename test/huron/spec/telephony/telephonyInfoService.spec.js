'use strict';

describe('Service: TelephonyInfoService', function () {
  var $httpBackend, $q, HuronConfig, TelephonyInfoService, ServiceSetup, DirectoryNumber;

  beforeEach(module('Huron'));

  var authInfo = {
    getOrgId: sinon.stub().returns('1')
  };

  beforeEach(module(function ($provide) {
    $provide.value("Authinfo", authInfo);
  }));

  beforeEach(inject(function (_$httpBackend_, _$q_, _HuronConfig_, _TelephonyInfoService_, _ServiceSetup_, _DirectoryNumber_) {
    $httpBackend = _$httpBackend_;
    $q = _$q_;
    HuronConfig = _HuronConfig_;
    TelephonyInfoService = _TelephonyInfoService_;
    ServiceSetup = _ServiceSetup_;
    DirectoryNumber = _DirectoryNumber_;
    spyOn(ServiceSetup, 'listSites').and.returnValue($q.when([]));
    spyOn(DirectoryNumber, 'getAlternateNumbers').and.returnValue($q.when([]));
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

  describe('getUserDnInfo function', function () {
    beforeEach(function () {
      var userDirectoryNumbers = getJSONFixture('huron/json/user/userDirectoryNumbers.json');
      userDirectoryNumbers.forEach(function (userDn) {
        $httpBackend.whenGET(HuronConfig.getCmiUrl() + '/voice/customers/1/directorynumbers/' + userDn.directoryNumber.uuid + '/users').respond([]);
      });
      $httpBackend.whenGET(HuronConfig.getCmiUrl() + '/voice/customers/1/users/2/directorynumbers').respond(userDirectoryNumbers);

      TelephonyInfoService.getUserDnInfo(2);
      $httpBackend.flush();
    });

    it('should call getAlternateNumbers', function () {
      expect(DirectoryNumber.getAlternateNumbers).toHaveBeenCalled();
    });
  });

});
