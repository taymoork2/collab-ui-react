'use strict';

describe('Controller: UserOverviewCtrl', function () {
  var controller, $scope, $httpBackend, Config, Authinfo, Utils;

  var $stateParams, currentUser, updatedUser;

  beforeEach(module('Core'));

  beforeEach(inject(function ($rootScope, $controller, _$httpBackend_, _Config_, _Authinfo_, _Utils_) {
    $scope = $rootScope.$new();
    $httpBackend = _$httpBackend_;
    Config = _Config_;
    Authinfo = _Authinfo_;
    Utils = _Utils_;

    currentUser = angular.copy(getJSONFixture('core/json/currentUser.json'));
    updatedUser = angular.copy(currentUser);
    updatedUser.entitlements.push('ciscouc');

    $stateParams = {
      currentUser: currentUser
    };

    spyOn(Authinfo, 'getOrgId').and.returnValue(currentUser.meta.organizationID);

    // eww
    var userUrl = Utils.sprintf(Config.getScimUrl(), [Authinfo.getOrgId()]) + '/' + currentUser.id;
    $httpBackend.whenGET(userUrl).respond(updatedUser);

    controller = $controller('UserOverviewCtrl', {
      $scope: $scope,
      $stateParams: $stateParams,
      Config: Config,
      Authinfo: Authinfo,
      Utils: Utils
    });

    $scope.$apply();
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('init', function () {
    it('should reload the user data from identity response', function () {
      expect(currentUser.entitlements.length).toEqual(2);
      $httpBackend.flush();
      expect(currentUser.entitlements.length).toEqual(3);
    });
    it('should set the title to displayName', function () {
      $httpBackend.flush();
      expect(currentUser.titleCard).toEqual("Display Name");
    });
  });

});
