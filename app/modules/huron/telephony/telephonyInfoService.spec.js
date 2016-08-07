'use strict';

describe('Service: TelephonyInfoService', function () {
  var $httpBackend, $q, $translate, HuronConfig, TelephonyInfoService, ServiceSetup, DirectoryNumber, HuronCustomer, InternationalDialing;
  var $rootScope, Authinfo;

  var internalNumbers, externalNumbers, getExternalNumberPool;
  var cosRestrictions;

  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));

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

  beforeEach(inject(function (_$rootScope_, _$httpBackend_, _$translate_, _$q_, _HuronConfig_, _TelephonyInfoService_, _ServiceSetup_, _DirectoryNumber_, _HuronCustomer_, _Authinfo_, _InternationalDialing_) {
    $httpBackend = _$httpBackend_;
    $q = _$q_;
    $rootScope = _$rootScope_;
    $translate = _$translate_;
    HuronConfig = _HuronConfig_;
    TelephonyInfoService = _TelephonyInfoService_;
    ServiceSetup = _ServiceSetup_;
    DirectoryNumber = _DirectoryNumber_;
    HuronCustomer = _HuronCustomer_;
    Authinfo = _Authinfo_;
    InternationalDialing = _InternationalDialing_;

    internalNumbers = getJSONFixture('huron/json/internalNumbers/internalNumbers.json');
    externalNumbers = getJSONFixture('huron/json/externalNumbers/externalNumbers.json');
    getExternalNumberPool = externalNumbers.slice(0);
    getExternalNumberPool.unshift({
      "uuid": "none",
      "pattern": "directoryNumberPanel.none"
    });
    cosRestrictions = getJSONFixture('huron/json/telephonyInfo/userCosRestrictions.json');

    spyOn(ServiceSetup, 'listSites').and.returnValue($q.when([]));
    spyOn(DirectoryNumber, 'getAlternateNumbers').and.returnValue($q.when([]));
    spyOn(HuronCustomer, 'get').and.returnValue($q.when(customer));
    spyOn(Authinfo, 'getOrgId').and.returnValue('1');
    spyOn(InternationalDialing, 'listCosRestrictions');
    spyOn(InternationalDialing, 'isDisableInternationalDialing');
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('getInternationalDialing():', function () {
    it('should call get COS restrictions when NOT hiding international dialing', function () {
      InternationalDialing.isDisableInternationalDialing.and.returnValue(false);
      InternationalDialing.listCosRestrictions.and.returnValue($q.when(cosRestrictions));

      TelephonyInfoService.getInternationalDialing();
      $rootScope.$apply();
      expect(InternationalDialing.isDisableInternationalDialing).toHaveBeenCalled();
      expect(InternationalDialing.listCosRestrictions).toHaveBeenCalled();

      var telephonyInfo = TelephonyInfoService.getTelephonyInfoObject();
      expect(telephonyInfo.hideInternationalDialing).toBe(false);
    });

    it('should NOT call get COS restrictions when hiding international dialing', function () {
      InternationalDialing.isDisableInternationalDialing.and.returnValue(true);

      TelephonyInfoService.getInternationalDialing();
      $rootScope.$apply();
      expect(InternationalDialing.isDisableInternationalDialing).toHaveBeenCalled();
      expect(InternationalDialing.listCosRestrictions).not.toHaveBeenCalled();

      var telephonyInfo = TelephonyInfoService.getTelephonyInfoObject();
      expect(telephonyInfo.hideInternationalDialing).toBe(true);
    });
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

  describe('getInternationalDialing function', function () {
    beforeEach(function () {
      spyOn($translate, 'instant');
    });

    it('should accept an object', function () {
      var cosRestrictions = getJSONFixture('huron/json/user/cosRestrictionsObject.json');
      InternationalDialing.listCosRestrictions.and.returnValue($q.when(cosRestrictions));
      TelephonyInfoService.getUserInternationalDialingDetails();
      $rootScope.$apply();
      expect(TelephonyInfoService.getTelephonyInfo().internationalDialingStatus).toEqual('internationalDialingPanel.alwaysAllow');
    });
  });
});
