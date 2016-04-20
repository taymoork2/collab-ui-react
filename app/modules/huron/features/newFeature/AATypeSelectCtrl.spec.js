'use strict';

describe('Controller: AATypeSelectCtrl', function () {

  beforeEach(module('Huron'));

  var controller, $scope, $state, $q, $timeout;
  var modalFake = {
    close: jasmine.createSpy('modalInstance.close'),
    dismiss: jasmine.createSpy('modalInstance.dismiss')
  };

  beforeEach(inject(function ($rootScope, $controller, _$state_, _$q_, _$timeout_) {
    $scope = $rootScope.$new();
    $q = _$q_;
    $state = _$state_;
    $timeout = _$timeout_;
    spyOn($state, 'go');
    controller = $controller('AATypeSelectCtrl', {
      $scope: $scope,
      $modalInstance: modalFake,
      $timeout: $timeout,
      $state: $state
    });
  }));

  it("ok function call results in closing the Modal with the value chosen when item is 1", function () {
    var item = {
      id: 1
    };
    $scope.ok(item);
    $scope.$apply();
    $timeout.flush();
    expect($state.go).toHaveBeenCalledWith('huronfeatures.aabuilder', {
      aaName: '',
      aaTemplate: 'template1'
    });
    expect(modalFake.close).toHaveBeenCalledWith(item);
  });

  it("ok function call results in closing the Modal with the value chosen when item is 2", function () {
    var item = {
      id: 2
    };
    $scope.ok(item);
    $scope.$apply();
    $timeout.flush();
    expect($state.go).toHaveBeenCalledWith('huronfeatures.aabuilder', {});
    expect(modalFake.close).toHaveBeenCalledWith(item);
  });

  it("cancel function call results in dismissing the Modal.", function () {
    $scope.cancel();
    expect(modalFake.dismiss).toHaveBeenCalledWith("cancel");
  });
});
