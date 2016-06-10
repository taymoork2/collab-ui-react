'use strict';

describe('Controller: EnterpriseSettingsCtrl', function () {
  var controller, $scope, Config, Orgservice, SparkDomainManagementService, $q, $controller, Notification, SSOService;
  var orgServiceJSONFixture = getJSONFixture('core/json/organizations/Orgservice.json');
  var getOrgStatus = 200;
  var rootScope;

  var authInfo = {
    getOrgId: sinon.stub().returns('bcd7afcd-839d-4c61-a7a8-31c6c7f016d7')
  };

  beforeEach(module(function ($provide) {
    $provide.value("Authinfo", authInfo);
  }));

  beforeEach(module('Core'));

  beforeEach(installPromiseMatchers);

  beforeEach(inject(function ($rootScope, _$controller_, _Notification_, _Config_, _$q_, _Orgservice_, _SparkDomainManagementService_) {
    $scope = $rootScope.$new();
    rootScope = $rootScope;
    SparkDomainManagementService = _SparkDomainManagementService_;
    Config = _Config_;
    $controller = _$controller_;
    Orgservice = _Orgservice_;
    Notification = _Notification_;
    $q = _$q_;

    $scope.wizard = {
      nextTab: sinon.stub()
    };

    spyOn($scope.wizard, 'nextTab');

    SparkDomainManagementService.checkDomainAvailability = jasmine.createSpy().and.returnValue($q.when({
      data: {
        isDomainAvailable: true,
        isDomainReserved: false
      }
    }));

    SparkDomainManagementService.addSipDomain = jasmine.createSpy().and.returnValue($q.when({
      data: {
        isDomainAvailable: false,
        isDomainReserved: true
      }
    }));

    Orgservice.getLicensesUsage = jasmine.createSpy().and.returnValue($q.when([{
      licenses: [{
        offerName: 'SD'
      }]
    }]));

    spyOn(Orgservice, 'getOrg').and.callFake(function (callback, status) {
      callback(orgServiceJSONFixture.getOrg, getOrgStatus);
    });
    spyOn(Notification, 'error');
  }));

  function initController() {
    controller = $controller('EnterpriseSettingsCtrl', {
      $scope: $scope,
      $rootScope: rootScope,
      Authinfo: authInfo
    });

    $scope.$apply();
  }

  describe('test Orgservice getOrg callback setting displayName', function () {
    beforeEach(function () {
      Orgservice.getOrg.and.callFake(function (callback, status) {
        callback(orgServiceJSONFixture.getOrg, 201);
      });
      initController();
    });

    it('should gracefully error', function () {
      expect(Notification.error).toHaveBeenCalled();
    });
  });

  describe('test if checkSipDomainAvailability function sets isUrlAvailable to true', function () {
    beforeEach(initController);

    it('should check if checkSipDomainAvailability in success state sets isUrlAvailable to true ', function (done) {
      $scope.cloudSipDomainField.inputValue = 'shatest1';
      $scope.checkSipDomainAvailability().then(function () {
        expect($scope.cloudSipDomainField.isUrlAvailable).toEqual(true);
        expect(SparkDomainManagementService.checkDomainAvailability).toHaveBeenCalledWith($scope.cloudSipDomainField.inputValue);
        done();
      });
      $scope.$apply();
    });

    it('should disable the field and clear error on the field validation', function () {
      $scope.cloudSipDomainField.isUrlAvailable = true;
      $scope.cloudSipDomainField.isConfirmed = true;
      $scope._saveDomain();
      $scope.$apply();
      expect($scope.cloudSipDomainField.isError).toEqual(false);
      expect($scope.cloudSipDomainField.isDisabled).toEqual(true);
    });

    it('should check if checkSipDomainAvailability in success state is set to false ', function () {
      $scope.cloudSipDomainField.inputValue = 'amtest2';
      $scope.checkSipDomainAvailability();
      expect($scope.cloudSipDomainField.isUrlAvailable).toEqual(false);
    });
  });

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

  describe('test if addSipDomain errors gracefully', function () {
    beforeEach(function () {
      SparkDomainManagementService.addSipDomain.and.returnValue($q.reject());
      initController();
    });

    it('addSipDomain should error gracefully', function () {
      $scope.cloudSipDomainField.isUrlAvailable = true;
      $scope.cloudSipDomainField.isConfirmed = true;
      $scope._saveDomain();
      $scope.$apply();
      expect(Notification.error).toHaveBeenCalled();
    });
  });

  describe('test if checkRoomLicense function sets isRoomLicensed to true', function () {
    beforeEach(initController);

    it('checkRoomLicense should set Room license to true', function () {
      expect($scope.cloudSipDomainField.isRoomLicensed).toEqual(true);
    });
  });

  describe('test if checkRoomLicense function sets isRoomLicensed to false', function () {
    beforeEach(function () {
      Orgservice.getLicensesUsage.and.returnValue($q.when([{
        licenses: [{
          offerName: 'CF'
        }]
      }]));
      initController();
    });

    it('checkRoomLicense should set Room license to false', function () {
      expect($scope.cloudSipDomainField.isRoomLicensed).toEqual(false);
    });
  });
});
