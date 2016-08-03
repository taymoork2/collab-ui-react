'use strict';

describe('Controller: PstnSetupCtrl', function () {
  var controller, $scope, $q, $state, $stateParams, PstnSetup;

  var customer = getJSONFixture('huron/json/pstnSetup/customer.json');
  var deferred;

  beforeEach(angular.mock.module('Huron'));

  beforeEach(inject(function ($rootScope, $controller, _$q_, _$state_, _$stateParams_, _PstnSetup_) {
    $scope = $rootScope.$new();
    $q = _$q_;
    $state = _$state_;
    $stateParams = _$stateParams_;
    PstnSetup = _PstnSetup_;

    $stateParams.customerId = customer.uuid;
    $stateParams.customerName = customer.name;
    $stateParams.customerCommunicationLicenseIsTrial = customer.isTrial;
    deferred = $q.defer();
    $state.modal = {
      result: deferred.promise
    };

    spyOn(PstnSetup, 'setCustomerId');
    spyOn(PstnSetup, 'setCustomerName');
    spyOn(PstnSetup, 'setIsTrial');
    spyOn(PstnSetup, 'clear');

    controller = $controller('PstnSetupCtrl', {
      $scope: $scope
    });

    $scope.$apply();
  }));

  it('should initialize', function () {
    expect(PstnSetup.setCustomerId).toHaveBeenCalledWith(customer.uuid);
    expect(PstnSetup.setCustomerName).toHaveBeenCalledWith(customer.name);
    expect(PstnSetup.setIsTrial).toHaveBeenCalledWith(customer.isTrial);
    expect(PstnSetup.clear).not.toHaveBeenCalled();
  });

  it('should clear PstnSetup data on modal close', function () {
    deferred.resolve();
    $scope.$apply();
    expect(PstnSetup.clear).toHaveBeenCalled();
  });

});
