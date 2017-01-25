'use strict';

describe('Controller: PstnSetupCtrl', function () {
  var $scope, $q, $state, $stateParams, $ctrl, PstnSetup, PstnSetupService, Notification;

  var customer = getJSONFixture('huron/json/pstnSetup/customer.json');
  var deferred;

  afterEach(function () {
    $q = $scope = $state = $ctrl = PstnSetup = PstnSetupService = Notification = undefined;
  });

  beforeEach(angular.mock.module('Huron'));
  beforeEach(inject(dependencies));

  function dependencies($rootScope, $controller, _$q_, _$state_, _$stateParams_, _PstnSetup_, _PstnSetupService_, _Notification_) {
    $scope = $rootScope.$new();
    $q = _$q_;
    $state = _$state_;
    $stateParams = _$stateParams_;
    $ctrl = $controller;
    PstnSetup = _PstnSetup_;
    PstnSetupService = _PstnSetupService_;
    Notification = _Notification_;

    $stateParams.customerId = customer.uuid;
    $stateParams.customerName = customer.name;
    $stateParams.customerCommunicationLicenseIsTrial = customer.isTrial;
    $stateParams.customerRoomSystemsLicenseIsTrial = customer.isTrial;
    deferred = $q.defer();
    $state.modal = {
      result: deferred.promise
    };

    spyOn(PstnSetup, 'setCustomerId');
    spyOn(PstnSetup, 'setCustomerName');
    spyOn(PstnSetup, 'setIsTrial');
    spyOn(PstnSetup, 'clear');
  }

  it('should initialize', function () {
    spyOn(PstnSetupService, 'getResellerV2').and.returnValue($q.resolve());
    spyOn(PstnSetupService, 'createResellerV2').and.returnValue($q.resolve());

    $ctrl('PstnSetupCtrl', {
      $scope: $scope
    });
    $scope.$apply();

    expect(PstnSetup.setCustomerId).toHaveBeenCalledWith(customer.uuid);
    expect(PstnSetup.setCustomerName).toHaveBeenCalledWith(customer.name);
    expect(PstnSetup.setIsTrial).toHaveBeenCalledWith(customer.isTrial);
    expect(PstnSetup.clear).not.toHaveBeenCalled();
    expect(PstnSetupService.getResellerV2).toHaveBeenCalled();
    expect(PstnSetupService.createResellerV2).not.toHaveBeenCalled();
  });

  it('should clear PstnSetup data on modal close', function () {
    spyOn(PstnSetupService, 'getResellerV2').and.returnValue($q.resolve());
    spyOn(PstnSetupService, 'createResellerV2').and.returnValue($q.resolve());

    $ctrl('PstnSetupCtrl', {
      $scope: $scope
    });
    $scope.$apply();

    deferred.resolve();
    $scope.$apply();
    expect(PstnSetup.clear).toHaveBeenCalled();
  });

  it('should create a reseller', function () {
    spyOn(PstnSetupService, 'getResellerV2').and.returnValue($q.reject());
    spyOn(PstnSetupService, 'createResellerV2').and.returnValue($q.resolve());
    spyOn(Notification, 'errorResponse').and.callThrough();

    $ctrl('PstnSetupCtrl', {
      $scope: $scope
    });
    $scope.$apply();

    expect(PstnSetupService.createResellerV2).toHaveBeenCalled();
    expect(PstnSetupService.createResellerV2).toHaveBeenCalled();
    expect(Notification.errorResponse).not.toHaveBeenCalled();
  });

  it('should fail and call Notification', function () {
    spyOn(PstnSetupService, 'getResellerV2').and.returnValue($q.reject());
    spyOn(PstnSetupService, 'createResellerV2').and.returnValue($q.reject());
    spyOn(Notification, 'errorResponse').and.callThrough();

    $ctrl('PstnSetupCtrl', {
      $scope: $scope
    });
    $scope.$apply();

    expect(PstnSetupService.createResellerV2).toHaveBeenCalled();
    expect(PstnSetupService.createResellerV2).toHaveBeenCalled();
    expect(Notification.errorResponse).toHaveBeenCalled();
  });

});
