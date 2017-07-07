'use strict';

describe('Controller: PstnSwivelNumbersCtrl', function () {
  var controller, $controller, $scope, $state, PstnModel, Notification, $httpBackend;

  var customer = getJSONFixture('huron/json/pstnSetup/customer.json');
  var carrierList = getJSONFixture('huron/json/pstnSetup/carrierList.json');

  beforeEach(angular.mock.module('Huron'));

  beforeEach(inject(function ($rootScope, _$controller_, _$state_, _PstnModel_, _Notification_, _$httpBackend_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $state = _$state_;
    PstnModel = _PstnModel_;
    Notification = _Notification_;
    $httpBackend = _$httpBackend_;

    PstnModel.setCustomerId(customer.uuid);
    PstnModel.setCustomerName(customer.name);
    PstnModel.setProvider(carrierList[1]);
    $httpBackend.whenGET('https://identity.webex.com/identity/scim/null/v1/Users/me').respond(200, {});
    spyOn(Notification, 'error');
    spyOn($state, 'go');

    controller = $controller('PstnSwivelNumbersCtrl', {
      $scope: $scope,
    });
    $scope.$apply();
  }));

  it('should initialize', function () {
    expect(controller).toBeDefined();
  });
});
