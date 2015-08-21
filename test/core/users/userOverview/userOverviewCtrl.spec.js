'use strict';

describe('Controller: UserOverviewCtrl', function () {
  var controller, $scope, $httpBackend, Config, Authinfo, Utils, Userservice, FeatureToggleService;

  var $stateParams, currentUser, updatedUser, getUserMe, getMyFeatureToggles;

  beforeEach(module('Core'));
  beforeEach(module('Huron'));

  beforeEach(inject(function ($rootScope, $controller, _$httpBackend_, _Config_, _Authinfo_, _Utils_, _Userservice_, _FeatureToggleService_) {
    $scope = $rootScope.$new();
    $httpBackend = _$httpBackend_;
    Config = _Config_;
    Authinfo = _Authinfo_;
    Utils = _Utils_;
    Userservice = _Userservice_;
    FeatureToggleService = _FeatureToggleService_;

    currentUser = angular.copy(getJSONFixture('core/json/currentUser.json'));
    getUserMe = getJSONFixture('core/json/users/me.json');
    getMyFeatureToggles = getJSONFixture('core/json/users/me/featureToggles.json');
    updatedUser = angular.copy(currentUser);
    updatedUser.entitlements.push('ciscouc');

    $stateParams = {
      currentUser: currentUser
    };

    spyOn(Authinfo, 'getOrgId').and.returnValue(currentUser.meta.organizationID);
    spyOn(Userservice, 'getUser').and.callFake(function (uid, callback) {
      callback(currentUser, 200);
    });
    spyOn(FeatureToggleService, 'getFeaturesForUser').and.callFake(function (uid, callback) {
      callback(getMyFeatureToggles, 200);
    });

    // eww
    var userUrl = Utils.sprintf(Config.getScimUrl(), [Authinfo.getOrgId()]) + '/' + currentUser.id;
    $httpBackend.whenGET(userUrl).respond(updatedUser);

    controller = $controller('UserOverviewCtrl', {
      $scope: $scope,
      $stateParams: $stateParams,
      Config: Config,
      Authinfo: Authinfo,
      Userservice: Userservice,
      FeatureToggleService: FeatureToggleService
    });

    $scope.$apply();
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('init', function () {
    it('should reload the user data from identity response when user list is updated', function () {
      expect(currentUser.entitlements.length).toEqual(2);
      $scope.$broadcast('USER_LIST_UPDATED');
      $httpBackend.flush();
      expect(currentUser.entitlements.length).toEqual(3);
    });

    it('should reload the user data from identity response when entitlements are updated', function () {
      expect(currentUser.entitlements.length).toEqual(2);
      $scope.$broadcast('entitlementsUpdated');
      $httpBackend.flush();
      expect(currentUser.entitlements.length).toEqual(3);
    });

    it('should set the title to displayName', function () {
      expect(controller.titleCard).toEqual("Display Name");
    });
  });

});
