'use strict';

describe('Controller: PstnReviewCtrl', function () {
  var controller, $controller, $scope, $q, $state, $stateParams, PstnSetup, PstnSetupService, PstnServiceAddressService, ExternalNumberPool;

  var carrierList = getJSONFixture('huron/json/pstnSetup/carrierList.json');
  var customer = getJSONFixture('huron/json/pstnSetup/customer.json');
  var orderCart = getJSONFixture('huron/json/pstnSetup/orderCart.json');
  var swivelNumberTokens = getJSONFixture('huron/json/pstnSetup/swivelNumberTokens.json');

  beforeEach(module('Huron'));

  beforeEach(inject(function ($rootScope, _$controller_, _$q_, _$state_, _$stateParams_, _PstnSetup_, _PstnSetupService_, _PstnServiceAddressService_, _ExternalNumberPool_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $q = _$q_;
    $state = _$state_;
    $stateParams = _$stateParams_;
    PstnSetup = _PstnSetup_;
    PstnSetupService = _PstnSetupService_;
    PstnServiceAddressService = _PstnServiceAddressService_;
    ExternalNumberPool = _ExternalNumberPool_;

    PstnSetup.setCustomerId(customer.uuid);
    PstnSetup.setCustomerName(customer.name);
    PstnSetup.setProvider(carrierList[0]);
    PstnSetup.setCustomerExists(true);
    PstnSetup.setCarrierExists(true);
    PstnSetup.setSiteExists(true);
    PstnSetup.setOrders(orderCart);

    spyOn(PstnSetupService, 'createCustomer').and.returnValue($q.when());
    spyOn(PstnSetupService, 'updateCustomerCarrier').and.returnValue($q.when());
    spyOn(PstnSetupService, 'orderNumbers').and.returnValue($q.when());
    spyOn(PstnSetupService, 'portNumbers').and.returnValue($q.when());
    spyOn(PstnSetupService, 'orderBlock').and.returnValue($q.when());
    spyOn(PstnServiceAddressService, 'createCustomerSite').and.returnValue($q.when());
    spyOn(ExternalNumberPool, 'create').and.returnValue($q.when());
    spyOn($state, 'go');

    controller = $controller('PstnReviewCtrl', {
      $scope: $scope
    });

    $scope.$apply();
  }));

  describe('placeOrder', function () {
    describe('when customer exists', function () {
      it('should place orders and transition to nextSteps', function () {
        controller.placeOrder();

        expect($state.go).not.toHaveBeenCalledWith('pstnSetup.nextSteps');
        $scope.$apply();
        expect(PstnSetupService.createCustomer).not.toHaveBeenCalled();
        expect(PstnSetupService.updateCustomerCarrier).not.toHaveBeenCalled();
        expect(PstnServiceAddressService.createCustomerSite).not.toHaveBeenCalled();
        expect(PstnSetupService.orderNumbers).toHaveBeenCalled();
        expect($state.go).toHaveBeenCalledWith('pstnSetup.nextSteps');
      });

      it('should contain one of each order', function () {
        expect(controller.portOrders.length).toEqual(1);
        expect(controller.advancedOrders.length).toEqual(1);
        expect(controller.newOrders.length).toEqual(1);
      });

      it('should show the correct number of new and port numbers', function () {
        expect(controller.totalNewAdvancedOrder).toEqual(6);
        expect(controller.totalPortNumbers).toEqual(2);
      });
    });

    describe('when customer exists without a carrier', function () {
      beforeEach(function () {
        PstnSetup.setCarrierExists(false);

      });
      it('should update customer and then place orders and transition to nextSteps', function () {
        controller.placeOrder();

        expect($state.go).not.toHaveBeenCalledWith('pstnSetup.nextSteps');
        $scope.$apply();
        expect(PstnSetupService.createCustomer).not.toHaveBeenCalled();
        expect(PstnSetupService.updateCustomerCarrier).toHaveBeenCalled();
        expect(PstnServiceAddressService.createCustomerSite).not.toHaveBeenCalled();
        expect(PstnSetupService.orderNumbers).toHaveBeenCalled();
        expect($state.go).toHaveBeenCalledWith('pstnSetup.nextSteps');
      });
    });

    describe('when customer doesnt exist', function () {
      beforeEach(function () {
        PstnSetup.setCustomerExists(false);
        PstnSetup.setCarrierExists(false);
      });

      it('should create customer and then place orders and transition to nextSteps', function () {
        controller.placeOrder();

        expect($state.go).not.toHaveBeenCalledWith('pstnSetup.nextSteps');
        $scope.$apply();
        expect(PstnSetupService.createCustomer).toHaveBeenCalled();
        expect(PstnSetupService.updateCustomerCarrier).not.toHaveBeenCalled();
        expect(PstnServiceAddressService.createCustomerSite).not.toHaveBeenCalled();
        expect(PstnSetupService.orderNumbers).toHaveBeenCalled();
        expect($state.go).toHaveBeenCalledWith('pstnSetup.nextSteps');
      });
    });

    describe('when site doesn\'t exist', function () {
      beforeEach(function () {
        PstnSetup.setSiteExists(false);
      });

      it('should place orders and transition to nextSteps', function () {
        controller.placeOrder();

        expect($state.go).not.toHaveBeenCalledWith('pstnSetup.nextSteps');
        $scope.$apply();
        expect(PstnSetupService.createCustomer).not.toHaveBeenCalled();
        expect(PstnSetupService.updateCustomerCarrier).not.toHaveBeenCalled();
        expect(PstnServiceAddressService.createCustomerSite).toHaveBeenCalled();
        expect(PstnSetupService.orderNumbers).toHaveBeenCalled();
        expect($state.go).toHaveBeenCalledWith('pstnSetup.nextSteps');
      });
    });
  });
});
