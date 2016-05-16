'use strict';

describe('Controller: PstnNumbersCtrl', function () {
  var controller, $compile, $controller, $scope, $state, $q, $translate, PstnSetupService, PstnSetup, Notification, TerminusStateService;

  var customer = getJSONFixture('huron/json/pstnSetup/customer.json');
  var customerCarrierList = getJSONFixture('huron/json/pstnSetup/customerCarrierList.json');
  var orderCart = getJSONFixture('huron/json/pstnSetup/orderCart.json');

  var singleOrder = {
    "data": {
      "numbers": "+12145551000"
    },
    "type": "newOrders"
  };
  var consecutiveOrder = {
    "data": {
      "numbers": [
        "+12145551000",
        "+12145551001"
      ]
    },
    "type": "newOrders"
  };
  var nonconsecutiveOrder = {
    "data": {
      "numbers": [
        "+12145551234",
        "+12145551678"
      ]
    },
    "type": "newOrders"
  };
  var portOrder = {
    "data": {
      "numbers": [
        "+12145557001",
        "+12145557002"
      ]
    },
    "type": "portOrders"
  };
  var advancedOrder = {
    data: {
      areaCode: 321,
      length: 2,
      consecutive: false
    },
    type: "advancedOrders"
  };

  var states = [{
    name: 'Texas',
    abbreviation: 'TX'
  }];

  var response = {
    areaCodes: [{
      code: '123',
      count: 15
    }, {
      code: '456',
      count: 30
    }]
  };

  var serviceAddress = {
    address1: '123 example st',
    address2: '',
    city: 'Sample',
    state: 'TX',
    zip: '77777'
  };

  beforeEach(module('Huron'));

  beforeEach(inject(function ($rootScope, _$compile_, _$controller_, _$state_, _$q_, _$translate_, _PstnSetupService_, _PstnSetup_, _Notification_, _TerminusStateService_) {
    $scope = $rootScope.$new();
    $compile = _$compile_;
    $controller = _$controller_;
    $state = _$state_;
    $q = _$q_;
    $translate = _$translate_;
    PstnSetupService = _PstnSetupService_;
    PstnSetup = _PstnSetup_;
    Notification = _Notification_;
    TerminusStateService = _TerminusStateService_;

    PstnSetup.setCustomerId(customer.uuid);
    PstnSetup.setCustomerName(customer.name);
    PstnSetup.setProvider(customerCarrierList[0]);

    spyOn(PstnSetupService, 'releaseCarrierInventory').and.returnValue($q.when());
    spyOn(PstnSetupService, 'getCarrierInventory').and.returnValue($q.when(response));
    spyOn(PstnSetup, 'getServiceAddress').and.returnValue(serviceAddress);
    spyOn(Notification, 'error');
    spyOn($state, 'go');
    spyOn(TerminusStateService, 'query').and.returnValue({
      '$promise': $q.when(states)
    });
    spyOn($translate, 'instant').and.callThrough();

    controller = compileTemplate();
  }));

  function compileTemplate() {
    var template = '<div><div ng-controller="PstnNumbersCtrl as pstnNumbers" ng-include="\'modules/huron/pstnSetup/pstnNumbers/pstnNumbers.tpl.html\'"></div></div>';
    var el = $compile(template)($scope);
    $scope.$apply();
    $translate.instant.calls.reset();
    return _.get(el.scope(), '$$childTail.pstnNumbers');
  }

  function getFieldTemplateOptions(key) {
    return _.chain(controller.fields)
      .get('[0].templateOptions.fields')
      .find({
        key: key
      })
      .get('templateOptions')
      .value();
  }

  describe('initial/default data', function () {
    it('should not have an areaCodeOptions array', function () {
      expect(controller.areaCodeOptions).toBeDefined();
    });

    it('should have 1 quantity', function () {
      expect(controller.model.quantity).toEqual(1);
    });

    it('should have state set through pstnSetupService on first time', function () {
      expect(controller.model.state).toEqual(states[0]);
    });
  });

  describe('orderNumbers', function () {
    it('should default to no orders', function () {
      expect(controller.orderCart).toEqual([]);
      expect(controller.orderNumbersTotal).toEqual(0);
    });

    it('should notify error on Next button action', function () {
      controller.goToReview();
      expect(Notification.error).toHaveBeenCalledWith('pstnSetup.orderNumbersPrompt');
    });

    it('should update with new numbers', function () {
      controller.orderCart = orderCart;
      $scope.$apply();
      expect(controller.orderNumbersTotal).toEqual(3);
      controller.goToReview();
      expect($state.go).toHaveBeenCalledWith('pstnSetup.review');
    });
  });

  describe('showOrderQuantity', function () {
    it('should not show quantity for single order', function () {
      expect(controller.showOrderQuantity(singleOrder)).toBeFalsy();
    });

    it('should not show quantity if is a consecutive order', function () {
      expect(controller.showOrderQuantity(consecutiveOrder)).toBeFalsy();
    });

    it('should show quantity if is nonconsecutive order', function () {
      expect(controller.showOrderQuantity(nonconsecutiveOrder)).toBeTruthy();
    });

    it('should show quantity if is a port order', function () {
      expect(controller.showOrderQuantity(portOrder)).toBeTruthy();
    });

    it('should show quantity if is an advanced order', function () {
      expect(controller.showOrderQuantity(advancedOrder)).toBeTruthy();
    });
  });

  describe('formatTelephoneNumber', function () {
    it('should format a single order', function () {
      expect(controller.formatTelephoneNumber(singleOrder)).toEqual('(214) 555-1000');
    });

    it('should format a consecutive order', function () {
      expect(controller.formatTelephoneNumber(consecutiveOrder)).toEqual('(214) 555-1000 - 1001');
    });

    it('should format a nonconsecutive order', function () {
      expect(controller.formatTelephoneNumber(nonconsecutiveOrder)).toEqual('(214) 555-1XXX');
    });

    it('should format a port order', function () {
      expect(controller.formatTelephoneNumber(portOrder)).toEqual('pstnSetup.portNumbersLabel');
    });

    it('should format an advanced order', function () {
      expect(controller.formatTelephoneNumber(advancedOrder)).toEqual('(' + advancedOrder.data.areaCode + ') XXX-XXXX');
    });
  });

  describe('removeOrder', function () {
    beforeEach(function () {
      controller.orderCart = [singleOrder, consecutiveOrder, nonconsecutiveOrder, portOrder, advancedOrder];
    });

    it('should remove a single order', function () {
      controller.removeOrder(singleOrder);
      $scope.$apply();

      expect(controller.orderCart).not.toContain(singleOrder);
    });

    it('should remove a consecutive order', function () {
      controller.removeOrder(consecutiveOrder);
      $scope.$apply();

      expect(controller.orderCart).not.toContain(consecutiveOrder);
    });

    it('should remove a nonconsecutive order', function () {
      controller.removeOrder(nonconsecutiveOrder);
      $scope.$apply();

      expect(controller.orderCart).not.toContain(nonconsecutiveOrder);
    });

    it('should remove a port order', function () {
      controller.removeOrder(portOrder);
      $scope.$apply();

      expect(controller.orderCart).not.toContain(portOrder);
    });

    it('should remove an advanced order', function () {
      controller.removeOrder(advancedOrder);
      $scope.$apply();

      expect(controller.orderCart).not.toContain(advancedOrder);
    });
  });

  describe('add orders', function () {
    it('should add an advanced order', function () {
      controller.model.areaCode = {
        code: advancedOrder.data.areaCode
      };
      controller.model.quantity = advancedOrder.data.length;
      controller.model.consecutive = advancedOrder.data.consecutive;
      controller.addToCart(PstnSetupService.ADVANCED_ORDERS);
      expect(controller.orderCart).toContain({
        data: {
          areaCode: advancedOrder.data.areaCode,
          length: advancedOrder.data.length,
          consecutive: advancedOrder.data.consecutive
        },
        type: PstnSetupService.ADVANCED_ORDERS
      });
    });
  });

});
