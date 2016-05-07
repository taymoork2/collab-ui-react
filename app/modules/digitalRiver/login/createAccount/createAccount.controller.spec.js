(function () {
  'use strict';

  describe('Controller: createAccountController', function () {
    var controller, $controller, DigitalRiverService, $q, $rootScope, $state, $stateParams;
    var email = 'magic@email.com';

    beforeEach(module('DigitalRiver'));

    beforeEach(inject(function (_$rootScope_, _$controller_, _$state_, _$stateParams_, _DigitalRiverService_, _$q_) {
      $rootScope = _$rootScope_;
      DigitalRiverService = _DigitalRiverService_;
      $controller = _$controller_;
      $state = _$state_;
      $stateParams = _$stateParams_;
      $stateParams.referrer = DigitalRiverService.getDrReferrer();
      $stateParams.params = {};
      $stateParams.params.sku = 'A-SPK-M1CSB';
      controller = $controller('createAccountController', {
        $stateParams: $stateParams
      });
      controller.email = email;
      controller.email1 = email;
      controller.email2 = email;
      controller.password1 = 'pwd';
      controller.password2 = 'pwd';
      controller.drReferrer = DigitalRiverService.getDrReferrer();
      $q = _$q_;
      spyOn(DigitalRiverService, 'addDrUser').and.returnValue($q.when({
        data: {}
      }));
      spyOn(DigitalRiverService, 'userExists').and.returnValue($q.when());
      spyOn(DigitalRiverService, 'decrytpUserAuthToken').and.returnValue($q.when());
      spyOn($state, 'go');
    }));

    function initController() {}

    describe('confirmPlaceholder', function () {
      it('should return the correct value', function () {
        expect(controller.confirmEmailPlaceholder()).toEqual('digitalRiver.createAccount.confirmEmailPlaceholder');
      });
    });

    describe('handleCreateAccount', function () {
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
        controller.email2 = 'foo1@bar.com';
        controller.handleCreateAccount();
        expect(controller.error).toEqual('digitalRiver.createAccount.validation.emailsDontMatch');
      });

      it('should validate mismatched passwords', function () {
        controller.password1 = 'pwd1';
        controller.password2 = 'pwd2';
        controller.handleCreateAccount();
        expect(controller.error).toEqual('digitalRiver.createAccount.validation.passwordsDontMatch');
      });

      it('should re-validate the email when the email changes', function () {
        controller.email1 = 'foo1@bar.com';
        controller.email2 = 'foo1@bar.com';
        controller.handleCreateAccount();
        expect(DigitalRiverService.userExists).toHaveBeenCalled();
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
        controller.handleCreateAccount();
        $rootScope.$apply();
      });

      it('should error on bad promise', function () {
        expect(DigitalRiverService.addDrUser).toHaveBeenCalled();
        expect(controller.error).toEqual('digitalRiver.validation.unexpectedError');
      });
    });

    describe('addDrUser success results', function () {
      it('should successfully set window and cookie', function (done) {
        DigitalRiverService.addDrUser.and.returnValue($q.when({
          data: {
            success: true
          }
        }));
        DigitalRiverService.decrytpUserAuthToken.and.returnValue($q.when({
          status: 200,
          data: {
            "userKey": {
              "userID": "12345678-1234-1234-1234-1234567890ab"
            }
          }
        }));
        controller.handleCreateAccount().then(function () {
          expect(DigitalRiverService.addDrUser).toHaveBeenCalled();
          expect(controller.error).not.toBeDefined();
          expect($state.go).toHaveBeenCalledWith('submitOrder', jasmine.any(Object));
          done();
        });
        $rootScope.$apply();
      });
    });

    describe('loading info from url path', function () {
      it('should properly load the referrer', function () {
        expect(controller.drReferrer).toBeTruthy();
      });

      it('should properly fetch the email from the url', function () {
        expect(controller.email1).toBe(email);
      });
    });
  });
})();
