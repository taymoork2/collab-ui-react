'use strict';

describe('Service: DeviceService', function () {
  var $httpBackend, $rootScope, DeviceService, HuronConfig;

  beforeEach(angular.mock.module('uc.device'));
  beforeEach(angular.mock.module('ui.router'));
  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('ngResource'));

  var authInfo = {
    getOrgId: sinon.stub().returns('1')
  };

  beforeEach(angular.mock.module(function ($provide) {
    $provide.value("Authinfo", authInfo);
  }));

  beforeEach(
    inject(
      function (_$httpBackend_, _$rootScope_, _DeviceService_, _HuronConfig_) {
        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
        DeviceService = _DeviceService_;
        HuronConfig = _HuronConfig_;
      }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  it('should be registered', function () {
    expect(DeviceService).toBeDefined();
  });

  describe('loadDevices function', function () {
    it('should exist', function () {
      expect(DeviceService.loadDevices).toBeDefined();
    });

    it('should return 2 devices', function () {
      $httpBackend.whenGET(HuronConfig.getCmiUrl() + '/voice/customers/1/sipendpoints/a61d770c-0f00-4251-b599-a10d49399ddb').respond(200, getJSONFixture('huron/json/device/devices/a61d770c-0f00-4251-b599-a10d49399ddb.json'));
      $httpBackend.whenGET(HuronConfig.getCmiUrl() + '/voice/customers/1/sipendpoints/7a94bbdf-6df5-4240-ae68-b5fa9d25df51').respond(200, getJSONFixture('huron/json/device/devices/7a94bbdf-6df5-4240-ae68-b5fa9d25df51.json'));
      $httpBackend.whenGET(HuronConfig.getCmiUrl() + '/voice/customers/1/users/1/endpoints').respond(200, getJSONFixture('huron/json/device/devices.json'));

      $httpBackend.whenGET(HuronConfig.getCmiUrl() + '/voice/customers/1/sipendpoints/a61d770c-0f00-4251-b599-a10d49399ddb?ipaddress=true&status=true').respond(200, getJSONFixture('huron/json/device/devices/a61d770c-0f00-4251-b599-a10d49399ddb-With-Status.json'));
      $httpBackend.whenGET(HuronConfig.getCmiUrl() + '/voice/customers/1/sipendpoints/7a94bbdf-6df5-4240-ae68-b5fa9d25df51?ipaddress=true&status=true').respond(200, getJSONFixture('huron/json/device/devices/7a94bbdf-6df5-4240-ae68-b5fa9d25df51-With-Status.json'));

      DeviceService.loadDevices('1').then(function (data) {
        expect(data.length).toEqual(2);
      });
      $httpBackend.flush();
    });
  });

  describe('updateDevice function', function () {
    it('should exist', function () {
      expect(DeviceService.updateDevice).toBeDefined();
    });

    it('should update the device', function () {
      $httpBackend.whenPUT(HuronConfig.getCmiUrl() + '/voice/customers/1/sipendpoints/54d6041e-8a67-4437-a600-6307adc6fb64').respond(200);
      DeviceService.updateDevice(getJSONFixture('huron/json/device/devices/54d6041e-8a67-4437-a600-6307adc6fb64.json')).then(function () {
        // not sure what to expect here.  Just want to exercise code path.
      });
      $httpBackend.flush();
    });
  });

  describe('deleteDevice function', function () {
    it('should exist', function () {
      expect(DeviceService.deleteDevice).toBeDefined();
    });

    it('should delete the device', function () {
      $httpBackend.whenDELETE(HuronConfig.getCmiUrl() + '/voice/customers/1/sipendpoints/54d6041e-8a67-4437-a600-6307adc6fb64').respond(204);
      DeviceService.deleteDevice(getJSONFixture('huron/json/device/devices/54d6041e-8a67-4437-a600-6307adc6fb64.json')).then(function () {
        // not sure what to expect here.  Just want to exercise code path.
      });
      $httpBackend.flush();
    });
  });

  describe('getCurrentDevice function', function () {
    it('should exist', function () {
      expect(DeviceService.getCurrentDevice).toBeDefined();
    });
  });

  describe('setCurrentDevice function', function () {
    it('should exist', function () {
      expect(DeviceService.setCurrentDevice).toBeDefined();
    });

    it('should set currentDevice and retrieve the same object when calling getCurrentDevice()', function () {
      DeviceService.setCurrentDevice(getJSONFixture('huron/json/device/devices/54d6041e-8a67-4437-a600-6307adc6fb64.json'));
      expect(DeviceService.getCurrentDevice()).toEqual(getJSONFixture('huron/json/device/devices/54d6041e-8a67-4437-a600-6307adc6fb64.json'));
    });
  });
});
