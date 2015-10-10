'use strict';

describe('Controller: PstnSetupCtrl', function () {
  var controller, $controller, $scope, $q, $window, $state, $stateParams, PstnSetupService, ExternalNumberPool, Notification;

  var carrierList = getJSONFixture('huron/json/pstnSetup/carrierList.json');
  var customer = getJSONFixture('huron/json/pstnSetup/customer.json');
  var customerCarrierList = getJSONFixture('huron/json/pstnSetup/customerCarrierList.json');
  var customerOrderList = getJSONFixture('huron/json/pstnSetup/customerOrderList.json');
  var customerOrder = getJSONFixture('huron/json/pstnSetup/customerOrder.json');

  var blockOrders = [{
    areaCode: '512',
    quantity: '5'
  }, {
    areaCode: '623',
    quantity: '10'
  }];

  var swivelNumberTokens = [{
    "value": "+12223334444",
    "label": "1 (222) 333-4444"
  }, {
    "value": "+15556667777",
    "label": "1 (555) 666-7777"
  }];

  beforeEach(module('Huron'));

  beforeEach(inject(function ($rootScope, _$controller_, _$q_, _$window_, _$state_, _$stateParams_, _PstnSetupService_, _ExternalNumberPool_, _Notification_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $q = _$q_;
    $window = _$window_;
    $state = _$state_;
    $stateParams = _$stateParams_;
    PstnSetupService = _PstnSetupService_;
    ExternalNumberPool = _ExternalNumberPool_;
    Notification = _Notification_;

    $stateParams.customerId = customer.uuid;
    $stateParams.customerName = customer.name;

    spyOn(PstnSetupService, 'listCustomerCarriers').and.returnValue($q.when(customerCarrierList));
    spyOn(PstnSetupService, 'listCarriers').and.returnValue($q.when(carrierList));
    spyOn(PstnSetupService, 'createCustomer').and.returnValue($q.when());
    spyOn(PstnSetupService, 'updateCustomerCarrier').and.returnValue($q.when());
    spyOn(PstnSetupService, 'orderBlock').and.returnValue($q.when());
    spyOn(ExternalNumberPool, 'create').and.returnValue($q.when());
    spyOn(Notification, 'errorResponse');
    spyOn(Notification, 'error');
    spyOn($state, 'go');
    spyOn($state, 'href');
    spyOn($window, 'open');

    controller = $controller('PstnSetupCtrl', {
      $scope: $scope
    });

    $scope.$apply();
  }));

  describe('init', function () {
    it('should be initialized with customers carrier Intelepeer', function () {
      expect(controller.providers).toEqual([jasmine.objectContaining({
        name: PstnSetupService.INTELEPEER
      })]);
    });

    it('should be initialized with default carriers if customer doesnt exist', function () {
      PstnSetupService.listCustomerCarriers.and.returnValue($q.reject({
        status: 404
      }));
      controller = $controller('PstnSetupCtrl', {
        $scope: $scope
      });
      $scope.$apply();
      expect(controller.providers).toEqual([jasmine.objectContaining({
        name: PstnSetupService.INTELEPEER
      }), jasmine.objectContaining({
        name: PstnSetupService.TATA
      })]);
    });

    it('should notify an error if customer carriers fail to load', function () {
      PstnSetupService.listCustomerCarriers.and.returnValue($q.reject());
      controller = $controller('PstnSetupCtrl', {
        $scope: $scope
      });
      $scope.$apply();
      expect(controller.providers).toEqual([]);
      expect(Notification.errorResponse).toHaveBeenCalled();
    });

    it('should notify an error if customer doesnt exist and carriers fail to load', function () {
      PstnSetupService.listCustomerCarriers.and.returnValue($q.reject({
        status: 404
      }));
      PstnSetupService.listCarriers.and.returnValue($q.reject());
      controller = $controller('PstnSetupCtrl', {
        $scope: $scope
      });
      $scope.$apply();
      expect(controller.providers).toEqual([]);
      expect(Notification.errorResponse).toHaveBeenCalled();
    });
  });

  describe('orderNumbers', function () {
    it('should default to no block orders', function () {
      expect(controller.blockOrders).toEqual([]);
      expect(controller.blockOrderTotals).toEqual(0);
    });

    it('should notify error on Next button action', function () {
      controller.orderNumbers();
      expect(Notification.error).toHaveBeenCalledWith('pstnSetup.orderNumbersPrompt');
    });

    it('should update with new numbers', function () {
      controller.blockOrders = blockOrders;
      $scope.$apply();
      expect(controller.blockOrderTotals).toEqual(15);
      controller.orderNumbers();
      expect($state.go).toHaveBeenCalledWith('pstnSetup.review');
    });
  });

  describe('placeOrder', function () {
    describe('when customer exists', function () {
      it('should place orders and transition to nextSteps', function () {
        controller.selectProvider(controller.providers[0]);
        controller.blockOrders = blockOrders;
        controller.placeOrder();

        expect($state.go).not.toHaveBeenCalledWith('pstnSetup.nextSteps');
        $scope.$apply();
        expect(PstnSetupService.createCustomer).not.toHaveBeenCalled();
        expect(PstnSetupService.updateCustomerCarrier).not.toHaveBeenCalled();
        expect(PstnSetupService.orderBlock).toHaveBeenCalled();
        expect($state.go).toHaveBeenCalledWith('pstnSetup.nextSteps');
      });
    });

    describe('when customer exists without a carrier', function () {
      beforeEach(function () {
        PstnSetupService.listCustomerCarriers.and.returnValue($q.when([]));
        controller = $controller('PstnSetupCtrl', {
          $scope: $scope
        });
        $scope.$apply();
      });
      it('should update customer and then place orders and transition to nextSteps', function () {
        controller.selectProvider(controller.providers[0]);
        controller.blockOrders = blockOrders;
        controller.placeOrder();

        expect($state.go).not.toHaveBeenCalledWith('pstnSetup.nextSteps');
        $scope.$apply();
        expect(PstnSetupService.createCustomer).not.toHaveBeenCalled();
        expect(PstnSetupService.updateCustomerCarrier).toHaveBeenCalled();
        expect(PstnSetupService.orderBlock).toHaveBeenCalled();
        expect($state.go).toHaveBeenCalledWith('pstnSetup.nextSteps');
      });

      it('should create numbers directly when using a swivel carrier', function () {
        controller.selectProvider(controller.providers[1]);
        controller.swivelTokens = swivelNumberTokens;
        controller.placeOrder();
        $scope.$apply();

        expect(ExternalNumberPool.create).toHaveBeenCalled();
        expect(ExternalNumberPool.create.calls.count()).toEqual(2);
        expect($state.go).toHaveBeenCalledWith('pstnSetup.nextSteps');
      });
    });

    describe('when customer doesnt exist', function () {
      beforeEach(function () {
        PstnSetupService.listCustomerCarriers.and.returnValue($q.reject({
          status: 404
        }));
        controller = $controller('PstnSetupCtrl', {
          $scope: $scope
        });
        $scope.$apply();
      });

      it('should create customer and then place orders and transition to nextSteps', function () {
        controller.selectProvider(controller.providers[0]);
        controller.blockOrders = blockOrders;
        controller.placeOrder();

        expect($state.go).not.toHaveBeenCalledWith('pstnSetup.nextSteps');
        $scope.$apply();
        expect(PstnSetupService.createCustomer).toHaveBeenCalled();
        expect(PstnSetupService.updateCustomerCarrier).not.toHaveBeenCalled();
        expect(PstnSetupService.orderBlock).toHaveBeenCalled();
        expect($state.go).toHaveBeenCalledWith('pstnSetup.nextSteps');
      });
    });
  });

  describe('nextSteps', function () {
    beforeEach(function () {
      controller.launchCustomerPortal();
    });
    it('should create proper url', function () {
      expect($state.href).toHaveBeenCalledWith('login_swap', {
        customerOrgId: controller.customerId,
        customerOrgName: controller.customerName
      });
    });

    it('should call $window.open', function () {
      expect($window.open).toHaveBeenCalled();
    });
  });

});
