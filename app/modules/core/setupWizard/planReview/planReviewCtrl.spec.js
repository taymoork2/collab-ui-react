'use strict';

describe('Controller: PlanReviewCtrl', function () {
  var $scope, controller, $httpBackend, $q, UrlConfig, Userservice, FeatureToggleService;
  var getUserMe;

  beforeEach(module('Core'));
  beforeEach(module('Huron'));
  beforeEach(module('Sunlight'));

  var authInfo = {
    getOrgId: sinon.stub().returns('5632f806-ad09-4a26-a0c0-a49a13f38873'),
    getMessageServices: sinon.stub().returns(getJSONFixture('core/json/authInfo/messagingServices.json').singleLicense),
    getCommunicationServices: sinon.stub().returns(getJSONFixture('core/json/authInfo/commServices.json')),
    getConferenceServices: sinon.stub().returns(getJSONFixture('core/json/authInfo/confServices.json')),
    getCmrServices: sinon.stub().returns(getJSONFixture('core/json/authInfo/cmrServices.json')),
    getLicenses: sinon.stub().returns(getJSONFixture('core/json/authInfo/licenseServices.json'))
  };

  beforeEach(module(function ($provide) {
    $provide.value("Authinfo", authInfo);
  }));

  beforeEach(inject(function ($rootScope, $controller, _$httpBackend_, $q, _UrlConfig_, _Userservice_, _FeatureToggleService_) {
    $scope = $rootScope.$new();
    $httpBackend = _$httpBackend_;
    $q = $q;
    UrlConfig = _UrlConfig_;
    Userservice = _Userservice_;
    FeatureToggleService = _FeatureToggleService_;

    getUserMe = getJSONFixture('core/json/users/me.json');

    spyOn(Userservice, 'getUser').and.callFake(function (uid, callback) {
      callback(getUserMe, 200);
    });
    spyOn(FeatureToggleService, 'getFeatureForUser').and.returnValue($q.when(true));
    spyOn(FeatureToggleService, 'supports').and.returnValue($q.when(true));

    controller = $controller('PlanReviewCtrl', {
      $scope: $scope
    });
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('PlanReviewCtrl controller', function () {
    it('should be created successfully', function () {
      expect(controller).toBeDefined();
    });

    beforeEach(function () {
      //trial request
      $httpBackend.whenGET(UrlConfig.getAdminServiceUrl() + 'organization/5632f806-ad09-4a26-a0c0-a49a13f38873/trials/33e66606-b1b8-4794-a7c5-5bfc5046380f').respond(function () {
        var data = getJSONFixture('core/json/trials/trialGetResponse.json');
        // reset the trial.startDate to 100 days in the past.
        data.startDate = moment().subtract(100, 'days');
        return [200, data, {}];
      });
      $httpBackend.flush();
    });

    it('should calculate trial days remaining correctly', function () {
      // trial length is 180 days, so expecting 180 - 100 = 80 days.
      expect(controller.trialDaysRemaining).toEqual(80);
    });

    it('should calculate trial used percentage correctly', function () {
      expect(controller.trialUsedPercentage).toEqual(56);
    });

  });

});
