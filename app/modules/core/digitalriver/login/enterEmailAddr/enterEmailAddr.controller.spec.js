(function () {
  'use strict';

  describe('Controller: enterEmailAddrController', function () {
    var controller, DigitalRiverService;

    beforeEach(module('Core'));

    beforeEach(inject(function (_$controller_, _$location_, _$window_, _$translate_, _DigitalRiverService_, $q) {
      DigitalRiverService = _DigitalRiverService_;
      controller = _$controller_('enterEmailAddrController', {
        $location: _$location_,
        $window: _$window_,
        $translate: _$translate_,
        DigitalRiverService: DigitalRiverService
      });
      controller.email = '';
      controller.error = '';
      spyOn(DigitalRiverService, "getUserFromEmail").and.returnValue($q.when());
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
