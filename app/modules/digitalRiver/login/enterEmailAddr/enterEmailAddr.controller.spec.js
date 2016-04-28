(function () {
  'use strict';

  describe('Controller: enterEmailAddrController', function () {
    var controller, DigitalRiverService, $window, $controller, $rootScope, $q;

    beforeEach(module('DigitalRiver'));

    beforeEach(inject(function (_$rootScope_, _$controller_, _DigitalRiverService_, _$q_) {
      $rootScope = _$rootScope_;
      DigitalRiverService = _DigitalRiverService_;
      $controller = _$controller_;
      $window = {
        location: {
          href: ''
        }
      };
      $q = _$q_;
      spyOn(DigitalRiverService, 'getUserFromEmail').and.returnValue($q.when());
    }));

    function initController() {
      controller = $controller('enterEmailAddrController', {
        $window: $window
      });
      controller.drReferrer = DigitalRiverService.getDrReferrer();
      controller.error = undefined;
      $rootScope.$apply();
    }

    xdescribe('emailPlaceholder', function () {
      beforeEach(initController);

      it('should return the correct value', function () {
        expect(controller.emailPlaceholder()).toEqual('digitalRiver.enterEmailAddr.emailPlaceholder');
      });
    });

    xdescribe('handleEnterEmailAddr', function () {
      beforeEach(initController);
      it('should validate an empty email', function () {
        controller.handleEnterEmailAddr();
        expect(controller.error).toEqual('digitalRiver.enterEmailAddr.validation.emptyEmail');
      });

      it('should pass happy path', function () {
        controller.email = 'foo@bar.com';
        controller.handleEnterEmailAddr();
        expect(controller.error).not.toBeDefined();
        expect(DigitalRiverService.getUserFromEmail).toHaveBeenCalled();
      });
    });

    xdescribe('getUserFromEmail', function () {
      beforeEach(function () {
        initController();
        controller.email = 'foo@bar.com';
      });

      it('should error out on rejection', function (done) {
        DigitalRiverService.getUserFromEmail.and.returnValue($q.reject());
        controller.handleEnterEmailAddr().then(function () {
          expect(controller.error).toBe('digitalRiver.validation.unexpectedError');
          done();
        });
        $rootScope.$apply();
      });

      it('should error out on success with no data', function (done) {
        DigitalRiverService.getUserFromEmail.and.returnValue($q.when());
        controller.handleEnterEmailAddr().then(function () {
          expect(controller.error).toBe('digitalRiver.validation.unexpectedError');
          done();
        });
        $rootScope.$apply();
      });

      //TODO Note: a tech debt US has been created to refactor these tests
      it('should redirect to create-account on success with improper data', function (done) {
        DigitalRiverService.getUserFromEmail.and.returnValue($q.when({
          data: {
            success: true
          }
        }));
        controller.handleEnterEmailAddr().then(function () {
          expect($window.location.href).toContain('create-account');
          done();
        });
        $rootScope.$apply();
      });

      it('should redirect to dr-login-forward on success with proper data', function (done) {
        DigitalRiverService.getUserFromEmail.and.returnValue($q.when({
          data: {
            data: {
              exists: true
            },
            success: true
          }
        }));
        controller.handleEnterEmailAddr().then(function () {
          expect($window.location.href).toContain('/#/dr-login-forward');
          done();
        });
        $rootScope.$apply();
      });
    });

  });
})();
