'use strict';

describe('Controller: DeviceHeaderCtrl', function () {
  var controller;

  var $stateParams = {
    device: getJSONFixture('huron/json/device/devices/54d6041e-8a67-4437-a600-6307adc6fb64.json')
  };

  beforeEach(module('Huron'));

  beforeEach(inject(function ($controller) {
    controller = $controller('DeviceHeaderCtrl', {
      $stateParams: $stateParams
    });
  }));

  describe('DeviceHeaderCtrl controller', function () {
    it('should derive device icon name correctly from device model', function () {
      // model: Cisco DX650 should derive to cisco_dx650.png
      expect(controller.icon).toEqual('cisco_dx650.png');
    });

    it('should have a title', function () {
      expect(controller.title).toEqual('Cisco DX650');
    });
  });
});
