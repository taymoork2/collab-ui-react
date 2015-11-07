'use strict';

describe('Service: DialPlanService', function () {
  var $httpBackend, HuronConfig, DialPlanService;

  var clusters = getJSONFixture('huron/json/dialPlans/clusters.json');
  var customerVoiceAustalia = getJSONFixture('huron/json/dialPlans/customervoice-aunp.json');
  var customerVoiceNorthAmerica = getJSONFixture('huron/json/dialPlans/customervoice-nanp.json');
  var dialPlans = getJSONFixture('huron/json/dialPlans/dialplans.json');
  var dialPlanDetailsAustralia = getJSONFixture('huron/json/dialPlans/dialplandetails-aunp.json');
  var dialPlanDetailsNorthAmerica = [{
    countryCode: "+1",
    extensionGenerated: "false",
    steeringDigitRequired: "true"
  }];

  var uuids = {
    orgId: '1',
    clusterId: '00000000-0000-0000-0000-000000000001',
    dialPlanIdAudp: '00000000-0000-0000-0000-000000000009',
    dialPlanIdNadp: '00000000-0000-0000-0000-000000000010',
  };

  var authInfo = {
    getOrgId: sinon.stub().returns('1'),
  };

  beforeEach(module('Huron'));

  beforeEach(module(function ($provide) {
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

  describe('getVoiceClusters', function () {
    it('should return a list of voice clusters', function () {
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/common/clusters?type=APPLICATION_VOICE').respond(clusters);
      DialPlanService.getVoiceClusters().then(function (response) {
        expect(angular.equals(response, clusters)).toBe(true);
      });
    });
  });

  describe('getCustomerVoice', function () {
    it('should return voice profile for current Australian customer', function () {
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/' + uuids.orgId).respond(customerVoiceAustalia);
      DialPlanService.getCustomerVoice().then(function (response) {
        expect(angular.equals(response, customerVoiceAustalia)).toBe(true);
      });
    });

    it('should return voice profile for current North American customer', function () {
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/' + uuids.orgId).respond(customerVoiceNorthAmerica);
      DialPlanService.getCustomerVoice().then(function (response) {
        expect(angular.equals(response, customerVoiceNorthAmerica)).toBe(true);
      });
    });

    it('should return voice profile for customer in parameter', function () {
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/' + uuids.orgId).respond(customerVoiceNorthAmerica);
      DialPlanService.getCustomerVoice(uuids.orgId).then(function (response) {
        expect(angular.equals(response, customerVoiceNorthAmerica)).toBe(true);
      });
    });
  });

  describe('getDialPlans', function () {
    it('should return a list of dial plans', function () {
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/common/clusters?type=APPLICATION_VOICE').respond(clusters);
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/clusters/' + uuids.clusterId + '/dialplans').respond(dialPlans);
      DialPlanService.getDialPlans().then(function (response) {
        expect(angular.equals(response, dialPlans)).toBe(true);
      });
    });
  });

  describe('getCustomerDialPlanDetails', function () {
    it('should return dialPlanDetails for Australia', function () {
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/common/clusters?type=APPLICATION_VOICE').respond(clusters);
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/common/clusters?type=APPLICATION_VOICE').respond(clusters);
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/' + uuids.orgId).respond(customerVoiceAustalia);
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/clusters/' + uuids.clusterId + '/dialplans').respond(dialPlans);
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/clusters/' + uuids.clusterId + '/dialplandetails?dialplan=' + uuids.dialPlanIdAudp).respond(dialPlanDetailsAustralia);
      DialPlanService.getCustomerDialPlanDetails().then(function (response) {
        expect(angular.equals(response, dialPlanDetailsAustralia[0])).toBe(true);
      });
    });

    it('should return dialPlanDetails for North America', function () {
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/common/clusters?type=APPLICATION_VOICE').respond(clusters);
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/common/clusters?type=APPLICATION_VOICE').respond(clusters);
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/' + uuids.orgId).respond(customerVoiceNorthAmerica);
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/clusters/' + uuids.clusterId + '/dialplans').respond(dialPlans);
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/clusters/' + uuids.clusterId + '/dialplandetails?dialplan=' + uuids.dialPlanIdNadp).respond(dialPlanDetailsNorthAmerica);
      DialPlanService.getCustomerDialPlanDetails().then(function (response) {
        expect(angular.equals(response, dialPlanDetailsNorthAmerica[0])).toBe(true);
      });
    });

    it('should return dialPlanDetails for customer in parameter', function () {
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/common/clusters?type=APPLICATION_VOICE').respond(clusters);
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/common/clusters?type=APPLICATION_VOICE').respond(clusters);
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/customers/' + uuids.orgId).respond(customerVoiceNorthAmerica);
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/clusters/' + uuids.clusterId + '/dialplans').respond(dialPlans);
      $httpBackend.expectGET(HuronConfig.getCmiUrl() + '/voice/clusters/' + uuids.clusterId + '/dialplandetails?dialplan=' + uuids.dialPlanIdNadp).respond(dialPlanDetailsNorthAmerica);
      DialPlanService.getCustomerDialPlanDetails(uuids.orgId).then(function (response) {
        expect(angular.equals(response, dialPlanDetailsNorthAmerica[0])).toBe(true);
      });
    });
  });
});
