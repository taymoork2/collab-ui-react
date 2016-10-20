'use strict';

describe('Service: DialPlanService', function () {
  var $httpBackend, HuronConfig, DialPlanService;

  var customerVoiceAustralia = getJSONFixture('huron/json/dialPlans/customervoice-aunp.json');
  var customerVoiceNorthAmerica = getJSONFixture('huron/json/dialPlans/customervoice-nanp.json');
  var hardcodedDialPlanDetailsNorthAmerica = {
    countryCode: "+1",
    extensionGenerated: "false",
    steeringDigitRequired: "true",
    supportSiteCode: "true",
    supportSiteSteeringDigit: "true"
  };

  var Authinfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('1')
  };

  beforeEach(angular.mock.module('Huron'));

  var authInfo = {
    getOrgId: sinon.stub().returns('1'),
  };

  beforeEach(angular.mock.module(function ($provide) {
    $provide.value('Authinfo', authInfo);
  }));

  beforeEach(inject(function (_$httpBackend_, _HuronConfig_, _DialPlanService_) {
    $httpBackend = _$httpBackend_;
    HuronConfig = _HuronConfig_;
    DialPlanService = _DialPlanService_;
  }));

  afterEach(function () {
    $httpBackend.flush();
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('getCustomerVoice', function () {
    it('should return voice profile for current Australian customer', function () {
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/' + Authinfo.getOrgId()).respond(customerVoiceAustralia);
      DialPlanService.getCustomerVoice().then(function (response) {
        expect(angular.equals(response, customerVoiceAustralia)).toBe(true);
      });
    });

    it('should return voice profile for current North American customer', function () {
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/' + Authinfo.getOrgId()).respond(customerVoiceNorthAmerica);
      DialPlanService.getCustomerVoice().then(function (response) {
        expect(angular.equals(response, customerVoiceNorthAmerica)).toBe(true);
      });
    });

    it('should return voice profile for customer in parameter', function () {
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/' + Authinfo.getOrgId()).respond(customerVoiceNorthAmerica);
      DialPlanService.getCustomerVoice(Authinfo.getOrgId()).then(function (response) {
        expect(angular.equals(response, customerVoiceNorthAmerica)).toBe(true);
      });
    });
  });

  describe('getCustomerDialPlanCountryCode', function () {
    it('should not return a plus sign in the country code', function () {
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/' + Authinfo.getOrgId()).respond(customerVoiceAustralia);
      DialPlanService.getCustomerDialPlanCountryCode().then(function (response) {
        expect(response.indexOf('+') === -1).toBe(true);
      });
    });

    it('should return 61 for Australian customer', function () {
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/' + Authinfo.getOrgId()).respond(customerVoiceAustralia);
      DialPlanService.getCustomerDialPlanCountryCode(Authinfo.getOrgId()).then(function (response) {
        expect(angular.equals(response, "61")).toBe(true);
      });
    });
  });

  describe('getCustomerDialPlanDetails', function () {
    it('should return dialPlanDetails for Australia', function () {
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/' + Authinfo.getOrgId()).respond(customerVoiceAustralia);
      DialPlanService.getCustomerDialPlanDetails().then(function (response) {
        expect(angular.equals(response, customerVoiceAustralia["dialPlanDetails"])).toBe(true);
      });
    });

    it('should return dialPlanDetails for North America', function () {
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/' + Authinfo.getOrgId()).respond(customerVoiceNorthAmerica);
      DialPlanService.getCustomerDialPlanDetails().then(function (response) {
        expect(angular.equals(response, hardcodedDialPlanDetailsNorthAmerica)).toBe(true);
      });
    });

    it('should return dialPlanDetails for customer in parameter', function () {
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/' + Authinfo.getOrgId()).respond(customerVoiceNorthAmerica);
      DialPlanService.getCustomerDialPlanDetails(Authinfo.getOrgId()).then(function (response) {
        expect(angular.equals(response, hardcodedDialPlanDetailsNorthAmerica)).toBe(true);
      });
    });
  });
});
