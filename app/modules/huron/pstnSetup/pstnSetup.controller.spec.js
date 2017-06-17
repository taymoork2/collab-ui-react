'use strict';

describe('Controller: PstnSetupCtrl', function () {
  var $scope, $q, $state, $stateParams, $ctrl, PstnModel, PstnService, Notification;

  var customer = getJSONFixture('huron/json/pstnSetup/customer.json');
  var deferred;

  afterEach(function () {
    $q = $scope = $state = $ctrl = PstnModel = PstnService = Notification = undefined;
  });

  beforeEach(angular.mock.module('Huron'));
  beforeEach(inject(dependencies));

  function dependencies($rootScope, $controller, _$q_, _$state_, _$stateParams_, _PstnModel_, _PstnService_, _Notification_) {
    $scope = $rootScope.$new();
    $q = _$q_;
    $state = _$state_;
    $stateParams = _$stateParams_;
    $ctrl = $controller;
    PstnModel = _PstnModel_;
    PstnService = _PstnService_;
    Notification = _Notification_;

    $stateParams.customerId = customer.uuid;
    $stateParams.customerName = customer.name;
    $stateParams.customerCommunicationLicenseIsTrial = customer.isTrial;
    $stateParams.customerRoomSystemsLicenseIsTrial = customer.isTrial;
    deferred = $q.defer();
    $state.modal = {
      result: deferred.promise,
    };

    spyOn(PstnModel, 'setCustomerId');
    spyOn(PstnModel, 'setCustomerName');
    spyOn(PstnModel, 'setIsTrial');
    spyOn(PstnModel, 'clear');
  }

  it('should initialize', function () {
    spyOn(PstnService, 'getResellerV2').and.returnValue($q.resolve());
    spyOn(PstnService, 'createResellerV2').and.returnValue($q.resolve());

    $ctrl('PstnSetupCtrl', {
      $scope: $scope,
    });
    $scope.$apply();

    expect(PstnModel.setCustomerId).toHaveBeenCalledWith(customer.uuid);
    expect(PstnModel.setCustomerName).toHaveBeenCalledWith(customer.name);
    expect(PstnModel.setIsTrial).toHaveBeenCalledWith(customer.isTrial);
    expect(PstnModel.clear).not.toHaveBeenCalled();
    expect(PstnService.getResellerV2).toHaveBeenCalled();
    expect(PstnService.createResellerV2).not.toHaveBeenCalled();
  });

  it('should clear PstnSetup data on modal close', function () {
    spyOn(PstnService, 'getResellerV2').and.returnValue($q.resolve());
    spyOn(PstnService, 'createResellerV2').and.returnValue($q.resolve());

    $ctrl('PstnSetupCtrl', {
      $scope: $scope,
    });
    $scope.$apply();

    deferred.resolve();
    $scope.$apply();
    expect(PstnModel.clear).toHaveBeenCalled();
  });

  it('should create a reseller', function () {
    spyOn(PstnService, 'getResellerV2').and.returnValue($q.reject());
    spyOn(PstnService, 'createResellerV2').and.returnValue($q.resolve());
    spyOn(Notification, 'errorResponse').and.callThrough();

    $ctrl('PstnSetupCtrl', {
      $scope: $scope,
    });
    $scope.$apply();

    expect(PstnService.createResellerV2).toHaveBeenCalled();
    expect(PstnService.createResellerV2).toHaveBeenCalled();
    expect(Notification.errorResponse).not.toHaveBeenCalled();
  });

  it('should fail and call Notification', function () {
    spyOn(PstnService, 'getResellerV2').and.returnValue($q.reject());
    spyOn(PstnService, 'createResellerV2').and.returnValue($q.reject());
    spyOn(Notification, 'errorResponse').and.callThrough();

    $ctrl('PstnSetupCtrl', {
      $scope: $scope,
    });
    $scope.$apply();

    expect(PstnService.createResellerV2).toHaveBeenCalled();
    expect(PstnService.createResellerV2).toHaveBeenCalled();
    expect(Notification.errorResponse).toHaveBeenCalled();
  });
});
