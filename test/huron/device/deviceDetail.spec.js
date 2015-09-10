'use strict';

describe('Controller: DeviceDetailCtrl', function () {
  var controller, $scope, $httpBackend, $modal, modalInstance, HuronConfig, Notification, DeviceService, UserEndpointService;

  var $stateParams = {
    device: getJSONFixture('huron/json/device/devices/54d6041e-8a67-4437-a600-6307adc6fb64.json')
  };

  beforeEach(module('uc.device'));
  beforeEach(module('cisco.ui'));
  beforeEach(module('ui.router'));
  beforeEach(module('dialogs'));
  beforeEach(module('ngResource'));
  beforeEach(module('Huron'));

  var authInfo = {
    getOrgId: sinon.stub().returns('1')
  };

  beforeEach(module(function ($provide) {
    $provide.value("Authinfo", authInfo);
  }));

  beforeEach(inject(function ($modal) {
    sinon.spy($modal, 'open');
  }));

  beforeEach(inject(function (Notification) {
    sinon.spy(Notification, "notify");
  }));

  beforeEach(inject(function ($rootScope, $controller, _$modal_, _$httpBackend_, _HuronConfig_, _Notification_, _DeviceService_, _UserEndpointService_) {
    $scope = $rootScope.$new();
    $modal = _$modal_;
    $httpBackend = _$httpBackend_;
    HuronConfig = _HuronConfig_;
    Notification = _Notification_;
    DeviceService = _DeviceService_;
    UserEndpointService = _UserEndpointService_;
    controller = $controller('DeviceDetailCtrl', {
      $scope: $scope,
      $modal: $modal,
      $stateParams: $stateParams
    });
    $rootScope.$apply();
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('DeviceDetailCtrl controller', function () {
    it('should be created successfully', function () {
      expect(controller).toBeDefined();
    });

    describe('after activate', function () {

      describe('save function', function () {
        it('should exist', function () {
          expect(controller.save).toBeDefined();
        });

        it('should successfully save and notify', function () {
          $httpBackend.whenPUT(HuronConfig.getCmiUrl() + '/voice/customers/1/sipendpoints/54d6041e-8a67-4437-a600-6307adc6fb64').respond(200);
          controller.save();
          $httpBackend.flush();
          expect(Notification.notify.calledOnce).toBe(true);
        });

        it('should fail to save and notify', function () {
          $httpBackend.whenPUT(HuronConfig.getCmiUrl() + '/voice/customers/1/sipendpoints/54d6041e-8a67-4437-a600-6307adc6fb64').respond(500);
          controller.save();
          $httpBackend.flush();
          expect(Notification.notify.calledOnce).toBe(true);
        });
      });

      describe('deactivate function', function () {
        it('should popup a modal when called', function () {
          controller.deactivate();
          expect($modal.open.calledOnce).toBe(true);
          modalInstance = $modal.open.getCall(0).returnValue;
          modalInstance.dismiss();
        });
      });
    });

  });
});
