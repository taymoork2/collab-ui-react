'use strict';

describe('Controller: organizationOverviewCtrl', function () {
  var controller, rootScope, $scope, Config, Orgservice, $q, $controller, Notification;
  var adminServicesJSONFixture = getJSONFixture('core/json/organizations/adminServices.json');

  var authInfo = {
    getOrgId: sinon.stub()
  };

  beforeEach(module(function ($provide) {
    $provide.value('Authinfo', authInfo);
  }));

  beforeEach(module('Core'));

  beforeEach(inject(function ($rootScope, _$controller_, _Notification_, _Config_, _$q_, _Orgservice_) {
    $scope = $rootScope.$new();
    rootScope = $rootScope;
    Orgservice = _Orgservice_;
    Config = _Config_;
    $controller = _$controller_;
    Notification = _Notification_;
    $q = _$q_;

    Orgservice.getEftSetting = jasmine.createSpy().and.returnValue($q.when({
      data: {
        eft: true
      }
    }));

    Orgservice.setEftSetting = jasmine.createSpy().and.returnValue($q.when({}));

    spyOn(Orgservice, 'getAdminOrg').and.callFake(function (callback, status) {
      callback(adminServicesJSONFixture, 200);
    });

    spyOn(Notification, 'error');
  }));

  function initController() {
    controller = $controller('OrganizationOverviewCtrl', {
      $scope: $scope,
      Authinfo: authInfo,
      $stateParams: {
        currentOrganization: {
          id: 1
        }
      }
    });

    $scope.$apply();
  }

  describe('OrganizationOverviewCtrl Initialization: ', function () {
    beforeEach(initController);

    it('should initialize the OrganizationOverviewCtrl controller', function () {
      expect(controller).toBeDefined();
    });
  });

  describe('test that updateEftToggle function sets isEFT: ', function () {
    beforeEach(initController);

    it('should check if updateEftToggle in success state sets isEFT to true', function () {
      _.set($scope, 'currentOrganization.isEFT', false);
      $scope.updateEftToggle().then(function () {
          expect($scope.currentOrganization.isEFT).toEqual(true);
        })
        .finally(function () {
          expect($scope.eftToggleLoading).toEqual(false);
        });
    });
  });

  describe('test the updateEftToggle function; call to getEftSetting errors: ', function () {
    beforeEach(function () {
      Orgservice.getEftSetting = jasmine.createSpy().and.returnValue($q.reject());
      initController();
    });

    it('should gracefully error', function () {
      $scope.updateEftToggle().then(function () {
          expect(Notification.error).toHaveBeenCalled();
        })
        .finally(function () {
          expect($scope.eftToggleLoading).toEqual(false);
        });
    });
  });

  describe('test that setEftToggle function sets isEFT: ', function () {
    beforeEach(initController);

    it('should check if setEftToggle in success state sets isEFT to value passed', function () {
      $scope.currentEftSetting = false;
      var setting = true;
      $scope.setEftToggle(setting);
      $scope.$apply();
      expect($scope.currentOrganization.isEFT).toEqual(setting);
    });
  });

  describe('test that setEftToggle function sets isEFT: ', function () {
    beforeEach(function () {
      Orgservice.setEftSetting = jasmine.createSpy().and.returnValue($q.reject());
      initController();
    });

    it('should check if setEftToggle in error state gracefully errors', function () {
      $scope.currentEftSetting = false;
      var setting = true;
      $scope.setEftToggle(setting);
      $scope.$apply();
      expect(Notification.error).toHaveBeenCalled();
    });

    it('should check if setEftToggle in error state reverts the isEFT toggle', function () {
      $scope.currentEftSetting = false;
      var setting = true;
      $scope.setEftToggle(setting);
      $scope.$apply();
      expect($scope.currentOrganization.isEFT).toEqual($scope.currentEftSetting);
    });
  });
});
