'use strict';

describe('Controller: ExternalNumberDetailCtrl', function () {
  var controller, $controller, $q, $scope, $state, $stateParams,
    ExternalNumberService, DialPlanService, Notification;

  var externalNumbers;

  beforeEach(angular.mock.module('Huron'));

  beforeEach(inject(function ($rootScope, _$controller_, _$stateParams_, _$q_, _$state_, _ExternalNumberService_, _DialPlanService_, _Notification_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $state = _$state_;
    $stateParams = _$stateParams_;
    ExternalNumberService = _ExternalNumberService_;
    DialPlanService = _DialPlanService_;
    Notification = _Notification_;
    $q = _$q_;

    $stateParams.currentCustomer = {
      customerOrgId: '5555-6666',
    };

    externalNumbers = [{
      number: '123',
    }, {
      number: '456',
    }];

    spyOn($state, 'go');
    spyOn(ExternalNumberService, 'deleteNumber').and.returnValue($q.resolve());
    spyOn(ExternalNumberService, 'isTerminusCustomer').and.returnValue($q.resolve());
    spyOn(ExternalNumberService, 'getAssignedNumbersV2').and.returnValue($q.resolve(externalNumbers));
    spyOn(ExternalNumberService, 'getUnassignedNumbersV2').and.returnValue($q.resolve());
    spyOn(ExternalNumberService, 'getCarrierInfo').and.returnValue($q.resolve());
    spyOn(ExternalNumberService, 'refreshNumbers').and.returnValue($q.resolve());

    spyOn(Notification, 'errorResponse');
    spyOn(DialPlanService, 'getCustomerDialPlanCountryCode').and.returnValue($q.resolve('+1'));

    controller = $controller('ExternalNumberDetailCtrl', {
      $scope: $scope,
    });

    $scope.$apply();
  }));

  afterEach(function () {
    controller = undefined;
    $controller = undefined;
    $q = undefined;
    $scope = undefined;
    $state = undefined;
    $stateParams = undefined;
    ExternalNumberService = undefined;
    DialPlanService = undefined;
    Notification = undefined;
    externalNumbers = undefined;
  });

  it('should load all the phone numbers', function () {
    expect(controller.assignedNumbers).toEqual(externalNumbers);
  });

  describe('listPhoneNumbers', function () {
    it('should query for pending number types', function () {
      controller.listPhoneNumbers();
      $scope.$apply();

      expect(ExternalNumberService.refreshNumbers).toHaveBeenCalled();
    });
  });

  it('should refresh list of assigned phone numbers', function () {
    var newNumbers = externalNumbers.concat([{
      number: '789',
    }, {
      number: '000',
    }]);
    ExternalNumberService.getAssignedNumbersV2.and.returnValue($q.resolve(newNumbers));
    controller.listPhoneNumbers();
    $scope.$apply();
    expect(controller.assignedNumbers.length).toEqual(4);
  });

  it('should show no pending numbers on error', function () {
    ExternalNumberService.refreshNumbers.and.returnValue($q.reject());
    controller.listPhoneNumbers();
    $scope.$apply();
    expect(Notification.errorResponse).toHaveBeenCalled();
    expect(controller.pendingList).toEqual([]);
  });

  it('should show no numbers if no customer found', function () {
    delete $stateParams.currentCustomer.customerOrgId;
    controller = $controller('ExternalNumberDetailCtrl', {
      $scope: $scope,
    });
    $scope.$apply();
    expect(controller.assignedNumbers).toEqual([]);
    expect(controller.unassignedNumbers).toEqual([]);
  });
});
