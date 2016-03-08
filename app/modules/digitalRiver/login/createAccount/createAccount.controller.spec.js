(function () {
  'use strict';

  describe('Controller: createAccountController', function () {
    var controller, $controller, DigitalRiverService, location, cookies, $q, $window;
    var $rootScope;

    beforeEach(module('DigitalRiver'));
    beforeEach(module(function ($provide) {
      $provide.value('$window', $window = {
        location: {
          href: ''
        }
      });
    }));


    beforeEach(inject(function (_$rootScope_, _$controller_, _$location_, _$cookies_, _DigitalRiverService_, _$q_) {
      $rootScope = _$rootScope_;
      DigitalRiverService = _DigitalRiverService_;
      $controller = _$controller_;
      location = _$location_;
      cookies = _$cookies_;

      $q = _$q_;
      spyOn(DigitalRiverService, 'addDrUser').and.returnValue($q.when({
        data: {}
      }));
    }));

    function initController() {
      controller = $controller('createAccountController');

      controller.email1 = 'foo@bar.com';
      controller.email2 = 'foo@bar.com';
      controller.password1 = 'pwd';
      controller.password2 = 'pwd';
    }

    describe('confirmPlaceholder', function () {
      beforeEach(initController);

      it('should return the correct value', function () {
        expect(controller.confirmPlaceholder()).toEqual('digitalRiver.createAccount.confirmPlaceholder');
      });
    });

    describe('handleCreateAccount', function () {
      beforeEach(initController);

      it('should validate an empty email', function () {
        controller.email1 = '';
        controller.email2 = '';
        controller.handleCreateAccount();
        expect(controller.error).toEqual('digitalRiver.createAccount.validation.emptyEmail');
      });

      it('should validate an empty password', function () {
        controller.password1 = '';
        controller.password2 = '';
        controller.handleCreateAccount();
        expect(controller.error).toEqual('digitalRiver.createAccount.validation.emptyPassword');
      });

      it('should validate mismatched emails', function () {
        controller.email1 = 'foo1@bar.com';
        controller.handleCreateAccount();
        expect(controller.error).toEqual('digitalRiver.createAccount.validation.emailsDontMatch');
      });

      it('should validate mismatched passwords', function () {
        controller.password1 = 'pwd1';
        controller.handleCreateAccount();
        expect(controller.error).toEqual('digitalRiver.createAccount.validation.passwordsDontMatch');
      });

      it('should pass happy path', function (done) {
        controller.handleCreateAccount().then(function () {
          expect(DigitalRiverService.addDrUser).toHaveBeenCalled();
          done();
        });
        $rootScope.$apply();
      });
    });

    describe('addDrUser rejected results', function () {
      beforeEach(function () {
        DigitalRiverService.addDrUser.and.returnValue($q.reject());
        initController();
        controller.handleCreateAccount();
        $rootScope.$apply();
      });

      it('should error on bad promise', function () {
        expect(DigitalRiverService.addDrUser).toHaveBeenCalled();
        expect(controller.error).toEqual('digitalRiver.validation.unexpectedError');
      });
    });

    describe('addDrUser success results', function () {
      beforeEach(function () {
        DigitalRiverService.addDrUser.and.returnValue($q.when({
          data: {
            success: true
          }
        }));
        initController();
      });

      it('should successfully set window and cookie', function (done) {
        controller.handleCreateAccount().then(function () {
          expect(DigitalRiverService.addDrUser).toHaveBeenCalled();
          expect(controller.error).not.toBeDefined();
          expect(cookies.atlasDrCookie).toEqual('error');
          expect($window.location.href).toEqual('https://www.digitalriver.com/');
          done();
        });
        $rootScope.$apply();
      });
    });

  });
})();
