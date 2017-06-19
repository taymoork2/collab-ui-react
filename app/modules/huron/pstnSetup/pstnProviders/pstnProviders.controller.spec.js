'use strict';

describe('Controller: PstnProvidersCtrl', function () {
  var controller, $controller, $scope, $q, $state, PstnModel, PstnService;
  var PstnServiceAddressService, Notification, Orgservice;

  var carrierList = getJSONFixture('huron/json/pstnSetup/carrierList.json');
  var customer = getJSONFixture('huron/json/pstnSetup/customer.json');
  var customerCarrierList = getJSONFixture('huron/json/pstnSetup/customerCarrierList.json');
  var resellerCarrierList = getJSONFixture('huron/json/pstnSetup/resellerCarrierList.json');
  var customerSiteList = getJSONFixture('huron/json/pstnSetup/customerSiteList.json');
  var INTELEPEER = require('modules/huron/pstn').INTELEPEER;
  var SWIVEL = require('modules/huron/pstn').SWIVEL;

  beforeEach(angular.mock.module('Huron'));

  beforeEach(inject(function ($rootScope, _$controller_, _$q_, _$state_, _PstnModel_, _PstnService_, _PstnServiceAddressService_, _Notification_, _Orgservice_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $q = _$q_;
    $state = _$state_;
    PstnModel = _PstnModel_;
    PstnService = _PstnService_;
    PstnServiceAddressService = _PstnServiceAddressService_;
    Notification = _Notification_;
    Orgservice = _Orgservice_;

    PstnModel.setCustomerId(customer.uuid);
    PstnModel.setCustomerName(customer.name);

    var org = {
      countryCode: 'US',
    };

    spyOn(Orgservice, 'getOrg').and.returnValue($q.resolve(org));
    spyOn(PstnService, 'getCustomer').and.returnValue($q.resolve());
    spyOn(PstnService, 'listCustomerCarriers').and.returnValue($q.resolve(customerCarrierList));
    spyOn(PstnService, 'listResellerCarriers').and.returnValue($q.resolve(resellerCarrierList));
    spyOn(PstnService, 'listDefaultCarriers').and.returnValue($q.resolve(carrierList));
    spyOn(PstnServiceAddressService, 'listCustomerSites').and.returnValue($q.resolve(customerSiteList));
    spyOn(PstnModel, 'setSingleCarrierReseller');
    spyOn(PstnModel, 'clearProviderSpecificData');
    spyOn(Notification, 'errorResponse');
    spyOn($state, 'go');

    controller = $controller('PstnProvidersCtrl', {
      $scope: $scope,
    });
    $scope.$apply();
  }));

  describe('Create', function () {
    it('should be initialized', function () {
      expect(controller).toExist();
    });
  });

  describe('Provider selected', function () {
    beforeEach(function () {
      PstnModel.setProvider({
        apiImplementation: INTELEPEER,
      });
    });

    it('should collect customer info if not a terminus customer', function () {
      PstnModel.setCustomerExists(false);
      controller.onProviderChange();
      expect($state.go).toHaveBeenCalledWith('pstnSetup.contractInfo');
    });

    it('should go to create site if it doesn\'t exist', function () {
      PstnModel.setCustomerExists(true);
      PstnModel.setSiteExists(false);
      controller.onProviderChange();
      expect($state.go).toHaveBeenCalledWith('pstnSetup.serviceAddress');
    });

    it('should go to order numbers', function () {
      PstnModel.setCustomerExists(true);
      PstnModel.setSiteExists(true);
      controller.onProviderChange();
      expect($state.go).toHaveBeenCalledWith('pstnSetup.orderNumbers');
    });

    it('should go to SWIVEL orders', function () {
      PstnModel.setProvider({
        apiImplementation: SWIVEL,
      });
      controller.onProviderChange();
      expect($state.go).toHaveBeenCalledWith('pstnSetup.swivelNumbers');
    });
  });
});
