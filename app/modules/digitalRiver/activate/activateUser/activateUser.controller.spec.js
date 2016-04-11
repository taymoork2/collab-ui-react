(function () {
  'use strict';

  describe('Controller: ActivateUserController', function () {
    var controller, DigitalRiverService, $location, $log, $q, $state, $scope;
    var TEST_UUID_FOR_DR = '0b17b44a-4fea-48d4-9660-3da55df5d782';

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
      describe('user activation successful navigation:', function () {
        beforeEach(inject(function (_$controller_) {
          spyOn($location, 'search').and.returnValue({
            uuid: TEST_UUID_FOR_DR
          });
          spyOn(DigitalRiverService, 'activateUser').and.returnValue($q.when());
          controller = _$controller_('ActivateUserController', {
            $location: $location,
            $state: $state,
            DigitalRiverService: DigitalRiverService
          });
          $scope.$apply();
        }));

        it('should call activateUser', function () {
          expect(DigitalRiverService.activateUser).toHaveBeenCalledWith(TEST_UUID_FOR_DR);
          expect($state.go).toHaveBeenCalledWith('activateUser.successPage');
        });
      });

      describe('failed navigation to user activation:', function () {
        beforeEach(inject(function (_$controller_) {
          spyOn(DigitalRiverService, 'activateUser').and.returnValue($q.reject('fake-error-msg'));
          spyOn($log, 'error');
          controller = _$controller_('ActivateUserController', {
            $state: $state,
            $log: $log,
            DigitalRiverService: DigitalRiverService
          });
          $scope.$apply();
        }));

        it('should call activateUser', function () {
          expect(DigitalRiverService.activateUser).toHaveBeenCalled();
          expect($log.error).toHaveBeenCalledWith('fake-error-msg');
          expect($state.go).toHaveBeenCalledWith('activateUser.errorPage');
        });
      });
    });
  });
})();
