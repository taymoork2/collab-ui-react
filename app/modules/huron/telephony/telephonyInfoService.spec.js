'use strict';

describe('Service: TelephonyInfoService', function () {
  var $httpBackend, $q, HuronConfig, TelephonyInfoService, ServiceSetup, DirectoryNumber, HuronCustomer, InternationalDialing;

  var internalNumbers, externalNumbers, getExternalNumberPool;

  beforeEach(module('Huron'));

  var authInfo = {
    getOrgId: sinon.stub().returns('1')
  };

  var customer = {
    "uuid": "84562afa-2f35-474f-ba0f-2def42864e12",
    "name": "Atlas_Test_JP650",
    "servicePackage": "DEMO_STANDARD",
    "links": [{
      "rel": "common",
      "href": "/api/v1/common/customers/84562afa-2f35-474f-ba0f-2def42864e12"
    }, {
      "rel": "voicemail",
      "href": "/api/v1/voicemail/customers/84562afa-2f35-474f-ba0f-2def42864e12"
    }, {
      "rel": "voice",
      "href": "/api/v1/voice/customers/84562afa-2f35-474f-ba0f-2def42864e12"
    }]
  };

  beforeEach(module(function ($provide) {
    $provide.value("Authinfo", authInfo);
  }));

  beforeEach(inject(function (_$httpBackend_, _$q_, _HuronConfig_, _TelephonyInfoService_, _ServiceSetup_, _DirectoryNumber_, _HuronCustomer_) {
    $httpBackend = _$httpBackend_;
    $q = _$q_;
    HuronConfig = _HuronConfig_;
    TelephonyInfoService = _TelephonyInfoService_;
    ServiceSetup = _ServiceSetup_;
    DirectoryNumber = _DirectoryNumber_;
    HuronCustomer = _HuronCustomer_;

    internalNumbers = getJSONFixture('huron/json/internalNumbers/internalNumbers.json');
    externalNumbers = getJSONFixture('huron/json/externalNumbers/externalNumbers.json');
    getExternalNumberPool = externalNumbers.slice(0);
    getExternalNumberPool.unshift({
      "uuid": "none",
      "pattern": "directoryNumberPanel.none"
    });

    spyOn(ServiceSetup, 'listSites').and.returnValue($q.when([]));
    spyOn(DirectoryNumber, 'getAlternateNumbers').and.returnValue($q.when([]));
    spyOn(HuronCustomer, 'get').and.returnValue($q.when(customer));
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

    it('should call listSites and checkCustomerVoicemail', function () {
      TelephonyInfoService.getTelephonyInfo();
      expect(ServiceSetup.listSites).toHaveBeenCalled();
      expect(HuronCustomer.get).toHaveBeenCalled();
    });
  });

  describe('getUserDnInfo function', function () {
    beforeEach(function () {
      var userDirectoryNumbers = getJSONFixture('huron/json/user/userDirectoryNumbers.json');
      var directoryNumber = getJSONFixture('huron/json/lineSettings/getDirectoryNumber.json');

      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/1/users/2/directorynumbers').respond(userDirectoryNumbers);
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/1/directorynumbers/1234567890').respond(directoryNumber);

      userDirectoryNumbers.forEach(function (userDn) {
        $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/1/directorynumbers/' + userDn.directoryNumber.uuid + '/users').respond([]);
      });

      TelephonyInfoService.getUserDnInfo(2);
      $httpBackend.flush();
    });

    it('should call getAlternateNumbers', function () {
      expect(DirectoryNumber.getAlternateNumbers).toHaveBeenCalled();
    });
  });

  describe('loadInternalNumberPool', function () {

    it('should return internal number pool', function () {
      $httpBackend.whenGET(HuronConfig.getCmiUrl() + '/voice/customers/1/internalnumberpools?directorynumber=&order=pattern').respond(internalNumbers);
      TelephonyInfoService.loadInternalNumberPool().then(function (response) {
        expect(response).toEqual(internalNumbers);
      });
      $httpBackend.flush();
    });

    it('should return internal number pool with query param', function () {
      $httpBackend.whenGET(HuronConfig.getCmiUrl() + '/voice/customers/1/internalnumberpools?directorynumber=&order=pattern&pattern=%255%25').respond(internalNumbers);
      TelephonyInfoService.loadInternalNumberPool('5').then(function (response) {
        expect(response).toEqual(internalNumbers);
      });
      $httpBackend.flush();
    });

    it('should return an empty pool when an error occurs', function () {
      $httpBackend.whenGET(HuronConfig.getCmiUrl() + '/voice/customers/1/internalnumberpools?directorynumber=&order=pattern').respond(500);
      TelephonyInfoService.loadInternalNumberPool().then(function () {
        expect(TelephonyInfoService.getInternalNumberPool()).toEqual([]);
      });
      $httpBackend.flush();
    });

  });

  describe('loadExternalNumberPool', function () {

    it('should return external number pool', function () {
      $httpBackend.whenGET(HuronConfig.getCmiUrl() + '/voice/customers/1/externalnumberpools?directorynumber=&order=pattern').respond(externalNumbers);
      TelephonyInfoService.loadExternalNumberPool().then(function (response) {
        expect(response).toEqual(getExternalNumberPool);
      });
      $httpBackend.flush();
    });

    it('should return external number pool with query param', function () {
      $httpBackend.whenGET(HuronConfig.getCmiUrl() + '/voice/customers/1/externalnumberpools?directorynumber=&order=pattern&pattern=%255%25').respond(externalNumbers);
      TelephonyInfoService.loadExternalNumberPool('5').then(function (response) {
        expect(response).toEqual(getExternalNumberPool);
      });
      $httpBackend.flush();
    });

    it('should return an empty pool when an error occurs', function () {
      $httpBackend.whenGET(HuronConfig.getCmiUrl() + '/voice/customers/1/externalnumberpools?directorynumber=&order=pattern').respond(500);
      TelephonyInfoService.loadExternalNumberPool().then(function () {
        expect(TelephonyInfoService.getExternalNumberPool()).toEqual([]);
      });
      $httpBackend.flush();
    });

  });

  describe('getInternationalDialing function', function () {
    beforeEach(function () {
      var cosRestrictions = getJSONFixture('huron/json/user/cosRestrictions.json');

      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/1/users/2/features/restrictions').respond(cosRestrictions);
      $httpBackend.flush();
    });
  });

});
