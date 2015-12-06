'use strict';

describe('Controller: PstnProvidersCtrl', function () {
  var controller, $controller, $scope, $q, $state, PstnSetup, PstnSetupService, Notification;

  var carrierList = getJSONFixture('huron/json/pstnSetup/carrierList.json');
  var customer = getJSONFixture('huron/json/pstnSetup/customer.json');
  var customerCarrierList = getJSONFixture('huron/json/pstnSetup/customerCarrierList.json');
  var resellerCarrierList = getJSONFixture('huron/json/pstnSetup/resellerCarrierList.json');

  beforeEach(module('Huron'));

  beforeEach(inject(function ($rootScope, _$controller_, _$q_, _$state_, _PstnSetup_, _PstnSetupService_, _Notification_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $q = _$q_;
    $state = _$state_;
    PstnSetup = _PstnSetup_;
    PstnSetupService = _PstnSetupService_;
    Notification = _Notification_;

    PstnSetup.setCustomerId(customer.uuid);
    PstnSetup.setCustomerName(customer.name);

    spyOn(PstnSetupService, 'listCustomerCarriers').and.returnValue($q.when(customerCarrierList));
    spyOn(PstnSetupService, 'listResellerCarriers').and.returnValue($q.when(resellerCarrierList));
    spyOn(PstnSetupService, 'listDefaultCarriers').and.returnValue($q.when(carrierList));
    spyOn(PstnSetup, 'setSingleCarrierReseller');
    spyOn(Notification, 'errorResponse');
    spyOn($state, 'go');
  }));

  describe('init', function () {
    it('should be initialized with customers carrier Intelepeer and transition to numbers state', function () {
      controller = $controller('PstnProvidersCtrl', {
        $scope: $scope
      });
      $scope.$apply();
      expect(controller.providers).toEqual([jasmine.objectContaining({
        name: PstnSetupService.INTELEPEER,
        apiExists: true,
        vendor: PstnSetupService.INTELEPEER
      })]);
      expect($state.go).toHaveBeenCalledWith('pstnSetup.orderNumbers');
    });

    it('should be initialized with default carriers if customer doesnt exist', function () {
      PstnSetupService.listCustomerCarriers.and.returnValue($q.reject({
        status: 404
      }));
      PstnSetupService.listResellerCarriers.and.returnValue([]);
      controller = $controller('PstnProvidersCtrl', {
        $scope: $scope
      });
      $scope.$apply();
      expect(controller.providers).toEqual([jasmine.objectContaining({
        name: PstnSetupService.INTELEPEER,
        apiExists: true,
        vendor: PstnSetupService.INTELEPEER
      }), jasmine.objectContaining({
        name: PstnSetupService.TATA,
        apiExists: false,
        vendor: PstnSetupService.TATA
      })]);
      expect($state.go).not.toHaveBeenCalled();
    });

    it('should be initalized with single reseller carrier and skip provider selection', function () {
      PstnSetupService.listCustomerCarriers.and.returnValue($q.reject({
        status: 404
      }));
      PstnSetupService.listResellerCarriers.and.returnValue(resellerCarrierList);
      controller = $controller('PstnProvidersCtrl', {
        $scope: $scope
      });
      $scope.$apply();
      expect(controller.providers).toEqual([jasmine.objectContaining({
        name: PstnSetupService.INTELEPEER,
        apiExists: true,
        vendor: PstnSetupService.INTELEPEER
      })]);
      expect(PstnSetup.setSingleCarrierReseller).toHaveBeenCalledWith(true);
      expect($state.go).toHaveBeenCalledWith('pstnSetup.orderNumbers');
    });

    it('should notify an error if customer carriers fail to load', function () {
      PstnSetupService.listCustomerCarriers.and.returnValue($q.reject({}));
      PstnSetupService.listResellerCarriers.and.returnValue([]);
      PstnSetupService.listDefaultCarriers.and.returnValue([]);
      controller = $controller('PstnProvidersCtrl', {
        $scope: $scope
      });
      $scope.$apply();
      expect(controller.providers).toEqual([]);
      expect(Notification.errorResponse).toHaveBeenCalled();
    });

    it('should notify an error if customer doesnt exist and reseller carriers fail to load', function () {
      PstnSetupService.listCustomerCarriers.and.returnValue($q.reject({
        status: 404
      }));
      PstnSetupService.listResellerCarriers.and.returnValue($q.reject());
      controller = $controller('PstnProvidersCtrl', {
        $scope: $scope
      });
      $scope.$apply();
      expect(controller.providers).toEqual([]);
      expect(Notification.errorResponse).toHaveBeenCalled();
    });
  });

});
