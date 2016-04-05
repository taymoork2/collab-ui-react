'use strict';

describe('Controller: DevicesCtrlHuron', function () {
  var controller, $scope, $q, $stateParams, CsdmHuronUserDeviceService, OtpService, Config, poller;

  //var stateParams = getJSONFixture('huron/json/device/devicesCtrlStateParams.json');

  beforeEach(module('Huron'));

  var deviceList = {};
  //deviceList.push(getJSONFixture('huron/json/device/devices/7a94bbdf-6df5-4240-ae68-b5fa9d25df51-With-Status.json'));

  var userOverview = {
    addGenerateAuthCodeLink: jasmine.createSpy(),
    enableAuthCodeLink: jasmine.createSpy(),
    disableAuthCodeLink: jasmine.createSpy()
  };

  var emptyArray = [];

  beforeEach(inject(function (_$rootScope_, _$controller_, _$q_, _$stateParams_, _OtpService_, _Config_, _CsdmHuronUserDeviceService_) {
    $scope = _$rootScope_.$new();
    $scope.userOverview = userOverview;
    $stateParams = _$stateParams_;
    $q = _$q_;
    CsdmHuronUserDeviceService = _CsdmHuronUserDeviceService_;
    OtpService = _OtpService_;
    Config = _Config_;

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
       getDeviceList: function() {
         return null;
       },
      on: function() {}
    };

    spyOn(CsdmHuronUserDeviceService, 'create').and.returnValue(poller);
    spyOn(poller, 'on').and.stub();
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

    //it('should not call activate when currentUser is not defined', function () {
    //  poller.getDeviceList.calls.reset();
    //  OtpService.loadOtps.calls.reset();
    //  $stateParams.currentUser = undefined;
    //  $scope.$broadcast('entitlementsUpdated');
    //  $scope.$apply();
    //
    //  expect(poller.getDeviceList.calls.count()).toEqual(0);
    //  expect(OtpService.loadOtps.calls.count()).toEqual(0);
    //});

  });

  describe('showDeviceDetailPanel() method', function () {
    //it('should call DeviceService.setCurrentDevice', function () {
    //  controller.showDeviceDetails('currentDevice');
    //  expect(currentDevice).toEqual('currentDevice');
    //});
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
