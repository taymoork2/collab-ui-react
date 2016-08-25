'use strict';

describe('Controller: AATypeSelectCtrl', function () {

  beforeEach(angular.mock.module('Huron'));

  var $scope, $state, $timeout;
  var modalFake = {
    close: jasmine.createSpy('modalInstance.close'),
    dismiss: jasmine.createSpy('modalInstance.dismiss')
  };

  beforeEach(inject(function ($rootScope, $controller, _$state_, _$timeout_, Orgservice) {
    $scope = $rootScope.$new();
    $state = _$state_;
    $timeout = _$timeout_;
    spyOn($state, 'go');
    spyOn(Orgservice, 'getOrg').and.callFake(function (callback) {
      callback({}, 200);
    });
    $controller('AATypeSelectCtrl', {
      $scope: $scope,
      $modalInstance: modalFake,
      $timeout: $timeout,
      $state: $state
    });
  }));

  it("ok function call results in closing the Modal with the value chosen when item is 1", function () {
    var item = {
      name: 'Basic'
    };
    $scope.ok(item);
    $scope.$apply();
    $timeout.flush();
    expect($state.go).toHaveBeenCalledWith('huronfeatures.aabuilder', {
      aaName: '',
      aaTemplate: 'Basic'
    });
    expect(modalFake.close).toHaveBeenCalledWith(item);
  });

  it("ok function call results in closing the Modal with the value chosen when item is 2", function () {
    var item = {
      name: 'Custom'
    };
    $scope.ok(item);
    $scope.$apply();
    $timeout.flush();
    expect($state.go).toHaveBeenCalledWith('huronfeatures.aabuilder', {
      aaName: '',
      aaTemplate: 'Custom'
    });
    expect(modalFake.close).toHaveBeenCalledWith(item);
  });

  it("cancel function call results in dismissing the Modal.", function () {
    $scope.cancel();
    expect(modalFake.dismiss).toHaveBeenCalledWith("cancel");
  });
});
