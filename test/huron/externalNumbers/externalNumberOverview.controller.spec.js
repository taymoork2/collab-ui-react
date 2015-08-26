'use strict';

describe('Controller: ExternalNumberOverviewCtrl', function () {
  var controller, $controller, $scope, $stateParams, $q, ExternalNumberService, ExternalNumberPool;

  var externalNumbers;

  beforeEach(module('Huron'));

  beforeEach(inject(function ($rootScope, _$controller_, _$stateParams_, _$q_, _ExternalNumberService_, _ExternalNumberPool_) {
    $scope = $rootScope.$new();
    $controller = _$controller_;
    $stateParams = _$stateParams_;
    ExternalNumberService = _ExternalNumberService_;
    ExternalNumberPool = _ExternalNumberPool_;
    $q = _$q_;

    $stateParams.currentCustomer = {
      customerOrgId: '5555-6666'
    };

    externalNumbers = [{
      'pattern': '123'
    }, {
      'pattern': '456'
    }];

    spyOn(ExternalNumberPool, 'getAll').and.returnValue($q.when(externalNumbers));

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
    ExternalNumberService.setAllNumbers(newNumbers);
    $scope.$apply();
    expect(controller.allNumbersCount).toEqual(4);
  });

  it('should show 0 numbers on error', function () {
    ExternalNumberPool.getAll.and.returnValue($q.reject());
    controller = $controller('ExternalNumberOverviewCtrl', {
      $scope: $scope
    });
    $scope.$apply();
    expect(controller.allNumbersCount).toEqual(0);
  });

  it('should show 0 numbers if no customer found', function () {
    delete $stateParams.currentCustomer.customerOrgId;
    controller = $controller('ExternalNumberOverviewCtrl', {
      $scope: $scope
    });
    $scope.$apply();
    expect(controller.allNumbersCount).toEqual(0);
  });

});
