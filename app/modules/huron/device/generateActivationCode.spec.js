'use strict';

describe('Controller: GenerateActivationCodeCtrl', function () {
  var controller, $controller, $previousState, $scope, $state, $httpBackend, HuronConfig, ActivationCodeEmailService, Notification, OtpService, $q;
  beforeEach(module('Huron'));

  var stateParams = {
    currentUser: {
      userName: 'jeffisawesome@awesomedude.com',
      id: '12345',
      meta: {
        customerID: '98765'
      }
    },
    activationCode: 'new'
  };

  var otp = getJSONFixture('huron/json/device/otps/0001000200030004.json');

  beforeEach(inject(dependencies));
  beforeEach(initSpies);

  function dependencies($rootScope, _$controller_, _$previousState_, _$state_, _$httpBackend_, _HuronConfig_, _ActivationCodeEmailService_, _Notification_, _OtpService_, _$q_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $previousState = _$previousState_;
    $state = _$state_;
    $httpBackend = _$httpBackend_;
    Notification = _Notification_;
    HuronConfig = _HuronConfig_;
    ActivationCodeEmailService = _ActivationCodeEmailService_;
    OtpService = _OtpService_;
    $q = _$q_;
  }

  function initSpies() {
    $state.modal = jasmine.createSpyObj('modal', ['close']);

    spyOn($previousState, 'go');
    spyOn($state, 'go').and.returnValue($q.when());
    spyOn(Notification, 'errorWithTrackingId');
    spyOn(OtpService, 'getQrCodeUrl').and.returnValue($q.when(getJSONFixture('huron/json/device/otps/qrcode.json')));
    spyOn(OtpService, 'generateOtp').and.returnValue($q.when(otp));

    sinon.spy(Notification, "notify");
  }

  function initController() {
    controller = $controller('GenerateActivationCodeCtrl', {
      $scope: $scope,
      $state: $state,
      $stateParams: stateParams
    });
    controller.showEmail = false;
    controller.otp = {
      code: 'old'
    };
    $scope.$apply();
  }

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('Success generating activation code', function () {
    beforeEach(initController);

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
        $httpBackend.expectPOST(HuronConfig.getEmailUrl() + '/email/activationcode', {
          email: stateParams.currentUser.userName,
          firstName: stateParams.currentUser.userName,
          userId: stateParams.currentUser.id,
          customerId: stateParams.currentUser.meta.customerId,
          oneTimePassword: otp.code,
          expiresOn: moment(otp.expiresOn).tz(jstz.determine().name()).format('MMMM DD, YYYY h:mm A (z)')
        }).respond(200);
        controller.sendActivationCodeEmail();
        $httpBackend.flush();
        expect(Notification.notify.calledWith(['generateActivationCodeModal.emailSuccess'], 'success')).toBe(true);
        expect($state.modal.close).toHaveBeenCalled();
      });

      it('should try to send email and notify error', function () {
        $httpBackend.expectPOST(HuronConfig.getEmailUrl() + '/email/activationcode').respond(500);
        controller.sendActivationCodeEmail();
        $httpBackend.flush();
        expect(Notification.notify.calledOnce).toBe(true);
        expect($state.modal.close).not.toHaveBeenCalled();
      });
    });
  });

  describe('Error generating activation code', function () {
    afterEach(shouldGoPreviousState);

    describe('with a 404', function () {
      beforeEach(initOtpError({
        status: 404
      }));
      beforeEach(initController);

      it('should notify not found error', function () {
        expect(Notification.errorWithTrackingId).toHaveBeenCalled();
        expect(Notification.errorWithTrackingId.calls.mostRecent().args[1]).toEqual('generateActivationCodeModal.generateErrorNotFound');
      });
    });

    describe('with any other error', function () {
      beforeEach(initOtpError({
        status: 500
      }));
      beforeEach(initController);

      it('should notify error', function () {
        expect(Notification.errorWithTrackingId).toHaveBeenCalled();
        expect(Notification.errorWithTrackingId.calls.mostRecent().args[1]).toEqual('generateActivationCodeModal.generateError');
      });
    });

    function initOtpError(errorWithTrackingId) {
      return function () {
        OtpService.generateOtp.and.returnValue($q.reject(errorWithTrackingId));
      };
    }

    function shouldGoPreviousState() {
      expect($previousState.go).toHaveBeenCalled();
    }
  });
});
