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
    spyOn(Notification, 'errorResponse');

    controller = $controller('ExternalNumberOverviewCtrl', {
      $scope: $scope
    });

    $scope.$apply();
  }));

  it('should calculate number of phone numbers', function () {
    expect(controller.allNumbersCount).toEqual(2);
  });

  it('should update number of phone numbers', function () {
    var newNumbers = externalNumbers.concat([{
      'pattern': '789'
    }, {
      'pattern': '000'
    }]);
    ExternalNumberService.getAllNumbers.and.returnValue(newNumbers);
    $scope.$apply();
    expect(controller.allNumbersCount).toEqual(4);
  });

  it('should show 0 numbers on error', function () {
    ExternalNumberService.refreshNumbers.and.returnValue($q.reject());
    ExternalNumberService.getAllNumbers.and.returnValue([]);
    controller = $controller('ExternalNumberOverviewCtrl', {
      $scope: $scope
    });
    $scope.$apply();
    expect(Notification.errorResponse).toHaveBeenCalled();
    expect(controller.allNumbersCount).toEqual(0);
  });

  it('should show 0 numbers if no customer found', function () {
    ExternalNumberService.getAllNumbers.and.callThrough();
    delete $stateParams.currentCustomer.customerOrgId;
    controller = $controller('ExternalNumberOverviewCtrl', {
      $scope: $scope
    });
    $scope.$apply();
    expect(controller.allNumbersCount).toEqual(0);
  });

});
