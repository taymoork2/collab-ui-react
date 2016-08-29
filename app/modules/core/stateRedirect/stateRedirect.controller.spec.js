(function () {
  'use strict';

  describe('Controller: StateRedirectCtrl', function () {
    var controller, $controller, $scope, Auth, PreviousState;

    beforeEach(angular.mock.module('core.stateredirect'));
    beforeEach(angular.mock.module('ngSanitize'));

    beforeEach(inject(function ($rootScope, _$controller_, _Auth_, _PreviousState_) {
      $scope = $rootScope.$new();
      $controller = _$controller_;
      Auth = _Auth_;
      PreviousState = _PreviousState_;

      spyOn(Auth, 'logout');
      spyOn(PreviousState, 'isValid');
      spyOn(PreviousState, 'go');
    }));

    describe('Has a valid previous state', function () {
      beforeEach(function () {
        PreviousState.isValid.and.returnValue(true);
        controller = $controller('StateRedirectCtrl', {
          $scope: $scope
        });
      });

      it('should have a previous state', function () {
        expect(controller.hasPreviousState).toEqual(true);
      });

      it('should not be loading on init', function () {
        expect(controller.loading).toEqual(false);
      });

      it('should go to previous state on performRedirect()', function () {
        controller.performRedirect();
        $scope.$apply();

        expect(PreviousState.go).toHaveBeenCalled();
      });

      it('should logout on logout()', function () {
        controller.logout();
        $scope.$apply();

        expect(Auth.logout).toHaveBeenCalled();
        expect(controller.loading).toEqual(true);
      });
    });

    describe('Has an invalid previous state', function () {
      beforeEach(function () {
        PreviousState.isValid.and.returnValue(false);
        controller = $controller('StateRedirectCtrl', {
          $scope: $scope
        });
      });

      it('should not have a previous state', function () {
        expect(controller.hasPreviousState).toEqual(false);
      });

      it('should not be loading on init', function () {
        expect(controller.loading).toEqual(false);
      });

      it('should logout on performRedirect()', function () {
        controller.performRedirect();
        $scope.$apply();

        expect(Auth.logout).toHaveBeenCalled();
        expect(controller.loading).toEqual(true);
      });

      it('should logout on logout()', function () {
        controller.logout();
        $scope.$apply();

        expect(Auth.logout).toHaveBeenCalled();
        expect(controller.loading).toEqual(true);
      });
    });
  });
})();
