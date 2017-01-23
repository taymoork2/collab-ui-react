'use strict';

describe('Controller: PstnReviewCtrl', function () {
  var controller, $controller, $scope, $q, $state, PstnSetup, PstnSetupService, PstnServiceAddressService, ExternalNumberPool;

  var carrierList = getJSONFixture('huron/json/pstnSetup/carrierList.json');
  var customer = getJSONFixture('huron/json/pstnSetup/customer.json');
  var orderCart = getJSONFixture('huron/json/pstnSetup/orderCart.json');

  beforeEach(angular.mock.module('Huron'));

  beforeEach(inject(function ($rootScope, _$controller_, _$q_, _$state_, _PstnSetup_, _PstnSetupService_, _PstnServiceAddressService_, _ExternalNumberPool_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $q = _$q_;
    $state = _$state_;
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

    spyOn(PstnSetupService, 'createCustomerV2').and.returnValue($q.resolve());
    spyOn(PstnSetupService, 'updateCustomerCarrier').and.returnValue($q.resolve());
    spyOn(PstnSetupService, 'orderNumbersV2').and.returnValue($q.resolve());
    spyOn(PstnSetupService, 'orderTollFreeBlock').and.returnValue($q.resolve());
    spyOn(PstnSetupService, 'portNumbers').and.returnValue($q.resolve());
    spyOn(PstnSetupService, 'orderBlock').and.returnValue($q.resolve());
    spyOn(PstnServiceAddressService, 'createCustomerSite').and.returnValue($q.resolve());
    spyOn(ExternalNumberPool, 'create').and.returnValue($q.resolve());
    spyOn($state, 'go');

    controller = $controller('PstnReviewCtrl', {
      $scope: $scope
    });

    $scope.$apply();
  }));

  afterEach(function () {
    controller = undefined;
    $controller = undefined;
    $scope = undefined;
    $q = undefined;
    $state = undefined;
    PstnSetup = undefined;
    PstnSetupService = undefined;
    PstnServiceAddressService = undefined;
    ExternalNumberPool = undefined;
  });

  afterAll(function () {
    carrierList = undefined;
    customer = undefined;
    orderCart = undefined;
  });


  describe('placeOrder', function () {
    describe('when customer exists', function () {
      it('should place orders and transition to nextSteps', function () {
        controller.placeOrder();

        expect($state.go).not.toHaveBeenCalledWith('pstnSetup.nextSteps');
        $scope.$apply();
        expect(PstnSetupService.createCustomerV2).not.toHaveBeenCalled();
        expect(PstnSetupService.updateCustomerCarrier).not.toHaveBeenCalled();
        expect(PstnServiceAddressService.createCustomerSite).not.toHaveBeenCalled();
        expect(PstnSetupService.orderNumbersV2).toHaveBeenCalled();
        expect($state.go).toHaveBeenCalledWith('pstnSetup.nextSteps', {
          portOrders: [orderCart[1]]
        });
      });

      it('should contain at least one of each order type', function () {
        expect(controller.portOrders.length).toEqual(1);
        expect(controller.advancedOrders.length).toEqual(3);
        expect(controller.newOrders.length).toEqual(1);
        expect(controller.newTollFreeOrders.length).toEqual(1);
      });

      it('should show the correct number of new and port numbers', function () {
        expect(controller.totalNewAdvancedOrder).toEqual(19);
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
        expect(PstnSetupService.createCustomerV2).not.toHaveBeenCalled();
        expect(PstnSetupService.updateCustomerCarrier).toHaveBeenCalled();
        expect(PstnServiceAddressService.createCustomerSite).not.toHaveBeenCalled();
        expect(PstnSetupService.orderNumbersV2).toHaveBeenCalled();
        expect($state.go).toHaveBeenCalledWith('pstnSetup.nextSteps', {
          portOrders: [orderCart[1]]
        });
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
        expect(PstnSetupService.createCustomerV2).toHaveBeenCalled();
        expect(PstnSetupService.updateCustomerCarrier).not.toHaveBeenCalled();
        expect(PstnServiceAddressService.createCustomerSite).not.toHaveBeenCalled();
        expect(PstnSetupService.orderNumbersV2).toHaveBeenCalled();
        expect($state.go).toHaveBeenCalledWith('pstnSetup.nextSteps', {
          portOrders: [orderCart[1]]
        });
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
        expect(PstnSetupService.createCustomerV2).not.toHaveBeenCalled();
        expect(PstnSetupService.updateCustomerCarrier).not.toHaveBeenCalled();
        expect(PstnServiceAddressService.createCustomerSite).toHaveBeenCalled();
        expect(PstnSetupService.orderNumbersV2).toHaveBeenCalled();
        expect($state.go).toHaveBeenCalledWith('pstnSetup.nextSteps', {
          portOrders: [orderCart[1]]
        });
      });
    });
  });
});
