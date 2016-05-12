'use strict';

describe('Controller: PstnOrderDetailCtrl', function () {
  var controller, $controller, $scope, $state, $stateParams, $translate;

  beforeEach(module('Huron'));

  beforeEach(inject(function ($rootScope, _$controller_, _$stateParams_, _$translate_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $stateParams = _$stateParams_;
    $translate = _$translate_;

    $stateParams.currentOrder = {
      carrierOrderId: '631208',
      created: '3/13/2016',
      operation: 'BLOCK_ORDER',
      response: '{"631208":[{"countryCode":"1","e164":"+14697862340","number":"4697862340","tempCountryCode":null,"tempE164":null,"tempNumber":null,"network":"PROVISIONED","e911":null,"e911Address":null,"batchID":629790,"orderID":631208},{"countryCode":"1","e164":"+14697862371","number":"4697862371","tempCountryCode":null,"tempE164":null,"tempNumber":null,"network":"PROVISIONED","e911":null,"e911Address":null,"batchID":629790,"orderID":631208}]}',
      status: 'Successful',
      type: 'Advance Numbers'
    };

    spyOn($translate, 'instant');

    controller = $controller('PstnOrderDetailCtrl', {
      $scope: $scope,
      $stateParams: $stateParams,
      $translate: $translate
    });

    $scope.$apply();
  }));

  it('should initialize the controller', function () {
    expect(controller).toBeDefined();
  });

  it('should properly format the IP response', function () {
    expect(controller.info).toContain({
      number: '+14697862340',
      label: '(469) 786-2340'
    }, {
      number: '+14697862371',
      label: '(469) 786-2371'
    });
  });

  it('reset controller with pending order and process', function () {
    $translate.instant.and.returnValue('There are 2 numbers pending for this order');
    $stateParams.currentOrder = {
      carrierOrderId: '631209',
      created: '3/13/2016',
      operation: 'BLOCK_ORDER',
      response: '{"631209":[{"countryCode":"1","e164":null,"number":null,"tempCountryCode":null,"tempE164":null,"tempNumber":null,"network":"PENDING","e911":null,"e911Address":null,"batchID":629790,"orderID":631209},{"countryCode":"1","e164":null,"number":null,"tempCountryCode":null,"tempE164":null,"tempNumber":null,"network":"PENDING","e911":null,"e911Address":null,"batchID":629790,"orderID":631209}]}',
      status: 'Successful',
      type: 'Advance Numbers'
    };
    controller = $controller('PstnOrderDetailCtrl', {
      $scope: $scope,
      $stateParams: $stateParams,
      $translate: $translate
    });
    $scope.$apply();
    expect(controller.info).toContain({
      label: 'There are 2 numbers pending for this order'
    });
  });

  it('reset controller with new order and process', function () {
    $stateParams.currentOrder = {
      carrierOrderId: '631210',
      created: '3/13/2016',
      operation: 'NUMBER_ORDER',
      response: '{"631210":[{"countryCode":"1","e164":"+14697862340","number":"4697862340","tempCountryCode":null,"tempE164":null,"tempNumber":null,"network":"PROVISIONED","e911":null,"e911Address":null,"batchID":629790,"orderID":631208},{"countryCode":"1","e164":"+14697862371","number":"4697862371","tempCountryCode":null,"tempE164":null,"tempNumber":null,"network":"PROVISIONED","e911":null,"e911Address":null,"batchID":629790,"orderID":631208}]}',
      status: 'Successful',
      type: 'New Numbers'
    };
    controller = $controller('PstnOrderDetailCtrl', {
      $scope: $scope,
      $stateParams: $stateParams
    });
    $scope.$apply();
    expect(controller.info).toContain({
      number: '+14697862340',
      label: '(469) 786-2340'
    }, {
      number: '+14697862371',
      label: '(469) 786-2371'
    });
  });
});
