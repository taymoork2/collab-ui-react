(function () {
  'use strict';

  describe('Controller: ActivateProductController', function () {
    var controller, DigitalRiverService, $state, $scope;

    beforeEach(module('Core'));

    beforeEach(inject(function (_$controller_, _$location_, _$state_, _$log_, _DigitalRiverService_, $q, _$rootScope_) {
      DigitalRiverService = _DigitalRiverService_;
      $state = _$state_;
      $scope = _$rootScope_.$new();
      spyOn($state, 'go');
      spyOn(DigitalRiverService, "activateProduct").and.returnValue($q.when());
      controller = _$controller_('ActivateProductController', {
        $location: _$location_,
        $state: $state,
        $log: _$log_,
        DigitalRiverService: DigitalRiverService
      });
    }));

    describe('default calls', function () {

      it('should call activateProduct', function () {
        expect(DigitalRiverService.activateProduct).toHaveBeenCalled();
        $scope.$apply();
        expect($state.go).toHaveBeenCalledWith('activateProduct.successPage');
      });

    });

  });
})();
