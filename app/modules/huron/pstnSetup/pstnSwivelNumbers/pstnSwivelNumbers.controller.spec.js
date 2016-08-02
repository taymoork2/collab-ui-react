'use strict';

describe('Controller: PstnSwivelNumbersCtrl', function () {
  var controller, $controller, $scope, $q, $state, PstnSetup, Notification;

  var customer = getJSONFixture('huron/json/pstnSetup/customer.json');
  var carrierList = getJSONFixture('huron/json/pstnSetup/carrierList.json');
  var swivelNumberTokens = getJSONFixture('huron/json/pstnSetup/swivelNumberTokens.json');

  beforeEach(angular.mock.module('Huron'));

  beforeEach(inject(function ($rootScope, _$controller_, _$q_, _$state_, _PstnSetup_, _Notification_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $q = _$q_;
    $state = _$state_;
    PstnSetup = _PstnSetup_;
    Notification = _Notification_;

    PstnSetup.setCustomerId(customer.uuid);
    PstnSetup.setCustomerName(customer.name);
    PstnSetup.setProvider(carrierList[1]);

    spyOn(Notification, 'error');
    spyOn($state, 'go');

    controller = $controller('PstnSwivelNumbersCtrl', {
      $scope: $scope
    });
    $scope.$apply();
  }));

  it('should initialize', function () {
    expect(controller).toBeDefined();
  });

});
