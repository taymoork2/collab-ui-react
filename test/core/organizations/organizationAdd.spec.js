'use strict';

describe('Controller: OrganizationAddCtrl', function () {
  var controller, $scope, $q, $translate, $state, Notification, Orgservice, HuronCustomer, EmailService, AccountService;

  beforeEach(module('Huron'));
  beforeEach(module('Core'));

  beforeEach(inject(function ($rootScope, $controller, _$q_, _$translate_, _$state_, _Notification_, _Orgservice_, _HuronCustomer_, _EmailService_, _AccountService_) {
    $scope = $rootScope.$new();
    $q = _$q_;
    $translate = _$translate_;
    $state = _$state_;
    Notification = _Notification_;
    Orgservice = _Orgservice_;
    HuronCustomer = _HuronCustomer_;
    EmailService = _EmailService_;
    AccountService = _AccountService_;

    spyOn(Notification, 'notify');
    spyOn(Notification, 'errorResponse');
    $state.modal = jasmine.createSpyObj('modal', ['close']);
    spyOn($state, 'go');
    spyOn(EmailService, 'emailNotifyOrganizationCustomer').and.returnValue($q.when());

    controller = $controller('OrganizationAddCtrl', {
      $scope: $scope,
      $translate: $translate,
      $state: $state,
      Orgservice: Orgservice,
      HuronCustomer: HuronCustomer,
      Notification: Notification,
      EmailService: _EmailService_,
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

      it('should send an email', function () {
        expect(EmailService.emailNotifyOrganizationCustomer).toHaveBeenCalled();
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

      it('should close the modal', function () {
        expect($state.modal.close).toHaveBeenCalled();
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
        spyOn(HuronCustomer, 'create').and.returnValue($q.when());
        controller.startOrganization();
        $scope.$apply();
        expect(Notification.notify).toHaveBeenCalledWith(jasmine.any(Array), 'success');
        expect(Notification.notify.calls.count()).toEqual(1);
        expect(EmailService.emailNotifyOrganizationCustomer).not.toHaveBeenCalled();
      });

      it('error should notify error', function () {
        spyOn(HuronCustomer, 'create').and.returnValue($q.reject());
        controller.startOrganization();
        $scope.$apply();
        expect(Notification.errorResponse).toHaveBeenCalled();
        expect(Notification.errorResponse.calls.count()).toEqual(1);
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

    it('should not have closed the modal', function () {
      expect($state.modal.close).not.toHaveBeenCalled();
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
