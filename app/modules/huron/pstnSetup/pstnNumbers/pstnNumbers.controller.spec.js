'use strict';

describe('Controller: PstnNumbersCtrl', function () {
  var controller, $controller, $scope, $state, $q, PstnSetupService, PstnSetup, Notification, FeatureToggleService;

  var customer = getJSONFixture('huron/json/pstnSetup/customer.json');
  var customerCarrierList = getJSONFixture('huron/json/pstnSetup/customerCarrierList.json');
  var orderCart = getJSONFixture('huron/json/pstnSetup/orderCart.json');

  var singleOrder = '+12145551000';
  var consecutiveOrder = ['+12145551000', '+12145551001'];
  var nonconsecutiveOrder = ['+12145551000', '+12145551100'];
  var portOrder = angular.copy(consecutiveOrder);
  portOrder.type = 'port';

  beforeEach(module('Huron'));

  beforeEach(inject(function ($rootScope, _$controller_, _$state_, _$q_, _PstnSetupService_, _PstnSetup_, _Notification_, _FeatureToggleService_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $state = _$state_;
    $q = _$q_;
    PstnSetupService = _PstnSetupService_;
    PstnSetup = _PstnSetup_;
    Notification = _Notification_;
    FeatureToggleService = _FeatureToggleService_;

    PstnSetup.setCustomerId(customer.uuid);
    PstnSetup.setCustomerName(customer.name);
    PstnSetup.setProvider(customerCarrierList[0]);

    spyOn(PstnSetupService, 'releaseCarrierInventory').and.returnValue($.when());
    spyOn(Notification, 'error');
    spyOn($state, 'go');
    spyOn(FeatureToggleService, 'supports').and.returnValue($q.when(true));

    controller = $controller('PstnNumbersCtrl', {
      $scope: $scope
    });

    $scope.$apply();
  }));

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
