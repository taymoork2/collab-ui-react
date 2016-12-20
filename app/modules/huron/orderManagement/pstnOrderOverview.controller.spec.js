'use strict';

describe('Controller: PstnOrderOverviewCtrl', function () {
  var controller, $controller, $q, $scope, $stateParams, PstnSetupService;

  beforeEach(angular.mock.module('Huron'));

  beforeEach(inject(function ($rootScope, _$controller_, _$q_, _$stateParams_, _PstnSetupService_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $q = _$q_;
    $stateParams = _$stateParams_;
    PstnSetupService = _PstnSetupService_;

    $stateParams.currentCustomer = {
      customerOrgId: '5555-6666'
    };

    var response = [
      { uuid: 'eb8b5381-d908-4f28-9f23-bcd61d0792b6',
        carrierOrderId: '12345',
        carrierBatchId: '11',
        status: 'PENDING',
        numbers: [{ number: '9728134000', network: 'QUEUED' }]
      },
      { uuid: 'eb8b5381-d908-4f28-9f23-bcd61d0792b7',
        carrierOrderId: '12345',
        carrierBatchId: '12',
        status: 'PROVISIONED',
        numbers: [{ number: '9728134001', network: 'PROVISIONED' }]
      },
      { uuid: 'eb8b5381-d908-4f28-9f23-bcd61d0792b8',
        carrierOrderId: '12346',
        carrierBatchId: '11',
        status: 'PENDING',
        numbers: [{ number: '9728134002', network: 'QUEUED' }]
      }
    ];

    spyOn(PstnSetupService, 'getFormattedNumberOrders').and.returnValue($q.when(response));

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
    expect(PstnSetupService.getFormattedNumberOrders).toHaveBeenCalled();
  });

  it('should have the correct number of combined orders', function () {
    expect(controller.ordersWithDuplicates.length).toEqual(3);
    expect(controller.orders.length).toEqual(2);
  });

  it('should have the correct count of combined numbers', function () {
    expect(controller.orders[0].numbers.length).toEqual(2);
    expect(controller.orders).toContain({
      uuid: 'eb8b5381-d908-4f28-9f23-bcd61d0792b6',
      carrierOrderId: '12345',
      carrierBatchId: '11',
      status: 'PENDING',
      numbers: [{ number: '9728134000', network: 'QUEUED' }, { number: '9728134001', network: 'PROVISIONED' }]
    }, {
      uuid: 'eb8b5381-d908-4f28-9f23-bcd61d0792b8',
      carrierOrderId: '12346',
      carrierBatchId: '11',
      status: 'PENDING',
      numbers: [{ number: '9728134002', network: 'QUEUED' }]
    });
  });

  it('should have the correct status of the combined order', function () {
    expect(controller.orders[0].status).toEqual('PENDING');
  });

});
