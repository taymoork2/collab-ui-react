(function () {
  'use strict';

  describe('Controller: createAccountController', function () {
    var controller, DigitalRiverService;

    beforeEach(module('Core'));

    beforeEach(inject(function (_$controller_, _$location_, _$window_, _$cookies_, _$translate_, _DigitalRiverService_, $q) {
      DigitalRiverService = _DigitalRiverService_;
      controller = _$controller_('createAccountController', {
        $location: _$location_,
        $window: _$window_,
        $cookies: _$cookies_,
        $translate: _$translate_,
        DigitalRiverService: DigitalRiverService
      });
      controller.email1 = '';
      controller.email2 = '';
      controller.password1 = '';
      controller.password2 = '';
      controller.error = '';
      spyOn(DigitalRiverService, "addDrUser").and.returnValue($q.when());
    }));

    describe('confirmPlaceholder', function () {
      it('should return the correct value', function () {
        expect(controller.confirmPlaceholder()).toEqual('digitalRiver.createAccount.confirmPlaceholder');
      });
    });

    describe('handleCreateAccount', function () {

      it('should validate an empty email', function () {
        controller.password1 = 'pwd';
        controller.password2 = 'pwd';
        controller.handleCreateAccount();
        expect(controller.error).toEqual('digitalRiver.createAccount.validation.emptyEmail');
      });

      it('should validate an empty password', function () {
        controller.email1 = 'foo@bar.com';
        controller.email2 = 'foo@bar.com';
        controller.handleCreateAccount();
        expect(controller.error).toEqual('digitalRiver.createAccount.validation.emptyPassword');
      });

      it('should validate mismatched emails', function () {
        controller.email1 = 'foo1@bar.com';
        controller.email2 = 'foo@bar.com';
        controller.password1 = 'pwd';
        controller.password2 = 'pwd';
        controller.handleCreateAccount();
        expect(controller.error).toEqual('digitalRiver.createAccount.validation.emailsDontMatch');
      });

      it('should validate mismatched passwords', function () {
        controller.email1 = 'foo@bar.com';
        controller.email2 = 'foo@bar.com';
        controller.password1 = 'pwd1';
        controller.password2 = 'pwd';
        controller.handleCreateAccount();
        expect(controller.error).toEqual('digitalRiver.createAccount.validation.passwordsDontMatch');
      });

      it('should pass happy path', function () {
        controller.email1 = 'foo@bar.com';
        controller.email2 = 'foo@bar.com';
        controller.password1 = 'pwd';
        controller.password2 = 'pwd';
        controller.handleCreateAccount();
        expect(controller.error).toEqual('');
        expect(DigitalRiverService.addDrUser).toHaveBeenCalled();
      });

    });

  });
})();
