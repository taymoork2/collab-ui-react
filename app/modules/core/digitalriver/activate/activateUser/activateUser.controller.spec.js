(function () {
  'use strict';

  describe('Controller: ActivateUserController', function () {
    var controller, DigitalRiverService;

    beforeEach(module('Core'));

    beforeEach(inject(function (_$controller_, _$location_, _$state_, _$log_, _DigitalRiverService_, $q) {
      DigitalRiverService = _DigitalRiverService_;
      spyOn(DigitalRiverService, "activateUser").and.returnValue($q.when());
      controller = _$controller_('ActivateUserController', {
        $location: _$location_,
        $state: _$state_,
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
