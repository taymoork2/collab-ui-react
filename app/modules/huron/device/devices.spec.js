'use strict';

describe('Controller: DevicesCtrlHuron', function () {
  var controller, $scope, $q, $stateParams, DeviceService, OtpService, Config, currentDevice, FeatureToggleService;

  var stateParams = getJSONFixture('huron/json/device/devicesCtrlStateParams.json');

  beforeEach(module('Huron'));

  var deviceList = [];
  deviceList.push(getJSONFixture('huron/json/device/devices/7a94bbdf-6df5-4240-ae68-b5fa9d25df51-With-Status.json'));

  var userOverview = {
    addGenerateAuthCodeLink: jasmine.createSpy(),
    removeGenerateAuthCodeLink: jasmine.createSpy()
  };

  var emptyArray = [];

  beforeEach(inject(function (_$rootScope_, _$controller_, _$q_, _$stateParams_, _DeviceService_, _OtpService_, _Config_, _FeatureToggleService_) {
    $scope = _$rootScope_.$new();
    $scope.userOverview = userOverview;

    $q = _$q_;
    $stateParams = _$stateParams_;
    DeviceService = _DeviceService_;
    OtpService = _OtpService_;
    Config = _Config_;
    FeatureToggleService = _FeatureToggleService_;

    $stateParams.currentUser = stateParams.currentUser;

    spyOn(DeviceService, 'loadDevices').and.returnValue($q.when(deviceList));
    spyOn(DeviceService, 'setCurrentDevice').and.callFake(function (device) {
      currentDevice = device;
    });

    spyOn(OtpService, 'loadOtps').and.returnValue($q.when(emptyArray));
    spyOn(FeatureToggleService, 'supports').and.returnValue($q.when(false));

    controller = _$controller_('DevicesCtrlHuron', {
      $scope: $scope,
    });

    $scope.$apply();
  }));

  it('should be created successfully', function () {
    expect(controller).toBeDefined();
  });

  describe('activate() method', function () {

    it('DeviceService.loadDevices() and OtpService.loadOtps() should only be called once', function () {
      expect(DeviceService.loadDevices.calls.count()).toEqual(1);
      expect(OtpService.loadOtps.calls.count()).toEqual(1);
    });

    it('broadcast [deviceDeactivated] event', function () {
      $scope.$broadcast('deviceDeactivated');
      $scope.$apply();
      expect(DeviceService.loadDevices.calls.count()).toEqual(2);
      expect(OtpService.loadOtps.calls.count()).toEqual(2);
    });

    it('broadcast [otpGenerated] event', function () {
      $scope.$broadcast('otpGenerated');
      $scope.$apply();
      expect(DeviceService.loadDevices.calls.count()).toEqual(2);
      expect(OtpService.loadOtps.calls.count()).toEqual(2);
    });

    it('broadcast [entitlementsUpdated] event', function () {
      $scope.$broadcast('entitlementsUpdated');
      $scope.$apply();
      expect(DeviceService.loadDevices.calls.count()).toEqual(2);
      expect(OtpService.loadOtps.calls.count()).toEqual(2);
    });

    it('should not call activate when Huron entitlement is removed', function () {
      DeviceService.loadDevices.calls.reset();
      OtpService.loadOtps.calls.reset();

      $stateParams.currentUser.entitlements = ["squared-room-moderation", "webex-messenger", "squared-call-initiation", "webex-squared", "squared-syncup"];
      $scope.$broadcast('entitlementsUpdated');
      $scope.$apply();

      expect(DeviceService.loadDevices.calls.count()).toEqual(0);
      expect(OtpService.loadOtps.calls.count()).toEqual(0);
    });

    it('should not call activate when currentUser is not defined', function () {
      DeviceService.loadDevices.calls.reset();
      OtpService.loadOtps.calls.reset();

      $stateParams.currentUser = undefined;
      $scope.$broadcast('entitlementsUpdated');
      $scope.$apply();

      expect(DeviceService.loadDevices.calls.count()).toEqual(0);
      expect(OtpService.loadOtps.calls.count()).toEqual(0);
    });

  });

  describe('showDeviceDetailPanel() method', function () {
    it('should call DeviceService.setCurrentDevice', function () {
      controller.showDeviceDetailPanel('currentDevice');
      expect(currentDevice).toEqual('currentDevice');
    });
  });

});
