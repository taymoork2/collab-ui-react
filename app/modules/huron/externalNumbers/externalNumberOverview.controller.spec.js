'use strict';

describe('Controller: ExternalNumberOverviewCtrl', function () {
  var controller, $controller, $scope, $stateParams, $q, ExternalNumberService, Notification;

  var externalNumbers;

  beforeEach(module('Huron'));

  beforeEach(inject(function ($rootScope, _$controller_, _$stateParams_, _$q_, _ExternalNumberService_, _Notification_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $stateParams = _$stateParams_;
    ExternalNumberService = _ExternalNumberService_;
    Notification = _Notification_;
    $q = _$q_;

    $stateParams.currentCustomer = {
      customerOrgId: '5555-6666'
    };

    externalNumbers = [{
      'pattern': '123'
    }, {
      'pattern': '456'
    }];

    spyOn(ExternalNumberService, 'refreshNumbers').and.returnValue($q.when());
    spyOn(ExternalNumberService, 'getAllNumbers').and.returnValue(externalNumbers);
    spyOn(ExternalNumberService, 'getQuantity').and.returnValue(2);
    spyOn(Notification, 'errorResponse');

    controller = $controller('ExternalNumberOverviewCtrl', {
      $scope: $scope
    });

    $scope.$apply();
  }));

  it('should get the number of phone numbers', function () {
    expect(controller.allNumbersCount).toEqual(2);
  });

  it('should show 0 numbers on error', function () {
    ExternalNumberService.refreshNumbers.and.returnValue($q.reject());
    ExternalNumberService.getAllNumbers.and.returnValue([]);
    ExternalNumberService.getQuantity.and.returnValue(0);
    controller = $controller('ExternalNumberOverviewCtrl', {
      $scope: $scope
    });
    $scope.$apply();
    expect(Notification.errorResponse).toHaveBeenCalled();
    expect(controller.allNumbersCount).toEqual(0);
  });

  it('should show 0 numbers if no customer found', function () {
    ExternalNumberService.getAllNumbers.and.callThrough();
    ExternalNumberService.getQuantity.and.returnValue(0);
    delete $stateParams.currentCustomer.customerOrgId;
    controller = $controller('ExternalNumberOverviewCtrl', {
      $scope: $scope
    });
    $scope.$apply();
    expect(controller.allNumbersCount).toEqual(0);
  });

});
