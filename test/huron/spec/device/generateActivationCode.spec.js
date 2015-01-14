'use strict';

describe('Controller: GenerateActivationCodeCtrl', function () {
  var controller, scope;

  beforeEach(module('uc.device'));
  beforeEach(module('ui.bootstrap'));
  beforeEach(module('ui.router'));
  beforeEach(module('dialogs'));
  beforeEach(module('Huron'));

  var ActivationCodeEmailService = {
   save: sinon.stub()
  };

  var OtpService = {
    getQrCodeUrl: sinon.stub(),
    generateOtp: sinon.stub().fulfills(getJSONFixture('huron/json/device/otps/0001000200030004.json'))
  }

  var stateParams = {
    currentUser: {
      userName: 'jeffisawesome@awesomedude.com'
    },
    activationCode: 'new'
  };

  beforeEach(inject(function ($rootScope, $controller, $stateParams) {
    scope = $rootScope.$new();
    controller = $controller('GenerateActivationCodeCtrl as vm', {
      $scope: scope,
      $stateParams: stateParams,
      OtpService: OtpService,
      ActivationCodeEmailService: ActivationCodeEmailService
    });
    $rootScope.$apply();
  }));

  describe('GenerateActivationCodeCtrl controller', function () {
    it('should be created successfully', function () {
      expect(controller).toBeDefined;
    });

    describe('after activate', function() {
      it('should have an otp object defined', function () {
        expect(controller.otp).toBeDefined;
      })

      it('should have a activateEmail method', function () {
        expect(controller.activateEmail).toBeDefined;
      })

      it('should have a clipboardFallback method', function () {
        expect(controller.clipboardFallback).toBeDefined;
      })

      it('should have a sendActivationCodeEmail method', function () {
        expect(controller.sendActivationCodeEmail).toBeDefined;
      });
    });
  });

});