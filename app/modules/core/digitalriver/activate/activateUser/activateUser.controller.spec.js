(function () {
  'use strict';

  describe('Controller: activateUserController', function () {
    var controller, DigitalRiverService;

    beforeEach(module('Core'));

    beforeEach(inject(function (_$controller_, _$location_, _$window_, _$log_, _DigitalRiverService_, $q) {
      DigitalRiverService = _DigitalRiverService_;
      spyOn(DigitalRiverService, "activateUser").and.returnValue($q.when());
      controller = _$controller_('activateUserController', {
        $location: _$location_,
        $window: _$window_,
        $log: _$log_,
        DigitalRiverService: DigitalRiverService
      });
    }));

    describe('default calls', function () {

      it('should call activateUser', function () {
        expect(DigitalRiverService.activateUser).toHaveBeenCalled();
      });

    });

  });
})();
