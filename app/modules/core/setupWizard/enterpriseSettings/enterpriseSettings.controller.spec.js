'use strict';

describe('Controller: EnterpriseSettingsCtrl', function () {
  var $scope, Orgservice, $controller, Notification;
  var orgServiceJSONFixture = getJSONFixture('core/json/organizations/Orgservice.json');
  var getOrgStatus = 200;
  var rootScope;

  var authInfo = {
    getOrgId: sinon.stub().returns('bcd7afcd-839d-4c61-a7a8-31c6c7f016d7')
  };

  beforeEach(angular.mock.module(function ($provide) {
    $provide.value("Authinfo", authInfo);
  }));

  beforeEach(angular.mock.module('Core'));

  beforeEach(installPromiseMatchers);

  beforeEach(inject(function ($rootScope, _$controller_, _Notification_, _Orgservice_) {
    $scope = $rootScope.$new();
    rootScope = $rootScope;
    $controller = _$controller_;
    Orgservice = _Orgservice_;
    Notification = _Notification_;

    $scope.wizard = {
      nextTab: sinon.stub()
    };

    spyOn($scope.wizard, 'nextTab');

    spyOn(Orgservice, 'getOrg').and.callFake(function (callback) {
      callback(orgServiceJSONFixture.getOrg, getOrgStatus);
    });
    spyOn(Notification, 'error');
  }));

  function initController() {
    $controller('EnterpriseSettingsCtrl', {
      $scope: $scope,
      $rootScope: rootScope,
      Authinfo: authInfo
    });

    $scope.$apply();
  }

  describe('test the ssoEnabled settings', function () {
    beforeEach(initController);

    it('should set ssoEnabled field to true in the scope', function () {
      rootScope.ssoEnabled = true;
      $scope.updateSSO();
      $scope.$apply();
      expect($scope.ssoEnabled).toEqual(true);
    });

    it('should set ssoEnabled field to false in the scope', function () {
      rootScope.ssoEnabled = false;
      $scope.updateSSO();
      $scope.$apply();
      expect($scope.ssoEnabled).toEqual(false);
    });

    it('should go to next tab if sso is on and user clicks on next without clicking modify', function () {
      $scope.ssoEnabled = true;
      $scope.options.modifySSO = false;
      var promise = $scope.initNext();
      $scope.$apply();
      expect(promise).toBeRejected();
      expect($scope.wizard.nextTab).toHaveBeenCalled();
    });

    it('should go to next tab if sso is on and user clicks modify and switches from advanced to simple', function () {
      $scope.ssoEnabled = true;
      $scope.options.modifySSO = true;
      $scope.options.deleteSSOBySwitchingRadio = true;
      var promise = $scope.initNext();
      $scope.$apply();
      expect(promise).toBeRejected();
      expect($scope.wizard.nextTab).toHaveBeenCalled();
      //modify flag should be reset
      expect($scope.options.modifySSO).toEqual(false);
    });

    it('should go to next step if sso is on and user clicks modify and clicks next without switching from advanced to simple', function () {
      $scope.ssoEnabled = true;
      $scope.options.modifySSO = true;
      $scope.options.deleteSSOBySwitchingRadio = false;
      var promise = $scope.initNext();
      $scope.$apply();
      expect(promise).toBeResolved();
      expect($scope.options.modifySSO).toEqual(false);
    });

    it('should go to next tab if sso is off and user selects simple option', function () {
      $scope.ssoEnabled = false;
      $scope.options.configureSSO = 1;
      var promise = $scope.initNext();
      $scope.$apply();
      expect(promise).toBeRejected();
      expect($scope.wizard.nextTab).toHaveBeenCalled();
    });

    it('should go to next step if sso is off and user selects advanced option', function () {
      $scope.ssoEnabled = false;
      $scope.options.configureSSO = 0;
      var promise = $scope.initNext();
      $scope.$apply();
      expect(promise).toBeResolved();
    });

  });
});
