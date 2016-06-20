'use strict';

describe('Controller: PstnServiceAddressCtrl', function () {
  var controller, $controller, $scope, $q, $state, PstnSetup, PstnServiceAddressService, Notification;
  var customer = getJSONFixture('huron/json/pstnSetup/customer.json');
  var address = getJSONFixture('huron/json/pstnSetup/huronServiceAddress.json');

  beforeEach(module('Huron'));

  beforeEach(inject(function ($rootScope, _$controller_, _$q_, _$state_, _PstnSetup_, _PstnServiceAddressService_, _Notification_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $q = _$q_;
    $state = _$state_;
    PstnSetup = _PstnSetup_;
    PstnServiceAddressService = _PstnServiceAddressService_;
    Notification = _Notification_;

    PstnSetup.setCustomerId(customer.uuid);
    PstnSetup.setCustomerName(customer.name);
    PstnSetup.setCustomerEmail(customer.email);

    spyOn(PstnServiceAddressService, 'lookupAddress').and.returnValue($q.when(address));
    spyOn($state, 'go');
    spyOn(Notification, 'error');

    controller = $controller('PstnServiceAddressCtrl', {
      $scope: $scope
    });

    $scope.$apply();
  }));

  it('should init data', function () {
    expect(controller.address).toEqual({});
    expect(controller.isValid).toEqual(false);
  });

  it('should lookup address and return valid', function () {
    var myAddress = {
      streetAddress: '555 My Street'
    };
    controller.address = myAddress;
    controller.validateAddress();
    $scope.$apply();

    expect(PstnServiceAddressService.lookupAddress).toHaveBeenCalledWith(myAddress);
    expect(controller.isValid).toEqual(true);
  });

  it('should notify error if address is not valid', function () {
    PstnServiceAddressService.lookupAddress.and.returnValue($q.when());
    controller.validateAddress();
    $scope.$apply();

    expect(PstnServiceAddressService.lookupAddress).toHaveBeenCalled();
    expect(controller.isValid).toEqual(false);
    expect(Notification.error).toHaveBeenCalledWith('pstnSetup.serviceAddressNotFound');
  });

  it('should go to order numbers if address is valid', function () {
    expect(controller.isValid).toEqual(false);

    controller.validateAddress();
    $scope.$apply();

    expect(controller.isValid).toEqual(true);

    controller.validateAddress();
    $scope.$apply();

    expect(PstnSetup.getServiceAddress()).toEqual(address);
    expect($state.go).toHaveBeenCalledWith('pstnSetup.orderNumbers');
  });

  describe('goBack()', function () {
    it('should go to contractInfo if customer doesn\'t exist', function () {
      PstnSetup.setCustomerExists(false);
      controller.goBack();
      $scope.$apply();

      expect($state.go).toHaveBeenCalledWith('pstnSetup.contractInfo');
    });

    it('should go to pstnSetup if customer exists', function () {
      PstnSetup.setCustomerExists(true);
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
      PstnSetup.setCarrierExists(true);
      PstnSetup.setCustomerExists(true);
      expect(controller.hasBackButton()).toEqual(false);
    });

    it('should not show back button if only one carrier and customer exists', function () {
      PstnSetup.setSingleCarrierReseller(true);
      PstnSetup.setCustomerExists(true);
      expect(controller.hasBackButton()).toEqual(false);
    });

    it('should show back button if customer doesn\'t exist', function () {
      PstnSetup.setCarrierExists(true);
      PstnSetup.setSingleCarrierReseller(true);
      PstnSetup.setCustomerExists(false);
      expect(controller.hasBackButton()).toEqual(true);
    });
  });

});
