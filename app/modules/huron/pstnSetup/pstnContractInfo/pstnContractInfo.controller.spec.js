'use strict';

describe('Controller: PstnContractInfoCtrl', function () {
  var controller, $controller, $scope, $q, $state, PstnSetup;
  var customer = getJSONFixture('huron/json/pstnSetup/customer.json');

  beforeEach(module('Huron'));

  beforeEach(inject(function ($rootScope, _$controller_, _$q_, _$state_, _PstnSetup_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $q = _$q_;
    $state = _$state_;
    PstnSetup = _PstnSetup_;

    PstnSetup.setCustomerId(customer.uuid);
    PstnSetup.setCustomerName(customer.name);
    PstnSetup.setCustomerEmail(customer.email);

    spyOn($state, 'go');

    controller = $controller('PstnContractInfoCtrl', {
      $scope: $scope
    });

    $scope.$apply();
  }));

  it('should init data', function () {
    expect(controller.companyName).toEqual(PstnSetup.getCustomerName());
    expect(controller.firstName).toEqual(PstnSetup.getCustomerFirstName());
    expect(controller.lastName).toEqual(PstnSetup.getCustomerLastName());
    expect(controller.emailAddress).toEqual(PstnSetup.getCustomerEmail());
  });

  it('should store data and transition to next state on', function () {
    controller.companyName = 'newName';
    controller.firstName = 'newFirst';
    controller.lastName = 'newLast';
    controller.emailAddress = 'newEmail';

    controller.validateContactInfo();
    $scope.$apply();

    expect(controller.companyName).toEqual(PstnSetup.getCustomerName());
    expect(controller.firstName).toEqual(PstnSetup.getCustomerFirstName());
    expect(controller.lastName).toEqual(PstnSetup.getCustomerLastName());
    expect(controller.emailAddress).toEqual(PstnSetup.getCustomerEmail());

    expect($state.go).toHaveBeenCalledWith('pstnSetup.serviceAddress');
  });

  it('should go back to pstnSetup', function () {
    controller.goBack();
    $scope.$apply();

    expect($state.go).toHaveBeenCalledWith('pstnSetup');
  });

  it('should show back button if carrier hasn\'t been associated', function () {
    expect(controller.hasBackButton()).toEqual(true);
  });

  it('should not show back button if carrier is associated', function () {
    PstnSetup.setCarrierExists(true);
    expect(controller.hasBackButton()).toEqual(false);
  });

  it('should not show back button if only one carrier', function () {
    PstnSetup.setSingleCarrierReseller(true);
    expect(controller.hasBackButton()).toEqual(false);
  });
});
