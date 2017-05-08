'use strict';

describe('Controller: PstnContractInfoCtrl', function () {
  var controller, $controller, $scope, $state, PstnModel, FeatureToggleService, $q;
  var customer = getJSONFixture('huron/json/pstnSetup/customer.json');

  beforeEach(angular.mock.module('Huron'));

  beforeEach(inject(function ($rootScope, _$controller_, _$state_, _PstnModel_, _FeatureToggleService_, _$q_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $state = _$state_;
    PstnModel = _PstnModel_;
    FeatureToggleService = _FeatureToggleService_;
    $q = _$q_;

    PstnModel.setCustomerId(customer.uuid);
    PstnModel.setCustomerName(customer.name);
    PstnModel.setCustomerEmail(customer.email);

    spyOn($state, 'go');
    spyOn(FeatureToggleService, 'supports').and.returnValue($q.resolve(false));

    controller = $controller('PstnContractInfoCtrl', {
      $scope: $scope,
    });

    $scope.$apply();
  }));

  it('should init data', function () {
    expect(controller.companyName).toEqual(PstnModel.getCustomerName());
    expect(controller.firstName).toEqual(PstnModel.getCustomerFirstName());
    expect(controller.lastName).toEqual(PstnModel.getCustomerLastName());
    expect(controller.emailAddress).toEqual(PstnModel.getCustomerEmail());
  });

  it('should store data and transition to next state on', function () {
    controller.companyName = 'newName';
    controller.firstName = 'newFirst';
    controller.lastName = 'newLast';
    controller.emailAddress = 'newEmail';

    controller.validateContactInfo();
    $scope.$apply();

    expect(controller.companyName).toEqual(PstnModel.getCustomerName());
    expect(controller.firstName).toEqual(PstnModel.getCustomerFirstName());
    expect(controller.lastName).toEqual(PstnModel.getCustomerLastName());
    expect(controller.emailAddress).toEqual(PstnModel.getCustomerEmail());

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
    PstnModel.setCarrierExists(true);
    expect(controller.hasBackButton()).toEqual(false);
  });

  it('should not show back button if only one carrier', function () {
    PstnModel.setSingleCarrierReseller(true);
    expect(controller.hasBackButton()).toEqual(false);
  });
});
