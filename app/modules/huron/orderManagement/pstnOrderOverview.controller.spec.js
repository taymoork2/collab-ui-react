'use strict';

describe('Controller: PstnOrderOverviewCtrl', function () {
  var controller, $controller, $q, $scope, $stateParams, PstnSetupService;

  var orders = getJSONFixture('huron/json/orderManagement/orderManagement.json');
  var acceptedOrder = getJSONFixture('huron/json/orderManagement/acceptedOrders.json');

  beforeEach(module('Huron'));

  beforeEach(inject(function ($rootScope, _$controller_, _$q_, _$stateParams_, _PstnSetupService_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $q = _$q_;
    $stateParams = _$stateParams_;
    PstnSetupService = _PstnSetupService_;

    $stateParams.currentCustomer = {
      customerOrgId: '5555-6666'
    };

    spyOn(PstnSetupService, 'getAllOrders').and.returnValue($q.when(orders));

    controller = $controller('PstnOrderOverviewCtrl', {
      $scope: $scope,
      $stateParams: $stateParams,
      PstnSetupService: PstnSetupService
    });

    $scope.$apply();
  }));

  it('should initialize the controller', function () {
    expect(controller).toBeDefined();
  });

  it('should get the orders and filter them', function () {
    expect(controller.orders).toEqual(acceptedOrder);
  });
});
