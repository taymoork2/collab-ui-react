'use strict';

describe('Controller: PstnNumbersCtrl', function () {
  var controller, $controller, $scope, $state, PstnSetup, Notification;

  var customer = getJSONFixture('huron/json/pstnSetup/customer.json');
  var customerCarrierList = getJSONFixture('huron/json/pstnSetup/customerCarrierList.json');
  var orderCart = getJSONFixture('huron/json/pstnSetup/orderCart.json');

  beforeEach(module('Huron'));

  beforeEach(inject(function ($rootScope, _$controller_, _$state_, _PstnSetup_, _Notification_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $state = _$state_;
    PstnSetup = _PstnSetup_;
    Notification = _Notification_;

    PstnSetup.setCustomerId(customer.uuid);
    PstnSetup.setCustomerName(customer.name);
    PstnSetup.setProvider(customerCarrierList[0]);

    spyOn(Notification, 'error');
    spyOn($state, 'go');

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

});
