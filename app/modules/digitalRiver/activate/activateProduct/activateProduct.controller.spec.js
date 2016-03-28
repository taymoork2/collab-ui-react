(function () {
  'use strict';

  describe('Controller: ActivateProductController', function () {
    var controller, DigitalRiverService, $location, $log, $q, $state, $scope;
    var TEST_ORG_ID_FOR_DR = '0b17b44a-4fea-48d4-9660-3da55df5d782';

    beforeEach(module('DigitalRiver'));
    beforeEach(inject(function (_$controller_, _$location_, _$state_, _DigitalRiverService_, _$log_, _$q_, _$rootScope_) {
      DigitalRiverService = _DigitalRiverService_;
      $state = _$state_;
      $scope = _$rootScope_.$new();
      $location = _$location_;
      $log = _$log_;
      $q = _$q_;

      spyOn($state, 'go');
    }));

    describe('primary behaviors:', function () {
      describe('product activation successful navigation:', function () {
        beforeEach(inject(function (_$controller_) {
          spyOn($location, 'search').and.returnValue({
            oid: TEST_ORG_ID_FOR_DR
          });
          spyOn(DigitalRiverService, 'activateProduct').and.returnValue($q.when());
          controller = _$controller_('ActivateProductController', {
            $location: $location,
            $state: $state,
            DigitalRiverService: DigitalRiverService
          });
          $scope.$apply();
        }));

        it('should call activateProduct', function () {
          expect(DigitalRiverService.activateProduct).toHaveBeenCalledWith(TEST_ORG_ID_FOR_DR);
          expect($state.go).toHaveBeenCalledWith('activateProduct.successPage');
        });
      });

      describe('failed navigation to product activation:', function () {
        beforeEach(inject(function (_$controller_) {
          spyOn(DigitalRiverService, 'activateProduct').and.returnValue($q.reject('fake-error-msg'));
          spyOn($log, 'error');
          controller = _$controller_('ActivateProductController', {
            $state: $state,
            $log: $log,
            DigitalRiverService: DigitalRiverService
          });
          $scope.$apply();
        }));

        it('should call activateProduct', function () {
          expect(DigitalRiverService.activateProduct).toHaveBeenCalled();
          expect($log.error).toHaveBeenCalledWith('fake-error-msg');
          expect($state.go).toHaveBeenCalledWith('activateProduct.errorPage');
        });
      });
    });
  });
})();
