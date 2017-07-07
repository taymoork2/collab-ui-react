'use strict';

describe('Controller: PstnServiceAddressCtrl', function () {
  var controller, $controller, $scope, $q, $state, PstnModel, PstnServiceAddressService, Notification;
  var customer = getJSONFixture('huron/json/pstnSetup/customer.json');
  var carrier = getJSONFixture('huron/json/pstnSetup/carrierIntelepeer.json');
  var address = getJSONFixture('huron/json/pstnSetup/huronServiceAddress.json');

  beforeEach(angular.mock.module('Huron'));

  beforeEach(inject(function ($rootScope, _$controller_, _$q_, _$state_, _PstnModel_, _PstnServiceAddressService_, _Notification_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $q = _$q_;
    $state = _$state_;
    PstnModel = _PstnModel_;
    PstnServiceAddressService = _PstnServiceAddressService_;
    Notification = _Notification_;

    PstnModel.setCustomerId(customer.uuid);
    PstnModel.setCustomerName(customer.name);
    PstnModel.setCustomerEmail(customer.email);
    PstnModel.setProvider(carrier);

    spyOn(PstnServiceAddressService, 'lookupAddressV2').and.returnValue($q.resolve(address));
    spyOn($state, 'go');
    spyOn(Notification, 'error');

    controller = $controller('PstnServiceAddressCtrl', {
      $scope: $scope,
    });

    $scope.$apply();
  }));

  it('should init data', function () {
    expect(controller.address).toEqual({});
    expect(controller.isValid).toEqual(false);
  });

  it('should lookup address and return valid', function () {
    var myAddress = {
      streetAddress: '555 My Street',
    };
    controller.address = myAddress;
    controller.validateAddress();
    $scope.$apply();

    expect(PstnServiceAddressService.lookupAddressV2).toHaveBeenCalledWith(myAddress, carrier.uuid);
    expect(controller.isValid).toEqual(true);
  });

  it('should notify error if address is not valid', function () {
    PstnServiceAddressService.lookupAddressV2.and.returnValue($q.resolve());
    controller.validateAddress();
    $scope.$apply();

    expect(PstnServiceAddressService.lookupAddressV2).toHaveBeenCalled();
    expect(controller.isValid).toEqual(false);
    expect(Notification.error).toHaveBeenCalledWith('pstnSetup.serviceAddressNotFound');
  });

  it('should go to order numbers if address is valid', function () {
    expect(controller.isValid).toEqual(false);

    controller.validateAddress();
    $scope.$apply();

    expect(controller.isValid).toEqual(true);

    controller.next();
    $scope.$apply();

    expect(PstnModel.getServiceAddress()).toEqual(address);
    expect($state.go).toHaveBeenCalledWith('pstnSetup.orderNumbers');
  });

  describe('goBack()', function () {
    it('should go to contractInfo if customer doesn\'t exist', function () {
      PstnModel.setCustomerExists(false);
      controller.goBack();
      $scope.$apply();

      expect($state.go).toHaveBeenCalledWith('pstnSetup.contractInfo');
    });

    it('should go to pstnSetup if customer exists', function () {
      PstnModel.setCustomerExists(true);
      controller.goBack();
      $scope.$apply();

      expect($state.go).toHaveBeenCalledWith('pstnSetup');
    });
  });

  describe('hasBackButton()', function () {
    it('should show back button if carrier hasn\'t been associated', function () {
      expect(controller.hasBackButton()).toEqual(true);
    });

    it('should not show back button if carrier exists and customer exists', function () {
      PstnModel.setCarrierExists(true);
      PstnModel.setCustomerExists(true);
      expect(controller.hasBackButton()).toEqual(false);
    });

    it('should not show back button if only one carrier and customer exists', function () {
      PstnModel.setSingleCarrierReseller(true);
      PstnModel.setCustomerExists(true);
      expect(controller.hasBackButton()).toEqual(false);
    });

    it('should show back button if customer doesn\'t exist', function () {
      PstnModel.setCarrierExists(true);
      PstnModel.setSingleCarrierReseller(true);
      PstnModel.setCustomerExists(false);
      expect(controller.hasBackButton()).toEqual(true);
    });
  });
});
