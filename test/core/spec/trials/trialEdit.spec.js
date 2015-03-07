'use strict';

describe('Controller: TrialEditCtrl', function () {
  var controller, $scope, $state, $q, $translate, Notification, TrialService;

  beforeEach(module('Core'));

  var stateParams = {
    currentTrial: {
      offers: [{
        id: 'COLLAB'
      }, {
        id: 'SQUAREDUC'
      }]
    }
  };

  beforeEach(inject(function ($rootScope, $controller, _$state_, _$q_, _$translate_, _Notification_, _TrialService_) {
    $scope = $rootScope.$new();
    $state = _$state_;
    $q = _$q_;
    $translate = _$translate_;
    Notification = _Notification_;
    TrialService = _TrialService_;

    spyOn(Notification, 'notify');
    $state.modal = jasmine.createSpyObj('modal', ['close']);

    controller = $controller('TrialEditCtrl', {
      $scope: $scope,
      $translate: $translate,
      $stateParams: stateParams,
      TrialService: TrialService,
      Notification: Notification
    });
    $scope.$apply();
  }));

  describe('TrialEditCtrl controller', function () {
    it('should be created successfully', function () {
      expect(controller).toBeDefined;
    });

    describe('getDaysLeft', function () {
      it('should return expired', function () {
        expect(controller.getDaysLeft(-1)).toEqual('customerPage.expired');
      });

      it('should return expires today', function () {
        expect(controller.getDaysLeft(0)).toEqual('customerPage.expiresToday');
      });

      it('should return days left', function () {
        expect(controller.getDaysLeft(1)).toEqual(1);
      });
    });

    describe('Edit a trial', function () {
      beforeEach(function () {
        spyOn(TrialService, "editTrial").and.returnValue($q.when(getJSONFixture('core/json/trials/trialEditResponse.json')));
        controller.editTrial();
        $scope.$apply();
      });

      it('should notify success', function () {
        expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
      });

      it('should close the modal', function () {
        expect($state.modal.close).toHaveBeenCalled();
      });
    });

    describe('Edit a trial with error', function () {
      beforeEach(function () {
        spyOn(TrialService, "editTrial").and.returnValue($q.reject({
          data: {
            message: 'An error occurred'
          }
        }));
        controller.editTrial();
        $scope.$apply();
      });

      it('should notify error', function () {
        expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
      });

      it('should not close the modal', function () {
        expect($state.modal.close).not.toHaveBeenCalled();
      });
    });

  });
});
