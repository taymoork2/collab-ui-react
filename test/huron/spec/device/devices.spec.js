'use strict';

xdescribe('Controller: DevicesCtrl', function () {

  var $scope, controller, $httpBackend, userEndpointService, HuronConfig;

  beforeEach(module('ui.bootstrap'));
  beforeEach(module('ui.router'));
  beforeEach(module('ngResource'));
  beforeEach(module('Huron'));
  beforeEach(module('uc.device'));

  var userDevicesCard = {
    addGenerateAuthCodeLink: sinon.stub(),
    removeGenerateAuthCodeLink: sinon.stub()
  };

  var authInfo = {
    getOrgId: sinon.stub().returns('1')
  };

  beforeEach(module(function ($provide) {
    $provide.value("Authinfo", authInfo);
  }));

  beforeEach(inject(function ($rootScope, $controller, _$httpBackend_, _UserEndpointService_, _HuronConfig_) {
    $scope = $rootScope.$new();
    $httpBackend = _$httpBackend_;
    HuronConfig = _HuronConfig_;
    userEndpointService = _UserEndpointService_;
    controller = $controller('DevicesCtrl', {
      $scope: $scope,
      UserEndpointService: userEndpointService
    });
    $scope.$parent.userDevicesCard = userDevicesCard;
    $rootScope.$apply();
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('DevicesCtrl controller', function () {
    it('should be created successfully', function () {
      expect(controller).toBeDefined();
    });

    beforeEach(function () {
      //devices requests
      $httpBackend.whenGET(HuronConfig.getCmiUrl() + '/voice/customers/1/sipendpoints/a61d770c-0f00-4251-b599-a10d49399ddb').respond(200, getJSONFixture('huron/json/device/devices/a61d770c-0f00-4251-b599-a10d49399ddb.json'));
      $httpBackend.whenGET(HuronConfig.getCmiUrl() + '/voice/customers/1/sipendpoints/7a94bbdf-6df5-4240-ae68-b5fa9d25df51').respond(200, getJSONFixture('huron/json/device/devices/7a94bbdf-6df5-4240-ae68-b5fa9d25df51.json'));
      $httpBackend.whenGET(HuronConfig.getCmiUrl() + '/voice/customers/1/users/0515b4c0-c12f-45ac-8fbe-483f1c07956c/endpoints').respond(200, getJSONFixture('huron/json/device/devices.json'));

      $httpBackend.whenGET(HuronConfig.getCmiUrl() + '/voice/customers/1/sipendpoints/a61d770c-0f00-4251-b599-a10d49399ddb?status=true').respond(200, getJSONFixture('huron/json/device/devices/a61d770c-0f00-4251-b599-a10d49399ddb-With-Status.json'));
      $httpBackend.whenGET(HuronConfig.getCmiUrl() + '/voice/customers/1/sipendpoints/7a94bbdf-6df5-4240-ae68-b5fa9d25df51?status=true').respond(200, getJSONFixture('huron/json/device/devices/7a94bbdf-6df5-4240-ae68-b5fa9d25df51-With-Status.json'));

      //otps request
      $httpBackend.whenGET(HuronConfig.getCmiUrl() + '/common/customers/1/users/0515b4c0-c12f-45ac-8fbe-483f1c07956c/otp').respond(200, getJSONFixture('huron/json/device/otps.json'));

      $scope.currentUser = getJSONFixture('huron/json/user/users/0515b4c0-c12f-45ac-8fbe-483f1c07956c.json');
      $scope.$digest();
      $httpBackend.flush();
    });

    it('should populate vm.otps with 1 otp', function () {
      expect(controller.otps.length).toEqual(1);
    });

    it('should populate vm.devices with 2 devices', function () {
      expect(controller.devices.length).toEqual(2);
    });

    it('should populate the device status of the device', function () {
      expect(controller.devices[0].deviceStatus.status).toEqual('Online');
      expect(controller.devices[0].deviceStatus.ipAddress).toEqual('127.0.0.1');
    });

    describe('after activate', function () {
      it('should have showDeviceDetailPanel method defined', function () {
        expect(controller.showDeviceDetailPanel).toBeDefined();
      });

    });
  });
});
