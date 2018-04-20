'use strict';

describe('Template: planReview', function () {
  var $scope, $controller, $httpBackend, controller, $q, $compile, view;
  var FeatureToggleService, Userservice, UrlConfig, getUserMe;

  afterEach(function () {
    if (view) {
      view.remove();
    }
    view = undefined;
  });

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Sunlight'));
  beforeEach(angular.mock.module('WebExApp'));

  var authInfo = {
    getOrgId: jasmine.createSpy('getOrgId').and.returnValue('5632f806-ad09-4a26-a0c0-a49a13f38873'),
    getMessageServices: jasmine.createSpy('getMessageServices').and.returnValue(getJSONFixture('core/json/authInfo/messagingServices.json').singleLicense),
    getCommunicationServices: jasmine.createSpy('getCommunicationServices').and.returnValue(getJSONFixture('core/json/authInfo/commServices.json').singleLicense),
    getConferenceServices: jasmine.createSpy('getConferenceServices').and.returnValue(_.clone(getJSONFixture('core/json/authInfo/confServices.json'))),
    getCareServices: jasmine.createSpy('getCareServices').and.returnValue(getJSONFixture('core/json/authInfo/careServices.json').careLicense),
    getCmrServices: jasmine.createSpy('getCmrServices').and.returnValue(getJSONFixture('core/json/authInfo/cmrServices.json')),
    getLicenses: jasmine.createSpy('getLicenses').and.returnValue(getJSONFixture('core/json/authInfo/licenseServices.json')),
    getSubscriptions: jasmine.createSpy('getSubscriptions').and.returnValue('[]'),
    isCare: jasmine.createSpy('isCare').and.returnValue(true),
  };

  beforeEach(angular.mock.module(function ($provide) {
    $provide.value('Authinfo', authInfo);
  }));

  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  beforeEach(compileView);

  function dependencies(_$compile_, _$controller_, _$httpBackend_, _$q_, $rootScope, _Authinfo_, _FeatureToggleService_, _Userservice_, _UrlConfig_) {
    $compile = _$compile_;
    $controller = _$controller_;
    $httpBackend = _$httpBackend_;
    $q = _$q_;
    $scope = $rootScope.$new();
    authInfo = _Authinfo_;
    FeatureToggleService = _FeatureToggleService_;
    UrlConfig = _UrlConfig_;
    Userservice = _Userservice_;
  }

  function initSpies() {
    spyOn(FeatureToggleService, 'getFeatureForUser').and.returnValue($q.resolve(true));
    spyOn(FeatureToggleService, 'supports').and.returnValue($q.resolve(true));
    spyOn(FeatureToggleService, 'atlasCareTrialsGetStatus').and.returnValue($q.resolve(true));
    getUserMe = getJSONFixture('core/json/users/me.json');

    spyOn(Userservice, 'getUser').and.callFake(function (uid, callback) {
      callback(getUserMe, 200);
    });

    $httpBackend.whenGET(UrlConfig.getAdminServiceUrl() + 'organization/5632f806-ad09-4a26-a0c0-a49a13f38873/trials/33e66606-b1b8-4794-a7c5-5bfc5046380f').respond(200);
    $httpBackend.whenGET(UrlConfig.getAdminServiceUrl() + 'customers/5632f806-ad09-4a26-a0c0-a49a13f38873/usage').respond(200);
  }

  function compileView() {
    controller = $controller('PlanReviewCtrl', {
      $scope: $scope,
    });
    $scope.planReview = controller;
    var template = require('modules/core/setupWizard/planReview/planReview.tpl.html');
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
      expect(view.find('[translate="firstTimeWizard.care"]').length).toBe(1);
      // expect(view.find('#careLicenseText').length).toBe(1);
      expect(controller.careServices.services).toBeDefined();
      var careService = controller.careServices.services;
      expect(careService[0].license.volume).toBe(30);
    });
  });
});
