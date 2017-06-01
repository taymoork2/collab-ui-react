'use strict';

describe('Controller: PstnProvidersCtrl', function () {
  var controller, $controller, $scope, $q, $state, PstnModel, PstnService, PstnServiceAddressService, Notification, FeatureToggleService;

  var carrierList = getJSONFixture('huron/json/pstnSetup/carrierList.json');
  var customer = getJSONFixture('huron/json/pstnSetup/customer.json');
  var customerCarrierList = getJSONFixture('huron/json/pstnSetup/customerCarrierList.json');
  var swivelCustomerCarrierList = getJSONFixture('huron/json/pstnSetup/swivelCustomerCarrierList.json');
  var resellerCarrierList = getJSONFixture('huron/json/pstnSetup/resellerCarrierList.json');
  var customerSiteList = getJSONFixture('huron/json/pstnSetup/customerSiteList.json');
  var INTELEPEER = require('modules/huron/pstn').INTELEPEER;
  var TATA = require('modules/huron/pstn').TATA;
  beforeEach(angular.mock.module('Huron'));

  beforeEach(inject(function ($rootScope, _$controller_, _$q_, _$state_, _PstnModel_, _PstnService_, _PstnServiceAddressService_, _Notification_, _FeatureToggleService_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $q = _$q_;
    $state = _$state_;
    PstnModel = _PstnModel_;
    PstnService = _PstnService_;
    PstnServiceAddressService = _PstnServiceAddressService_;
    Notification = _Notification_;
    FeatureToggleService = _FeatureToggleService_;

    PstnModel.setCustomerId(customer.uuid);
    PstnModel.setCustomerName(customer.name);

    spyOn(PstnService, 'getCustomer').and.returnValue($q.resolve());
    spyOn(PstnService, 'listCustomerCarriers').and.returnValue($q.resolve(customerCarrierList));
    spyOn(PstnService, 'listResellerCarriers').and.returnValue($q.resolve(resellerCarrierList));
    spyOn(PstnService, 'listDefaultCarriers').and.returnValue($q.resolve(carrierList));
    spyOn(PstnServiceAddressService, 'listCustomerSites').and.returnValue($q.resolve(customerSiteList));
    spyOn(PstnModel, 'setSingleCarrierReseller');
    spyOn(PstnModel, 'clearProviderSpecificData');
    spyOn(Notification, 'errorResponse');
    spyOn(FeatureToggleService, 'supports').and.returnValue($q.resolve(false));
    spyOn($state, 'go');
  }));

  describe('init', function () {
    it('should be initialized with customers carrier Intelepeer and transition to numbers state', function () {
      controller = $controller('PstnProvidersCtrl', {
        $scope: $scope,
      });
      $scope.$apply();

      expect(controller.providers).toEqual([jasmine.objectContaining({
        name: INTELEPEER,
        vendor: INTELEPEER,
      })]);
      expect($state.go).toHaveBeenCalledWith('pstnSetup.orderNumbers');
      expect(PstnModel.isCustomerExists()).toEqual(true);
      expect(PstnModel.isCarrierExists()).toEqual(true);
      expect(PstnModel.isResellerExists()).toEqual(false);
      expect(PstnModel.isSiteExists()).toEqual(true);
    });

    it('should be initialized Intelepeer-Swivel and transition to swivel state', function () {
      controller = $controller('PstnProvidersCtrl', {
        $scope: $scope,
      });
      PstnService.listCustomerCarriers.and.returnValue($q.resolve(swivelCustomerCarrierList));
      $scope.$apply();

      expect(controller.providers).toEqual([jasmine.objectContaining({
        name: 'INTELEPEER-SWIVEL',
        vendor: INTELEPEER,
      })]);
      expect($state.go).toHaveBeenCalledWith('pstnSetup.swivelNumbers');
      expect(PstnModel.isCustomerExists()).toEqual(true);
      expect(PstnModel.isCarrierExists()).toEqual(true);
      expect(PstnModel.isResellerExists()).toEqual(false);
      expect(PstnModel.isSiteExists()).toEqual(true);
    });

    it('should be initialized with customers carrier Intelepeer and transition to service address if site doesn\'t exist', function () {
      PstnServiceAddressService.listCustomerSites.and.returnValue($q.resolve([]));
      controller = $controller('PstnProvidersCtrl', {
        $scope: $scope,
      });
      $scope.$apply();

      expect(controller.providers).toEqual([jasmine.objectContaining({
        name: INTELEPEER,
        vendor: INTELEPEER,
      })]);
      expect($state.go).toHaveBeenCalledWith('pstnSetup.serviceAddress');
      expect(PstnModel.isCustomerExists()).toEqual(true);
      expect(PstnModel.isCarrierExists()).toEqual(true);
      expect(PstnModel.isResellerExists()).toEqual(false);
      expect(PstnModel.isSiteExists()).toEqual(false);
    });

    it('should be initialized with default carriers if customer doesnt exist', function () {
      PstnService.getCustomer.and.returnValue($q.reject({
        status: 404,
      }));
      PstnService.listResellerCarriers.and.returnValue($q.resolve([]));
      controller = $controller('PstnProvidersCtrl', {
        $scope: $scope,
      });
      $scope.$apply();

      expect(controller.providers).toEqual([jasmine.objectContaining({
        name: INTELEPEER,
        vendor: INTELEPEER,
      }), jasmine.objectContaining({
        name: TATA,
        vendor: TATA,
      })]);
      expect($state.go).not.toHaveBeenCalled();
      expect(PstnModel.isCustomerExists()).toEqual(false);
      expect(PstnModel.isCarrierExists()).toEqual(false);
      expect(PstnModel.isResellerExists()).toEqual(true);
      expect(PstnModel.isSiteExists()).toEqual(true);
    });

    it('should be initialized with default carriers if customer and reseller carriers don\'t exist', function () {
      PstnService.listCustomerCarriers.and.returnValue($q.reject({
        status: 404,
      }));
      PstnService.listResellerCarriers.and.returnValue($q.reject({
        status: 404,
      }));
      controller = $controller('PstnProvidersCtrl', {
        $scope: $scope,
      });
      $scope.$apply();

      expect(controller.providers).toEqual([jasmine.objectContaining({
        name: INTELEPEER,
        vendor: INTELEPEER,
      }), jasmine.objectContaining({
        name: TATA,
        vendor: TATA,
      })]);
      expect($state.go).not.toHaveBeenCalled();
      expect(PstnModel.isCustomerExists()).toEqual(true);
      expect(PstnModel.isCarrierExists()).toEqual(false);
      expect(PstnModel.isResellerExists()).toEqual(false);
      expect(PstnModel.isSiteExists()).toEqual(true);
    });

    it('should clear provider data when switching between provider selections', function () {
      PstnService.listCustomerCarriers.and.returnValue($q.reject({
        status: 404,
      }));
      PstnService.listResellerCarriers.and.returnValue($q.resolve([]));
      controller = $controller('PstnProvidersCtrl', {
        $scope: $scope,
      });
      $scope.$apply();

      expect(controller.providers.length).toEqual(2);
      expect(PstnModel.clearProviderSpecificData).not.toHaveBeenCalled();
      PstnModel.clearProviderSpecificData.calls.reset();

      controller.selectProvider(controller.providers[0]);
      expect(PstnModel.clearProviderSpecificData).toHaveBeenCalled();
      PstnModel.clearProviderSpecificData.calls.reset();

      controller.selectProvider(controller.providers[0]);
      expect(PstnModel.clearProviderSpecificData).not.toHaveBeenCalled();
      PstnModel.clearProviderSpecificData.calls.reset();

      controller.selectProvider(controller.providers[1]);
      expect(PstnModel.clearProviderSpecificData).toHaveBeenCalled();
    });

    it('should be initalized with single reseller carrier and skip provider selection, going to contract info', function () {
      PstnService.getCustomer.and.returnValue($q.reject({
        status: 404,
      }));
      PstnService.listResellerCarriers.and.returnValue($q.resolve(resellerCarrierList));
      controller = $controller('PstnProvidersCtrl', {
        $scope: $scope,
      });
      $scope.$apply();

      expect(controller.providers).toEqual([jasmine.objectContaining({
        name: INTELEPEER,
        vendor: INTELEPEER,
      })]);
      expect(PstnModel.setSingleCarrierReseller).toHaveBeenCalledWith(true);
      expect($state.go).toHaveBeenCalledWith('pstnSetup.contractInfo');
      expect(PstnModel.isCustomerExists()).toEqual(false);
      expect(PstnModel.isCarrierExists()).toEqual(false);
      expect(PstnModel.isResellerExists()).toEqual(true);
      expect(PstnModel.isSiteExists()).toEqual(true);
    });

    it('should notify an error if customer carriers fail to load', function () {
      PstnService.listCustomerCarriers.and.returnValue($q.reject({}));
      PstnService.listResellerCarriers.and.returnValue($q.resolve([]));
      PstnService.listDefaultCarriers.and.returnValue($q.resolve([]));
      controller = $controller('PstnProvidersCtrl', {
        $scope: $scope,
      });
      $scope.$apply();

      expect(controller.providers).toEqual([]);
      expect(Notification.errorResponse).toHaveBeenCalled();
      expect(PstnModel.isCustomerExists()).toEqual(true);
      expect(PstnModel.isCarrierExists()).toEqual(false);
      expect(PstnModel.isResellerExists()).toEqual(false);
      expect(PstnModel.isSiteExists()).toEqual(true);
    });

    it('should notify an error if customer doesnt exist and reseller carriers fail to load', function () {
      PstnService.getCustomer.and.returnValue($q.reject({
        status: 404,
      }));
      PstnService.listResellerCarriers.and.returnValue($q.reject());
      controller = $controller('PstnProvidersCtrl', {
        $scope: $scope,
      });
      $scope.$apply();

      expect(controller.providers).toEqual([]);
      expect(Notification.errorResponse).toHaveBeenCalled();
      expect(PstnModel.isCustomerExists()).toEqual(false);
      expect(PstnModel.isCarrierExists()).toEqual(false);
      expect(PstnModel.isResellerExists()).toEqual(false);
      expect(PstnModel.isSiteExists()).toEqual(true);
    });
  });

});
