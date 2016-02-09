'use strict';

describe('Controller: GenerateActivationCodeCtrl', function () {
  var controller, $scope, $state, $httpBackend, HuronConfig, ActivationCodeEmailService, Notification, HttpUtils, OtpService, $q;
  beforeEach(module('Huron'));

  var stateParams = {
    currentUser: {
      userName: 'jeffisawesome@awesomedude.com'
    },
    activationCode: 'new'
  };

  beforeEach(inject(function (Notification) {
    sinon.spy(Notification, "notify");
  }));

  beforeEach(inject(function ($rootScope, $controller, _$state_, _$httpBackend_, _HuronConfig_, _ActivationCodeEmailService_, _Notification_, _HttpUtils_, _OtpService_, _$q_) {
    $scope = $rootScope.$new();
    $state = _$state_;
    $httpBackend = _$httpBackend_;
    Notification = _Notification_;
    HuronConfig = _HuronConfig_;
    ActivationCodeEmailService = _ActivationCodeEmailService_;
    HttpUtils = _HttpUtils_;
    OtpService = _OtpService_;
    $q = _$q_;

    $state.modal = jasmine.createSpyObj('modal', ['close']);

    controller = $controller('GenerateActivationCodeCtrl', {
      $scope: $scope,
      $state: $state,
      $stateParams: stateParams
    });
    controller.showEmail = false;
    spyOn($state, 'go').and.returnValue($q.when());
    spyOn(HttpUtils, 'setTrackingID').and.returnValue('TrackingID is set');
    spyOn(OtpService, 'getQrCodeUrl').and.returnValue($q.when(getJSONFixture('huron/json/device/otps/qrcode.json')));
    spyOn(OtpService, 'generateOtp').and.returnValue($q.when(getJSONFixture('huron/json/device/otps/0001000200030004.json')));

    controller.otp = {
      code: 'old'
    };
    $rootScope.$apply();
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('GenerateActivationCodeCtrl controller', function () {
    it('should be created successfully', function () {
      expect(controller).toBeDefined();
    });

    describe('after activate', function () {
      it('should have an otp object defined', function () {
        expect(controller.otp).toBeDefined();
      });

      it('should have an qrCode defined', function () {
        expect(controller.qrCode).toEqual('FAKEIMAGE');
      });

      describe('activateEmail function', function () {
        it('should exist', function () {
          expect(controller.activateEmail).toBeDefined();
        });

        it('should set vm.showEmail = true when called', function () {
          controller.activateEmail();
          expect(controller.showEmail).toEqual(true);
        });
      });

      describe('clipboardFallback function', function () {
        it('should exist', function () {
          expect(controller.clipboardFallback).toBeDefined();
        });
      });

      describe('sendActivationCodeEmail function', function () {
        it('should exist', function () {
          expect(controller.sendActivationCodeEmail).toBeDefined();
        });

        it('should send email and notify success', function () {
          $httpBackend.whenPOST(HuronConfig.getEmailUrl() + '/email/activationcode').respond(200);
          controller.sendActivationCodeEmail();
          $httpBackend.flush();
          expect(Notification.notify.calledWith(['generateActivationCodeModal.emailSuccess'], 'success')).toBe(true);
          expect($state.modal.close).toHaveBeenCalled();
        });

        it('should try to send email and notify error', function () {
          $httpBackend.whenPOST(HuronConfig.getEmailUrl() + '/email/activationcode').respond(500);
          controller.sendActivationCodeEmail();
          $httpBackend.flush();
          expect(Notification.notify.calledOnce).toBe(true);
          expect($state.modal.close).not.toHaveBeenCalled();
        });
      });

    });
  });

});
