'use strict';

describe('Controller: DevicesCtrlHuron', function () {
  var controller, $scope, $q, $stateParams, $state, CsdmHuronUserDeviceService, OtpService, Config, poller;

  beforeEach(angular.mock.module('Huron'));

  var deviceList = {};

  var userOverview = {
    addGenerateAuthCodeLink: jasmine.createSpy(),
    enableAuthCodeLink: jasmine.createSpy(),
    disableAuthCodeLink: jasmine.createSpy()
  };

  var emptyArray = [];

  beforeEach(inject(function (_$rootScope_, _$controller_, _$q_, _$stateParams_, _$state_, _OtpService_, _Config_, _CsdmHuronUserDeviceService_) {
    $scope = _$rootScope_.$new();
    $scope.userOverview = userOverview;
    $stateParams = _$stateParams_;
    $q = _$q_;
    CsdmHuronUserDeviceService = _CsdmHuronUserDeviceService_;
    OtpService = _OtpService_;
    Config = _Config_;
    $state = _$state_;

    $stateParams.currentUser = {
      "userName": "pregoldtx1sl+2callwaiting1@gmail.com",
      "entitlements": [
        "squared-room-moderation",
        "webex-messenger",
        "ciscouc",
        "squared-call-initiation",
        "webex-squared",
        "squared-syncup"
      ]
    };

    poller = {
      getDeviceList: function () {
        return null;
      },
      dataLoaded: function () {
        return true;
      }
    };

    spyOn(CsdmHuronUserDeviceService, 'create').and.returnValue(poller);
    spyOn(poller, 'getDeviceList').and.returnValue($q.when(deviceList));
    spyOn(OtpService, 'loadOtps').and.returnValue($q.when(emptyArray));

    controller = _$controller_('DevicesCtrlHuron', {
      $scope: $scope
    });

    $scope.$apply();
  }));

  it('should be created successfully', function () {
    expect(controller).toBeDefined();
  });

  describe('activate() method', function () {

    it('HuronDeviceService.getDeviceList() and OtpService.loadOtps() should only be called once', function () {
      expect(poller.getDeviceList.calls.count()).toEqual(1);
      expect(OtpService.loadOtps.calls.count()).toEqual(1);
    });

    it('broadcast [deviceDeactivated] event', function () {
      $scope.$broadcast('deviceDeactivated');
      $scope.$apply();
      expect(poller.getDeviceList.calls.count()).toEqual(2);
      expect(OtpService.loadOtps.calls.count()).toEqual(2);
    });

    it('broadcast [otpGenerated] event', function () {
      $scope.$broadcast('otpGenerated');
      $scope.$apply();
      expect(poller.getDeviceList.calls.count()).toEqual(2);
      expect(OtpService.loadOtps.calls.count()).toEqual(2);
    });

    it('broadcast [entitlementsUpdated] event', function () {
      $scope.$broadcast('entitlementsUpdated');
      $scope.$apply();
      expect(poller.getDeviceList.calls.count()).toEqual(2);
      expect(OtpService.loadOtps.calls.count()).toEqual(2);
    });

    it('should not call activate when Huron entitlement is removed', function () {
      poller.getDeviceList.calls.reset();
      OtpService.loadOtps.calls.reset();

      $stateParams.currentUser.entitlements = ["squared-room-moderation", "webex-messenger", "squared-call-initiation", "webex-squared", "squared-syncup"];
      $scope.$broadcast('entitlementsUpdated');
      $scope.$apply();

      expect(poller.getDeviceList.calls.count()).toEqual(0);
      expect(OtpService.loadOtps.calls.count()).toEqual(0);
    });

    it('should not call activate when currentUser is not defined', function () {
      poller.getDeviceList.calls.reset();
      OtpService.loadOtps.calls.reset();
      $stateParams.currentUser = undefined;
      $scope.$broadcast('entitlementsUpdated');
      $scope.$apply();

      expect(poller.getDeviceList.calls.count()).toEqual(0);
      expect(OtpService.loadOtps.calls.count()).toEqual(0);
    });

  });

  describe('showDeviceDetails() method', function () {
    it('should call $state.go', function () {
      spyOn($state, 'go').and.returnValue($q.when());
      controller.showDeviceDetails('currentDevice');
      expect($state.go).toHaveBeenCalled();
    });
  });

  describe('showGenerateOtpButton()', function () {
    it('should be false when not entitled to huron', function () {
      $stateParams.currentUser.entitlements = ["squared-room-moderation", "webex-messenger", "squared-call-initiation", "webex-squared", "squared-syncup"];
      $scope.$broadcast('entitlementsUpdated');
      $scope.$apply();
      expect(controller.showGenerateOtpButton).toBeFalsy();
    });

    it('should be false when devices', function () {
      expect(controller.showGenerateOtpButton).toBeFalsy();
    });
  });
});
