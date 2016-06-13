'use strict';

describe('Controller: customerAdministratorDetailCtrl', function () {
  beforeEach(module('Core'));
  var controller, $controller, $scope, $q, $stateParams, CustomerAdministratorService, Notification, ModalService;
  var modalDefer;

  beforeEach(inject(function (_$controller_, $rootScope, _$q_, _$stateParams_, _$state_, _Authinfo_, _Notification_, _CustomerAdministratorService_, _ModalService_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $stateParams = _$stateParams_;
    CustomerAdministratorService = _CustomerAdministratorService_;
    Notification = _Notification_;
    ModalService = _ModalService_;
    $q = _$q_;

    $stateParams.currentCustomer = {
      customerOrgId: '5555-6666',
    };

    modalDefer = $q.defer();
    spyOn(CustomerAdministratorService, 'unassignCustomerSalesAdmin').and.returnValue($q.when({}));
    spyOn(CustomerAdministratorService, 'addCustomerAdmin').and.returnValue($q.when({}));
    spyOn(CustomerAdministratorService, 'getPartnerUsers').and.returnValue($q.when({}));
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

  describe('unassignCustomerSalesAdmin', function () {
    beforeEach(initController);

    it('must splice administrator from View-Model administrators array', function () {
      controller.unassignSalesAdmin('1', 'Jane Doe');
      modalDefer.resolve();
      $scope.$apply();

      expect(controller.administrators[0].uuid).toEqual('2');
      expect(controller.administrators[0].fullName).toEqual('John Doe');
      expect(controller.administrators[0].avatarSyncEnabled).toEqual(true);
    });
  });

  describe('unassignCustomerSalesAdmin', function () {
    beforeEach(initController);

    it('must not delete on Modal dismiss', function () {
      controller.unassignSalesAdmin('1', 'Jane Doe');
      modalDefer.reject();
      $scope.$apply();

      expect(controller.administrators.length).toEqual(2);
    });
  });
});
