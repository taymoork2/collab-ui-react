'use strict';

describe('Controller: CallParkDetailCtrl', function () {
  var controller, $scope, $modalInstance, $q, CallPark;

  beforeEach(angular.mock.module('uc.callpark'));
  beforeEach(angular.mock.module('Huron'));
  var callParkModel = getJSONFixture('huron/json/callpark/callpark.json');
  var callParkError = getJSONFixture('huron/json/callpark/callparkerror.json');
  beforeEach(inject(function ($rootScope, $controller, _$q_, _CallPark_) {
    $scope = $rootScope.$new();
    $q = _$q_;
    CallPark = _CallPark_;

    $modalInstance = jasmine.createSpyObj('$modalInstance', ['close', 'dismiss']);
    spyOn(CallPark, 'create').and.returnValue($q.when());
    spyOn(CallPark, 'createByRange').and.returnValue($q.when());

    controller = $controller('CallParkDetailCtrl', {
      $scope: $scope,
      $modalInstance: $modalInstance,
      CallPark: CallPark
    });

    $scope.$apply();
  }));

  describe('addCallPark', function () {
    it('should close modal on success', function () {
      controller.addCallPark(callParkModel);
      $scope.$apply();
      expect($modalInstance.close).toHaveBeenCalled();
    });

    it('should dismiss modal on error', function () {
      CallPark.create.and.returnValue($q.reject());

      controller.addCallPark(callParkError);
      $scope.$apply();
      expect($modalInstance.dismiss).toHaveBeenCalled();
    });
  });

  describe('addCallParkByRange', function () {
    it('should close modal on success', function () {
      controller.addCallParkByRange(callParkModel, '1234567', '1234568');
      $scope.$apply();
      expect($modalInstance.close).toHaveBeenCalled();
    });

    it('should dismiss modal on error', function () {
      CallPark.createByRange.and.returnValue($q.reject());
      controller.addCallParkByRange(callParkModel, '1234567', '1234568');
      $scope.$apply();
      expect($modalInstance.dismiss).toHaveBeenCalled();
    });
  });

});
