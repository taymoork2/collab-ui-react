'use strict';

describe('Controller: PstnOrderDetailCtrl', function () {
  var controller, $q, $controller, $scope, $stateParams, $translate, fulfilledBlockOrder, pendingBlockOrder, fulfilledNumberOrder, FeatureToggleService;

  beforeEach(angular.mock.module('Huron'));

  beforeEach(inject(function (_$q_, $rootScope, _$controller_, _$stateParams_, _$translate_, _FeatureToggleService_) {
    $q = _$q_;
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $stateParams = _$stateParams_;
    $translate = _$translate_;
    FeatureToggleService = _FeatureToggleService_;

    spyOn(FeatureToggleService, 'supports').and.callFake(function (param) {
      if (param === FeatureToggleService.features.huronSimplifiedTrialFlow) {
        return $q.when(false);
      }
    });

    fulfilledBlockOrder = {
      carrierOrderId: '631208',
      created: '3/13/2016',
      operation: 'BLOCK_ORDER',
      numbers: [{ number: '+14697862340', network: 'PROVISIONED', status: 'Successful', tooltip: 'Completed Successfully' }, { number: '+14697862371', network: 'PROVISIONED', status: 'Successful', tooltip: 'Completed Successfully' }],
      status: 'Successful',
      type: 'Advance Numbers',
      tooltip: 'Completed Successfully'
    };

    pendingBlockOrder = {
      carrierOrderId: '631209',
      created: '3/13/2016',
      operation: 'BLOCK_ORDER',
      numbers: [{ network: 'PENDING', status: 'In Progress', tooltip: 'Still Pending Queue' }, { network: 'PENDING', status: 'In Progress', tooltip: 'Still Pending Queue' }],
      areaCode: '469',
      quantity: '2',
      status: 'In Progress',
      type: 'Advance Numbers',
      tooltip: 'Still Pending Queue'
    };

    fulfilledNumberOrder = {
      carrierOrderId: '631210',
      created: '3/13/2016',
      operation: 'NUMBER_ORDER',
      numbers: [{ number: '+14697862340', network: 'PROVISIONED', status: 'Successful', tooltip: 'Completed Successfully' }, { number: '+14697862371', network: 'PROVISIONED', status: 'Successful', tooltip: 'Completed Successfully' }],
      status: 'Successful',
      type: 'New Numbers',
      tooltip: 'Completed Successfully'
    };

    spyOn($translate, 'instant');

    $scope.$apply();
  }));

  function initController(order) {
    $stateParams.currentOrder = order;
    controller = $controller('PstnOrderDetailCtrl', {
      $scope: $scope,
      $stateParams: $stateParams,
      $translate: $translate
    });
    $scope.$apply();
  }

  it('should initialize the controller', function () {
    initController(fulfilledBlockOrder);
    expect(controller).toBeDefined();
  });

  it('should properly format the IP response', function () {
    initController(fulfilledBlockOrder);
    expect(controller.info).toContain({
      number: '+14697862340',
      label: '(469) 786-2340',
      status: 'Successful',
      tooltip: 'Completed Successfully'
    }, {
      number: '+14697862371',
      label: '(469) 786-2371',
      status: 'Successful',
      tooltip: 'Completed Successfully'
    });
  });

  it('reset controller with pending order and process', function () {
    $translate.instant.and.returnValue('Quantity');
    initController(pendingBlockOrder);
    expect(controller.info).toContain({
      label: '(469) XXX-XXXX Quantity: 2',
      status: 'In Progress',
      tooltip: 'Still Pending Queue'
    });
  });

  it('reset controller with new order and process', function () {
    initController(fulfilledNumberOrder);
    expect(controller.info).toContain({
      number: '+14697862340',
      label: '(469) 786-2340',
      status: 'Successful',
      tooltip: 'Completed Successfully'
    }, {
      number: '+14697862371',
      label: '(469) 786-2371',
      status: 'Successful',
      tooltip: 'Completed Successfully'
    });
  });
});
