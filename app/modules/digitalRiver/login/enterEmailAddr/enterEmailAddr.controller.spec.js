(function () {
  'use strict';

  describe('Controller: enterEmailAddrController', function () {
    var controller, DigitalRiverService, $window, $controller, $rootScope, $q, $state;

    beforeEach(module('DigitalRiver'));

    beforeEach(inject(function (_$rootScope_, _$controller_, _DigitalRiverService_, _$q_, _$state_) {
      $rootScope = _$rootScope_;
      DigitalRiverService = _DigitalRiverService_;
      $controller = _$controller_;
      $state = _$state_;
      $state.params.referrer = DigitalRiverService.getDrReferrer();
      $state.params.sku = 'A-SPK-M1CSB';
      controller = $controller('enterEmailAddrController', {
        $state: $state
      });
      controller.error = undefined;
      $rootScope.$apply();
      $q = _$q_;
      spyOn(DigitalRiverService, 'userExists').and.returnValue($q.when());
      spyOn($state, 'go');
    }));

    describe('emailPlaceholder', function () {
      it('should return the correct value', function () {
        $state.params.orderId = '123';
        expect(controller.emailPlaceholder()).toEqual('digitalRiver.enterEmailAddr.emailPlaceholder');
      });
    });

    describe('handleEnterEmailAddr', function () {
      it('should validate an empty email', function () {
        controller.handleEnterEmailAddr();
        expect(controller.error).toEqual('digitalRiver.enterEmailAddr.validation.emptyEmail');
      });

      it('should pass happy path', function () {
        controller.email = 'foo@bar.com';
        controller.handleEnterEmailAddr();
        expect(controller.error).not.toBeDefined();
        expect(DigitalRiverService.userExists).toHaveBeenCalled();
      });
    });

    describe('userExists', function () {
      beforeEach(function () {
        controller.email = 'foo@bar.com';
      });

      it('should error out on rejection', function (done) {
        DigitalRiverService.userExists.and.returnValue($q.reject());
        controller.handleEnterEmailAddr().then(function () {
          expect(controller.error).toBe('digitalRiver.validation.unexpectedError');
          done();
        });
        $rootScope.$apply();
      });

      it('should error out with no data', function (done) {
        DigitalRiverService.userExists.and.returnValue($q.when());
        controller.handleEnterEmailAddr().then(function () {
          expect(controller.error).toBe('digitalRiver.validation.unexpectedError');
          done();
        });
        $rootScope.$apply();
      });

      it('should error out with claimed domain', function (done) {
        DigitalRiverService.userExists.and.returnValue($q.when({
          domainClaimed: true
        }));
        controller.handleEnterEmailAddr().then(function () {
          expect(controller.error).toBe('digitalRiver.enterEmailAddr.domainClaimed');
          done();
        });
        $rootScope.$apply();
      });

      it('should redirect to createAccount when user does not exist', function (done) {
        DigitalRiverService.userExists.and.returnValue($q.when({
          userExists: false
        }));
        controller.handleEnterEmailAddr().then(function () {
          expect($state.go).toHaveBeenCalledWith('createAccount', jasmine.any(Object));
          done();
        });
        $rootScope.$apply();
      });

      it('should redirect to dr-login-forward on success with proper data', function (done) {
        DigitalRiverService.userExists.and.returnValue($q.when({
          userExists: true
        }));
        controller.handleEnterEmailAddr().then(function () {
          expect($state.go).toHaveBeenCalledWith('drLoginForward', jasmine.any(Object));
          done();
        });
        $rootScope.$apply();
      });
    });

  });
})();
