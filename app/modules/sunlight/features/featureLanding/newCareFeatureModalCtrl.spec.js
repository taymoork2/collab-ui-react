'use strict';

describe('Controller: NewCareFeatureModalCtrl', function () {

  beforeEach(angular.mock.module('Sunlight'));

  var $scope, Authinfo;
  var modalFake = {
    close: jasmine.createSpy('modalInstance.close'),
    dismiss: jasmine.createSpy('modalInstance.dismiss')
  };

  beforeEach(inject(function ($rootScope, $controller, $state, _Authinfo_) {
    $scope = $rootScope.$new();
    Authinfo = _Authinfo_;

    spyOn($state, 'go');
    spyOn(Authinfo, 'isCare').and.returnValue(true);

    $controller('NewCareFeatureModalCtrl', {
      $scope: $scope,
      $modalInstance: modalFake
    });
  }));

  afterEach(function () {
    Authinfo = undefined;
  });

  it("ok function call results in closing the care new feature Modal with the value chosen.", function () {
    var code = "Ch";
    $scope.ok(code);
    expect(modalFake.close).toHaveBeenCalledWith(code);
  });

  it("cancel function call results in dismissing the care new feature Modal.", function () {
    $scope.cancel();
    expect(modalFake.dismiss).toHaveBeenCalledWith("cancel");
  });

  it("feature list to have care", function () {
    expect($scope.features.length).toEqual(1);
  });

});
