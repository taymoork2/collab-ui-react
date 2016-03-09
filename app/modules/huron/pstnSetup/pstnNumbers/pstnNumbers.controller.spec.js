'use strict';

describe('Controller: PstnNumbersCtrl', function () {
  var controller, $compile, $controller, $scope, $state, $q, $translate, PstnSetupService, PstnSetup, Notification, FeatureToggleService, TerminusStateService;

  var customer = getJSONFixture('huron/json/pstnSetup/customer.json');
  var customerCarrierList = getJSONFixture('huron/json/pstnSetup/customerCarrierList.json');
  var orderCart = getJSONFixture('huron/json/pstnSetup/orderCart.json');

  var singleOrder = '+12145551000';
  var consecutiveOrder = ['+12145551000', '+12145551001'];
  var nonconsecutiveOrder = ['+12145551000', '+12145551100'];
  var portOrder = angular.copy(consecutiveOrder);
  portOrder.type = 'port';

  var states = [{
    name: 'Texas',
    abbreviation: 'TX'
  }];

  var areaCodes = [{
    code: '123',
    count: 15
  }, {
    code: '456',
    count: 30
  }];

  beforeEach(module('Huron'));

  beforeEach(inject(function ($rootScope, _$compile_, _$controller_, _$state_, _$q_, _$translate_, _PstnSetupService_, _PstnSetup_, _Notification_, _FeatureToggleService_, _TerminusStateService_) {
    $scope = $rootScope.$new();
    $compile = _$compile_;
    $controller = _$controller_;
    $state = _$state_;
    $q = _$q_;
    $translate = _$translate_;
    PstnSetupService = _PstnSetupService_;
    PstnSetup = _PstnSetup_;
    Notification = _Notification_;
    FeatureToggleService = _FeatureToggleService_;
    TerminusStateService = _TerminusStateService_;

    PstnSetup.setCustomerId(customer.uuid);
    PstnSetup.setCustomerName(customer.name);
    PstnSetup.setProvider(customerCarrierList[0]);

    spyOn(PstnSetupService, 'releaseCarrierInventory').and.returnValue($q.when());
    spyOn(Notification, 'error');
    spyOn($state, 'go');
    spyOn(FeatureToggleService, 'supports').and.returnValue($q.when(true));
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
      expect(controller.areaCodeOptions).toBeUndefined();
    });

    it('should have 1 quantity', function () {
      expect(controller.model.quantity).toEqual(1);
    });
  });

  describe('State helpText', function () {
    var stateTemplateOptions;
    beforeEach(function () {
      stateTemplateOptions = getFieldTemplateOptions('state');
    });

    it('should not have initial helpText', function () {
      expect(stateTemplateOptions.helpText).toBeUndefined();
    });

    it('should not set helpText if state model is not set', function () {
      controller.areaCodeOptions = areaCodes;
      $scope.$apply();

      expect(stateTemplateOptions.helpText).toBeUndefined();
    });

    it('should sum the area code counts when areaCodeOptions changes', function () {
      controller.model.state = {}; // dummy selection
      controller.areaCodeOptions = areaCodes;
      $scope.$apply();

      expect(stateTemplateOptions.helpText).toEqual('pstnSetup.numbers');
      expect($translate.instant).toHaveBeenCalledWith('pstnSetup.numbers', {
        count: 45
      }, 'messageformat');
    });
  });

  describe('Area Code helpText', function () {
    var areaCodeTemplateOptions;
    beforeEach(function () {
      areaCodeTemplateOptions = getFieldTemplateOptions('areaCode');
    });

    it('should not have initial helpText', function () {
      expect(areaCodeTemplateOptions.helpText).toBeUndefined();
    });

    it('should not have initial options', function () {
      expect(areaCodeTemplateOptions.options).toEqual([]);
    });

    it('should update field options with areaCodeOptions', function () {
      controller.areaCodeOptions = areaCodes;
      $scope.$apply();

      expect(areaCodeTemplateOptions.options).toEqual(areaCodes);
    });

    it('should not set helpText if area code model is not set', function () {
      controller.model.areaCode = undefined;
      $scope.$apply();

      expect(areaCodeTemplateOptions.helpText).toBeUndefined();
    });

    it('should set the count of selected area code', function () {
      controller.model.areaCode = areaCodes[0];
      $scope.$apply();

      expect(areaCodeTemplateOptions.helpText).toEqual('pstnSetup.numbers');
      expect($translate.instant).toHaveBeenCalledWith('pstnSetup.numbers', {
        count: 15
      }, 'messageformat');
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
      expect(controller.orderNumbersTotal).toEqual(5);
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
  });

  describe('removeOrder', function () {
    beforeEach(function () {
      controller.orderCart = [singleOrder, consecutiveOrder, nonconsecutiveOrder, portOrder];
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
  });

});
