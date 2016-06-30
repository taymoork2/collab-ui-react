'use strict';

describe('Controller: customerAdministratorDetailCtrl', function () {
  beforeEach(module('Core'));
  var controller, $controller, $scope, $q, $stateParams, CustomerAdministratorService, Notification, ModalService, Analytics;
  var modalDefer, testUsers = [];

  beforeEach(inject(function (_$controller_, $rootScope, _$q_, _$stateParams_, _Notification_, _CustomerAdministratorService_, _ModalService_, _Analytics_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $stateParams = _$stateParams_;
    CustomerAdministratorService = _CustomerAdministratorService_;
    Notification = _Notification_;
    ModalService = _ModalService_;
    Analytics = _Analytics_;
    $q = _$q_;

    $stateParams.currentCustomer = {
      customerOrgId: '5555-6666',
    };

    modalDefer = $q.defer();
    testUsers = [{
      fullName: 'Frank Sinatra',
      uuid: 'd3434d78-26452-445a2-845d8-4c1816565b3f0a'
    }];
    spyOn(CustomerAdministratorService, 'removeCustomerSalesAdmin').and.returnValue($q.when({}));
    spyOn(CustomerAdministratorService, 'addCustomerAdmin').and.returnValue($q.when({
      userName: 'frank.sinatra+sinatrahelpdesk@gmail.com',
      emails: [{
        primary: true,
        type: 'work',
        value: 'frank.sinatra+sinatrahelpdesk@gmail.com'
      }],
      name: {
        givenName: 'Frank',
        familyName: 'Sinatra'
      },
      displayName: 'Frank Sinatra',
      id: 'd3434d78-26452-445a2-845d8-4c1816565b3f0a',
      avatarSyncEnabled: false
    }));
    spyOn(CustomerAdministratorService, 'getPartnerUsers').and.returnValue($q.when({}));
    spyOn(CustomerAdministratorService, 'patchSalesAdminRole').and.returnValue($q.when({}));
    spyOn(CustomerAdministratorService, 'getAssignedSalesAdministrators').and.returnValue($q.when({
      data: {
        Resources: [{
          name: {
            givenName: 'Jane',
            familyName: 'Doe'
          },
          id: '1',
          avatarSyncEnabled: false
        }, {
          name: {
            givenName: 'John',
            familyName: 'Doe'
          },
          id: '2',
          avatarSyncEnabled: true
        }]
      }
    }));
    spyOn(ModalService, 'open').and.returnValue({
      result: modalDefer.promise
    });
    spyOn(Analytics, 'trackEvent').and.returnValue($q.when({}));
    spyOn(Notification, 'error');
    spyOn(Notification, 'success');
  }));

  function initController() {
    controller = $controller('CustomerAdministratorDetailCtrl', {
      $scope: $scope,
      $stateParams: $stateParams
    });
    $scope.$apply();
  }

  describe('getAssignedSalesAdministrators', function () {
    beforeEach(initController);

    it('must push administrator into View-Model administrators array', function () {
      expect(controller.administrators[0].uuid).toEqual('1');
      expect(controller.administrators[0].fullName).toEqual('Jane Doe');
      expect(controller.administrators[0].avatarSyncEnabled).toEqual(false);
      expect(controller.administrators[1].uuid).toEqual('2');
      expect(controller.administrators[1].fullName).toEqual('John Doe');
      expect(controller.administrators[1].avatarSyncEnabled).toEqual(true);
    });
  });

  describe('removeCustomerSalesAdmin', function () {
    beforeEach(initController);

    it('must splice administrator from View-Model administrators array', function () {
      controller.removeSalesAdmin('1', 'Jane Doe');
      modalDefer.resolve();
      $scope.$apply();

      expect(controller.administrators[0].uuid).toEqual('2');
      expect(controller.administrators[0].fullName).toEqual('John Doe');
      expect(controller.administrators[0].avatarSyncEnabled).toEqual(true);
    });
  });

  describe('removeCustomerSalesAdmin', function () {
    beforeEach(initController);

    it('must not delete on Modal dismiss', function () {
      controller.removeSalesAdmin('1', 'Jane Doe');
      modalDefer.reject();
      $scope.$apply();

      expect(controller.administrators.length).toEqual(2);
    });
  });

  describe('addAdmin', function () {
    beforeEach(initController);

    it('must push administrator into View-Model administrators array', function () {
      controller.users = testUsers;
      controller.administrators = [];
      controller.addAdmin('Frank Sinatra').then(function () {
        expect(controller.administrators[0].uuid).toEqual('d3434d78-26452-445a2-845d8-4c1816565b3f0a');
        expect(controller.administrators[0].fullName).toEqual('Frank Sinatra');
        expect(controller.administrators[0].avatarSyncEnabled).toEqual(false);
        expect(CustomerAdministratorService.patchSalesAdminRole()).toHaveBeenCalled();
        expect(Analytics.trackEvent()).toHaveBeenCalled();
      });
    });
  });

  describe('addAdmin call failed', function () {
    beforeEach(function () {
      CustomerAdministratorService.addCustomerAdmin = jasmine.createSpy('CustomerAdministratorService').and.returnValue($q.reject());
      initController();
    });

    it('must throw Notification.error', function () {
      controller.users = testUsers;
      controller.administrators = [];
      controller.addAdmin('Frank Sinatra').catch(function () {
        expect(Notification.error()).toHaveBeenCalled();
      });
    });
  });
});
