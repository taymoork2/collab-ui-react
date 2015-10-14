'use strict';

describe('Controller: NewFeatureModalCtrl', function () {

  beforeEach(module('Huron'));

  var controller, $scope, modalDirective;
  var modalFake = {
    close: jasmine.createSpy('modalInstance.close'),
    dismiss: jasmine.createSpy('modalInstance.dismiss')
  };

  beforeEach(inject(function ($rootScope, $controller, $state) {
    $scope = $rootScope.$new();
    spyOn($state, 'go');
    controller = $controller('NewFeatureModalCtrl', {
      $scope: $scope,
      $modalInstance: modalFake
    });
  }));

  it("has features data for AA, HG and CP with l10n key.", function () {
    expect($scope.features.length).toEqual(2);
    expect($scope.features[0].code).toEqual("autoAttendant.code");
    expect($scope.features[1].code).toEqual("huntGroup.code");
    //expect($scope.features[2].code).toEqual("callPark.code");
  });

  it("ok function call results in closing the Modal with the value chosen.", function () {
    var code = "HG";
    $scope.ok(code);
    expect(modalFake.close).toHaveBeenCalledWith(code);
  });

  it("cancel function call results in dismissing the Modal.", function () {
    $scope.cancel();
    expect(modalFake.dismiss).toHaveBeenCalledWith("cancel");
  });
});
