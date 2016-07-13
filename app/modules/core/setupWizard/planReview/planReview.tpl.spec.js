'use strict';

describe('Template: planReview', function () {
  var $scope, $controller, $httpBackend, controller, $q, $templateCache, $compile, view;
  var FeatureToggleService, Userservice, UrlConfig, getUserMe, WebExUtilsFact;

  beforeEach(module('Core'));
  beforeEach(module('Huron'));
  beforeEach(module('Sunlight'));

  var authInfo = {
    getOrgId: sinon.stub().returns('5632f806-ad09-4a26-a0c0-a49a13f38873'),
    getMessageServices: sinon.stub().returns(getJSONFixture('core/json/authInfo/messagingServices.json').singleLicense),
    getCommunicationServices: sinon.stub().returns(getJSONFixture('core/json/authInfo/commServices.json')),
    getConferenceServices: sinon.stub().returns(getJSONFixture('core/json/authInfo/confServices.json')),
    getCareServices: sinon.stub().returns(getJSONFixture('core/json/authInfo/careServices.json').careLicense),
    getCmrServices: sinon.stub().returns(getJSONFixture('core/json/authInfo/cmrServices.json')),
    getLicenses: sinon.stub().returns(getJSONFixture('core/json/authInfo/licenseServices.json'))
  };

  beforeEach(module(function ($provide) {
    $provide.value('Authinfo', authInfo);
  }));

  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  beforeEach(compileView);
  beforeEach(WebExUtilsFact);

  function dependencies(_$compile_, _$controller_, _$httpBackend_, _$q_, $rootScope, _$templateCache_, _Authinfo_, _FeatureToggleService_, _Userservice_, _UrlConfig_) {
    $compile = _$compile_;
    $controller = _$controller_;
    $httpBackend = _$httpBackend_;
    $q = _$q_;
    $scope = $rootScope.$new();
    $templateCache = _$templateCache_;
    authInfo = _Authinfo_;
    FeatureToggleService = _FeatureToggleService_;
    UrlConfig = _UrlConfig_;
    Userservice = _Userservice_;
    WebExUtilsFact = _WebExUtilsFact_;
  }

  function initSpies() {
    spyOn(FeatureToggleService, 'getFeatureForUser').and.returnValue($q.when(true));
    spyOn(FeatureToggleService, 'supports').and.returnValue($q.when(true));
    spyOn(FeatureToggleService, 'atlasCareTrialsGetStatus').and.returnValue($q.when(true));
    getUserMe = getJSONFixture('core/json/users/me.json');

    spyOn(Userservice, 'getUser').and.callFake(function (uid, callback) {
      callback(getUserMe, 200);
    });

    $httpBackend.whenGET(UrlConfig.getAdminServiceUrl() + 'organization/5632f806-ad09-4a26-a0c0-a49a13f38873/trials/33e66606-b1b8-4794-a7c5-5bfc5046380f').respond(200);
    $httpBackend.whenGET(UrlConfig.getAdminServiceUrl() + 'customers/5632f806-ad09-4a26-a0c0-a49a13f38873/usage').respond(200);
  }

  function compileView() {
    controller = $controller('PlanReviewCtrl', {
      $scope: $scope
    });
    $scope.planReview = controller;
    var template = $templateCache.get('modules/core/setupWizard/planReview/planReview.tpl.html');
    view = $compile(angular.element(template))($scope);
    $httpBackend.flush();
    $scope.$apply();
  }

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('Plan Review', function () {

    it('should have Care service info populated', function () {
      expect(controller).toBeDefined();
      expect(controller.isCareEnabled).toEqual(true);
      expect(view.find('#careHeader').length).toBe(1);
      expect(view.find('.icon-circle-contact-centre').length).toBe(1);
      expect(view.find('#freeCare').length).toBe(1);
      expect(view.find('#paidCare').length).toBe(1);
      expect(controller.careServices.isNewTrial).toEqual(false);
      expect(view.find('#careStartTrial').length).toBe(0);
      expect(view.find('[translate="firstTimeWizard.care"]').length).toBe(2);
      expect(view.find('[translate="firstTimeWizard.care"]').length).toBe(2);
      expect(controller.careServices.services).toBeDefined();
      var careService = controller.careServices.services;
      expect(careService[0].license.volume).toBe(30);
    });
  });
});
