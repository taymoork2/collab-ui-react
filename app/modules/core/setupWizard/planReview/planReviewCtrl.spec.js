'use strict';

describe('Controller: PlanReviewCtrl', function () {
  var $scope, controller, $httpBackend, $q, UrlConfig, Userservice, FeatureToggleService, WebExUtilsFact;
  var getUserMe;

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));
  beforeEach(angular.mock.module('WebExApp'));

  var authInfo = {
    getOrgId: sinon.stub().returns('5632f806-ad09-4a26-a0c0-a49a13f38873'),
    getMessageServices: sinon.stub().returns(getJSONFixture('core/json/authInfo/messagingServices.json').singleLicense),
    getCommunicationServices: sinon.stub().returns(getJSONFixture('core/json/authInfo/commServices.json')),
    getConferenceServices: sinon.stub().returns(getJSONFixture('core/json/authInfo/confServices.json')),
    getCareServices: sinon.stub().returns(getJSONFixture('core/json/authInfo/careServices.json').careLicense),
    getCmrServices: sinon.stub().returns(getJSONFixture('core/json/authInfo/cmrServices.json')),
    getLicenses: sinon.stub().returns(getJSONFixture('core/json/authInfo/licenseServices.json'))
  };

  beforeEach(angular.mock.module(function ($provide) {
    $provide.value("Authinfo", authInfo);
  }));

  beforeEach(inject(function ($controller, _$httpBackend_, $q, $rootScope, _FeatureToggleService_, _Userservice_, _UrlConfig_, _WebExUtilsFact_) {
    $scope = $rootScope.$new();
    $httpBackend = _$httpBackend_;
    $q = $q;
    UrlConfig = _UrlConfig_;
    Userservice = _Userservice_;
    FeatureToggleService = _FeatureToggleService_;
    WebExUtilsFact = _WebExUtilsFact_;

    getUserMe = getJSONFixture('core/json/users/me.json');

    spyOn(Userservice, 'getUser').and.callFake(function (uid, callback) {
      callback(getUserMe, 200);
    });
    spyOn(FeatureToggleService, 'getFeatureForUser').and.returnValue($q.when(true));
    spyOn(FeatureToggleService, 'supports').and.returnValue($q.when(true));
    spyOn(FeatureToggleService, 'atlasCareTrialsGetStatus').and.returnValue($q.when(true));
    spyOn(WebExUtilsFact, "isCIEnabledSite").and.callFake(function (siteUrl) {
      if (siteUrl === "sjsite04.webex.com") {
        return true;
      } else if (siteUrl === "sitetransfer2.eng.webex.com") {
        return false;
      }
    });

    controller = $controller('PlanReviewCtrl', {
      $scope: $scope
    });

    $httpBackend.whenGET(UrlConfig.getAdminServiceUrl() + 'organization/5632f806-ad09-4a26-a0c0-a49a13f38873/trials/33e66606-b1b8-4794-a7c5-5bfc5046380f').respond(function () {
      var data = getJSONFixture('core/json/trials/trialGetResponse.json');
      // reset the trial.startDate to 100 days in the past.
      data.startDate = moment().subtract(100, 'days');
      return [200, data, {}];
    });
    $httpBackend.flush();

  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('PlanReviewCtrl controller', function () {
    it('should be created successfully', function () {
      expect(controller).toBeDefined();
    });

    it('should calculate trial days remaining correctly', function () {
      // trial length is 180 days, so expecting 180 - 100 = 80 days.
      expect(controller.trialDaysRemaining).toEqual(80);
    });

    it('should calculate trial used percentage correctly', function () {
      expect(controller.trialUsedPercentage).toEqual(56);
    });

    it('should have called FeatureToggleService.atlasCareTrialsGetStatus', function () {
      expect(FeatureToggleService.atlasCareTrialsGetStatus).toHaveBeenCalled();
      expect(controller.isCareEnabled).toEqual(true);
    });

    it('should have Care service info populated', function () {
      expect(controller.careServices.services).toBeDefined();
      expect(controller.trialExists).toEqual(true);
      expect(controller.trialId).toEqual("33e66606-b1b8-4794-a7c5-5bfc5046380f");
      expect(controller.careServices.isNewTrial).toEqual(false);
    });
  });

  describe('getUserServiceRowClass should return the correct class names', function () {
    it('should return class for room systems  when has roomSystems', function () {
      var result = controller.getUserServiceRowClass(true);
      expect(result).toEqual('has-room-systems user-service-2');
    });

    it('should not return class for room systems  when has no roomSystems', function () {
      var result = controller.getUserServiceRowClass(false);
      expect(result).toEqual('user-service-2');
    });

    it('should return class service-2 class when has roomSystems cmr service and conference service', function () {
      var result = controller.getUserServiceRowClass(false);
      expect(result).toEqual('user-service-2');
    });

    it('should return service-1 class does not have conference service', function () {
      controller.confServices.services = [];
      var result = controller.getUserServiceRowClass(false);
      expect(result).toEqual('user-service-1');
    });

  });

  describe('getUserServiceRowClass should return the correct class names', function () {
    it('should return class for room systems and service-2 when has roomSystems cmr service and conference service', function () {
      var result = controller.getUserServiceRowClass(true);
      expect(result).toEqual('has-room-systems user-service-2');
    });

    it('should only return service-1 class when does not have roomSystems and does not have conference service', function () {
      controller.confServices.services = [];
      var result = controller.getUserServiceRowClass(false);
      expect(result).toEqual('user-service-1');
    });

  });

  describe('isCIEnabled function should return true/false for CI/non-CI sites in plan review page', function () {
    it('can correctly determine CI sites and display the quantity in plan review panel', function () {
      var fakeSiteUrl = "sjsite04.webex.com";
      var searchResult = WebExUtilsFact.isCIEnabledSite(fakeSiteUrl);
      expect(searchResult).toBe(true);
    });

    it('can correctly determine non-CI sites and display the cross launch link in plan review panel', function () {
      var fakeSiteUrl = "sitetransfer2.eng.webex.com";
      var searchResult = WebExUtilsFact.isCIEnabledSite(fakeSiteUrl);
      expect(searchResult).toBe(false);
    });

  });

});
