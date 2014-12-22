'use strict';

describe('Controller: DeviceDetailCtrl', function () {
  var controller, scope, modal, modalInstance;

  beforeEach(module('uc.device'));
  beforeEach(module('ui.bootstrap'));
  beforeEach(module('ui.router'));
  beforeEach(module('dialogs'));
  beforeEach(module('Huron'));

  var DeviceService = {
      getCurrentDevice: sinon.stub().returns(getJSONFixture('huron/json/device/devices/54d6041e-8a67-4437-a600-6307adc6fb64.json')),
      deleteDevice: sinon.stub()
  }

  beforeEach(inject(function($modal) {
    sinon.spy($modal, 'open');
  }));

  beforeEach(inject(function ($rootScope, $controller, _$modal_) {
    scope = $rootScope.$new();
    modal = _$modal_;
    controller = $controller('DeviceDetailCtrl as vm', {
      $scope: scope,
      $modal: modal,
      DeviceService: DeviceService
    });
    $rootScope.$apply();
  }));

  describe('DeviceDetailCtrl controller', function () {
    it('should be created successfully', function () {
      expect(controller).toBeDefined;
    });

    describe('after activate', function () {
      it('should have a save method', function () {
        expect(controller.save).toBeDefined;
      })

      it('should have a deactivate method', function () {
        expect(controller.deactivate).toBeDefined;
      })

      it('should derive device icon name correctly from device model', function () {
        // model: Cisco DX650 should derive to cisco_dx650.svg
        expect(controller.deviceIcon).toEqual('cisco_dx650.svg');
      });
    });

    describe('deactivate device', function () {
      it('should popup a modal when deactivate is called', function () {
        controller.deactivate();
        expect(modal.open.calledOnce).toBe(true);
        modalInstance = modal.open.getCall(0).returnValue;
        modalInstance.close('deactivate');
        modalInstance.result.then(function () {
          DeviceService.deleteDevice();
        });
      })
    });

  });
});