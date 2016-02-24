'use strict';

describe('Service: TelephonyInfoService', function () {
  var $httpBackend, $q, HuronConfig, TelephonyInfoService, ServiceSetup, DirectoryNumber, HuronCustomer, InternationalDialing;
  var $rootScope, FeatureToggleService, Authinfo;

  var internalNumbers, externalNumbers, getExternalNumberPool;
  var cosRestrictions;

  beforeEach(module('Huron'));

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

  beforeEach(inject(function (_$rootScope_, _$httpBackend_, _$q_, _HuronConfig_, _TelephonyInfoService_, _ServiceSetup_, _DirectoryNumber_, _HuronCustomer_, _FeatureToggleService_, _Authinfo_, _InternationalDialing_) {
    $httpBackend = _$httpBackend_;
    $q = _$q_;
    HuronConfig = _HuronConfig_;
    TelephonyInfoService = _TelephonyInfoService_;
    ServiceSetup = _ServiceSetup_;
    DirectoryNumber = _DirectoryNumber_;
    HuronCustomer = _HuronCustomer_;
    FeatureToggleService = _FeatureToggleService_;
    Authinfo = _Authinfo_;
    InternationalDialing = _InternationalDialing_;
    $rootScope = _$rootScope_;

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
    spyOn(Authinfo, 'getLicenseIsTrial').and.returnValue(true);
    spyOn(FeatureToggleService, 'supports');
    spyOn(InternationalDialing, 'listCosRestrictions');
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('isHideInternationalDialing():', function () {
    it('should hide international dialing if customer is in trial', function () {
      FeatureToggleService.supports.and.returnValue($q.when(false));
      Authinfo.getLicenseIsTrial.and.returnValue(true);

      var isTrial = TelephonyInfoService.isHideInternationalDialing();
      $rootScope.$apply();
      expect(FeatureToggleService.supports).toHaveBeenCalled();
      expect(Authinfo.getLicenseIsTrial).toHaveBeenCalled();
      expect(isTrial.$$state.value).toBe(true);
    });

    it('should show international dialing if customer is NOT in trial', function () {
      FeatureToggleService.supports.and.returnValue($q.when(false));
      Authinfo.getLicenseIsTrial.and.returnValue(false);

      var isTrial = TelephonyInfoService.isHideInternationalDialing();
      $rootScope.$apply();
      expect(FeatureToggleService.supports).toHaveBeenCalled();
      expect(Authinfo.getLicenseIsTrial).toHaveBeenCalled();
      expect(isTrial.$$state.value).toBe(false);
    });

    it('should show international dialing if customer is in trial but has override', function () {
      FeatureToggleService.supports.and.returnValue($q.when(true));

      var isTrial = TelephonyInfoService.isHideInternationalDialing();
      $rootScope.$apply();
      expect(FeatureToggleService.supports).toHaveBeenCalled();
      expect(Authinfo.getLicenseIsTrial).not.toHaveBeenCalled();
      expect(isTrial.$$state.value).toBe(false);
    });

    it('should show international dialing if get override fails but customer is NOT in trial', function () {
      FeatureToggleService.supports.and.returnValue($q.reject());
      Authinfo.getLicenseIsTrial.and.returnValue(false);

      var isTrial = TelephonyInfoService.isHideInternationalDialing();
      $rootScope.$apply();
      expect(FeatureToggleService.supports).toHaveBeenCalled();
      expect(Authinfo.getLicenseIsTrial).toHaveBeenCalled();
      expect(isTrial.$$state.value).toBe(false);
    });

    it('should hide international dialing if get override fails and customer is in trial', function () {
      FeatureToggleService.supports.and.returnValue($q.reject());
      Authinfo.getLicenseIsTrial.and.returnValue(true);

      var isTrial = TelephonyInfoService.isHideInternationalDialing();
      $rootScope.$apply();
      expect(FeatureToggleService.supports).toHaveBeenCalled();
      expect(Authinfo.getLicenseIsTrial).toHaveBeenCalled();
      expect(isTrial.$$state.value).toBe(true);
    });

    it('should hide international dialing if get override fails and unable to determine if customer is in trial', function () {
      FeatureToggleService.supports.and.returnValue($q.reject());
      Authinfo.getLicenseIsTrial.and.returnValue(undefined);

      var isTrial = TelephonyInfoService.isHideInternationalDialing();
      $rootScope.$apply();
      expect(FeatureToggleService.supports).toHaveBeenCalled();
      expect(Authinfo.getLicenseIsTrial).toHaveBeenCalled();
      expect(isTrial.$$state.value).toBe(true);
    });
  });

  describe('getInternationalDialing():', function () {
    it('should call all services when there are no errors and customer is NOT in trial', function () {
      FeatureToggleService.supports.and.returnValue($q.when(false));
      Authinfo.getLicenseIsTrial.and.returnValue(false);
      InternationalDialing.listCosRestrictions.and.returnValue($q.when(cosRestrictions));

      TelephonyInfoService.getInternationalDialing();
      $rootScope.$apply();
      expect(FeatureToggleService.supports).toHaveBeenCalled();
      expect(Authinfo.getLicenseIsTrial).toHaveBeenCalled();
      expect(InternationalDialing.listCosRestrictions).toHaveBeenCalled();
    });

    it('should NOT call all services when there are no errors and customer is in trial', function () {
      FeatureToggleService.supports.and.returnValue($q.when(false));
      Authinfo.getLicenseIsTrial.and.returnValue(true);

      TelephonyInfoService.getInternationalDialing();
      $rootScope.$apply();
      expect(FeatureToggleService.supports).toHaveBeenCalled();
      expect(Authinfo.getLicenseIsTrial).toHaveBeenCalled();
      expect(InternationalDialing.listCosRestrictions).not.toHaveBeenCalled();
    });

    it('should NOT call InternationalDialing.listCosRestrictions when getting license trial status fails', function () {
      FeatureToggleService.supports.and.returnValue($q.when(false));
      Authinfo.getLicenseIsTrial.and.returnValue(undefined);

      TelephonyInfoService.getInternationalDialing();
      $rootScope.$apply();
      expect(FeatureToggleService.supports).toHaveBeenCalled();
      expect(Authinfo.getLicenseIsTrial).toHaveBeenCalled();
      expect(InternationalDialing.listCosRestrictions).not.toHaveBeenCalled();
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

});
