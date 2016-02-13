(function () {
  'use strict';

  describe('Controller: enterEmailAddrController', function () {
    var controller, $controller, $location, $window, $translate, DigitalRiverService;

    beforeEach(module('Core'));

    beforeEach(inject(function (_$controller_, _$location_, _$window_, _$translate_, _DigitalRiverService_, $q) {
      $controller = _$controller_;
      $location = _$location_;
      $window = _$window_;
      $translate = _$translate_;
      DigitalRiverService = _DigitalRiverService_;
      controller = $controller('enterEmailAddrController', {
        $location: $location,
        $window: $window,
        $translate: $translate,
        DigitalRiverService: DigitalRiverService
      });
      controller.email = '';
      controller.error = '';
      spyOn(DigitalRiverService, "getUserFromEmail").and.callFake(function () {
        return $q.defer().promise;
      });
    }));

    describe('emailPlaceholder', function () {
      it('should return the correct value', function () {
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
        expect(controller.error).toEqual('');
        expect(DigitalRiverService.getUserFromEmail).toHaveBeenCalled();
      });

    });

  });
})();
