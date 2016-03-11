(function () {
  'use strict';

  describe('Controller: ActivateUserController', function () {
    var controller, DigitalRiverService, $state, $scope;

    beforeEach(module('DigitalRiver'));

    beforeEach(inject(function (_$controller_, _$location_, _$state_, _$log_, _DigitalRiverService_, $q, _$rootScope_) {
      DigitalRiverService = _DigitalRiverService_;
      $state = _$state_;
      $scope = _$rootScope_.$new();
      spyOn($state, 'go');
      spyOn(DigitalRiverService, "activateUser").and.returnValue($q.when());
      controller = _$controller_('ActivateUserController', {
        $location: _$location_,
        $state: $state,
        $log: _$log_,
        DigitalRiverService: DigitalRiverService
      });
    }));

    describe('default calls', function () {

      it('should call activateUser', function () {
        expect(DigitalRiverService.activateUser).toHaveBeenCalled();
        $scope.$apply();
        expect($state.go).toHaveBeenCalledWith('activateUser.successPage');
      });

    });

  });
})();
