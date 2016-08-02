'use strict';

describe('Controller: OrganizationAddCtrl', function () {
  var controller, $scope, $q, $translate, $state, Notification, AccountService;

  beforeEach(angular.mock.module('Huron'));
  beforeEach(angular.mock.module('Core'));

  beforeEach(inject(function ($rootScope, $controller, _$q_, _$translate_, _$state_, _Notification_, _AccountService_) {
    $scope = $rootScope.$new();
    $q = _$q_;
    $translate = _$translate_;
    $state = _$state_;
    Notification = _Notification_;
    AccountService = _AccountService_;

    spyOn(Notification, 'notify');
    $state.modal = jasmine.createSpyObj('modal', ['close']);
    spyOn($state, 'go');

    controller = $controller('OrganizationAddCtrl', {
      $scope: $scope,
      $translate: $translate,
      $state: $state,
      Notification: Notification,
      AccountService: _AccountService_
    });
    $scope.$apply();
  }));

  it('should be created successfully', function () {
    expect(controller).toBeDefined();
  });

  it('should have empty offers', function () {
    expect(controller.isOffersEmpty()).toBeTruthy();
  });

  describe('Start a new organization', function () {
    beforeEach(function () {
      spyOn(AccountService, "createAccount").and.returnValue($q.when(getJSONFixture('core/json/organizations/organizationAddResponse.json')));
    });

    describe('With optional flag', function () {
      beforeEach(function () {
        controller.startOrganization(true);
        $scope.$apply();
      });

      it('should notify success', function () {
        expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
      });

      it('should not have closed the modal', function () {
        expect($state.modal.close).not.toHaveBeenCalled();
      });
    });

    describe('Without optional flag', function () {
      beforeEach(function () {
        controller.startOrganization();
        $scope.$apply();
      });

      it('should notify success', function () {
        expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
      });
    });

    describe('With Squared UC', function () {
      beforeEach(function () {
        controller.offers = {
          COLLAB: true,
          SQUAREDUC: true
        };
      });

      it('should not have empty offers', function () {
        expect(controller.isOffersEmpty()).toBeFalsy();
      });

      it('should have Squared UC offer', function () {
        expect(controller.isSquaredUCEnabled()).toBeTruthy();
      });

      it('should notify success', function () {
        controller.startOrganization();
        $scope.$apply();
        expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
        expect(Notification.notify.calls.count()).toEqual(1);
      });

      it('error should notify error', function () {
        controller.startOrganization();
        $scope.$apply();
      });
    });
  });

  describe('Start a new organization with error', function () {
    var startOrganizationSpy;
    beforeEach(function () {
      startOrganizationSpy = spyOn(AccountService, "createAccount").and.returnValue($q.reject({
        data: {
          message: 'An error occurred'
        }
      }));
      controller.startOrganization();
      $scope.$apply();
    });

    it('should notify error', function () {
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
    });

    it('should show a name error', function () {
      startOrganizationSpy.and.returnValue($q.reject({
        data: {
          message: 'Org'
        }
      }));
      controller.startOrganization();
      $scope.$apply();
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
    });

    it('should show an email error', function () {
      startOrganizationSpy.and.returnValue($q.reject({
        data: {
          message: 'Admin User'
        }
      }));
      controller.startOrganization();
      $scope.$apply();
      expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'error');
    });
  });
});
