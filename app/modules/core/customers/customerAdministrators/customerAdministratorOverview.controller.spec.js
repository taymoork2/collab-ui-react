'use strict';

describe('Controller: customerAdministratorOverviewCtrl', function () {
  beforeEach(module('Core'));
  var controller, $controller, $scope, $stateParams, $q, CustomerAdministratorService, Notification;

  beforeEach(inject(function (_$controller_, $rootScope, _$q_, _$stateParams_, _Authinfo_, _Notification_, _CustomerAdministratorService_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $stateParams = _$stateParams_;
    CustomerAdministratorService = _CustomerAdministratorService_;
    Notification = _Notification_;
    $q = _$q_;

    $stateParams.currentCustomer = {
      customerOrgId: '5555-6666',
    };

    spyOn(CustomerAdministratorService, 'getAssignedSalesAdministrators').and.returnValue($q.when({
      data: {
        totalResults: 2
      }
    }));
    spyOn(Notification, 'notify');
  }));

  function initController() {
    controller = $controller('CustomerAdministratorOverviewCtrl', {
      $scope: $scope,
      $stateParams: $stateParams
    });
    $scope.$apply();
  }

  describe('controller', function () {
    beforeEach(initController);

    it('should be defined', function () {
      expect(controller).toBeDefined();
    });
  });

  describe('test that getAdminCount function and get admin count: ', function () {
    beforeEach(initController);

    it('should check if getAdminCount and returns totalResults', function () {
      expect(controller.count).toEqual(2);
    });
  });
});
