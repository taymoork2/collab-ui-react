'use strict';

describe('Controller: EnterpriseSettingsCtrl', function () {
  var controller, $scope, Config, Orgservice, SparkDomainManagementService, $q, $controller, Notification;
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
    spyOn(SparkDomainManagementService, 'checkDomainAvailability').and.returnValue($q.when({
      data: {
        isDomainAvailable: true,
        isDomainReserved: false
      }
    }));

    spyOn(SparkDomainManagementService, 'addSipDomain').and.returnValue($q.when({
      data: {
        isDomainAvailable: false,
        isDomainReserved: true
      }
    }));

    spyOn(Orgservice, 'getLicensesUsage').and.returnValue($q.when([{
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
    controller = $controller('SipDomainSettingController', {
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
      controller.inputValue = 'shatest1';
      controller.checkSipDomainAvailability().then(function () {
        expect(controller.isUrlAvailable).toEqual(true);
        expect(SparkDomainManagementService.checkDomainAvailability).toHaveBeenCalledWith(controller.inputValue);
        done();
      });
      $scope.$apply();
    });

    it('should disable the field and clear error on the field validation', function () {
      controller._inputValue = controller._validatedValue = "alalalalalong!";
      controller.isConfirmed = true;
      controller.saveDomain();
      $scope.$apply();
      expect(controller.isError).toEqual(false);
      expect(controller.isDisabled).toEqual(true);
    });

    it('should check if checkSipDomainAvailability in success state is set to false ', function () {
      controller.inputValue = 'amtest2';
      controller.checkSipDomainAvailability();
      expect(controller.isUrlAvailable).toEqual(false);
    });
  });

  describe('test if addSipDomain errors gracefully', function () {
    beforeEach(function () {
      SparkDomainManagementService.addSipDomain.and.returnValue($q.reject());
      initController();
    });

    it('addSipDomain should error gracefully', function () {

      controller._inputValue = controller._validatedValue = "alalalalalong!";
      controller.isConfirmed = true;
      controller.saveDomain();
      $scope.$apply();
      expect(Notification.error).toHaveBeenCalled();
    });
  });

  describe('test if checkRoomLicense function sets isRoomLicensed to true', function () {
    beforeEach(initController);

    it('checkRoomLicense should set Room license to true', function () {
      expect(controller.isRoomLicensed).toEqual(true);
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
      expect(controller.isRoomLicensed).toEqual(false);
    });
  });
});
