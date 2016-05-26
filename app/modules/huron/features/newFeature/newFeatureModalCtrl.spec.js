'use strict';

describe('Controller: NewFeatureModalCtrl', function () {

  beforeEach(module('Huron'));

  var controller, $scope, $q;
  var FeatureToggleService;
  var modalFake = {
    close: jasmine.createSpy('modalInstance.close'),
    dismiss: jasmine.createSpy('modalInstance.dismiss')
  };

  beforeEach(inject(function ($rootScope, $controller, $state, _$q_, _FeatureToggleService_) {
    $scope = $rootScope.$new();
    $q = _$q_;

    FeatureToggleService = _FeatureToggleService_;

    spyOn($state, 'go');
    spyOn(FeatureToggleService, 'supports').and.returnValue($q.when(true));

    controller = $controller('NewFeatureModalCtrl', {
      $scope: $scope,
      $modalInstance: modalFake
    });
  }));

  //TODO: re-enable after feature toggles are removed
  xit("has features data for AA, HG and CP with l10n key.", function () {
    expect($scope.features.length).toEqual(1);
    expect($scope.autoAttendant.code).toEqual("autoAttendant.code");
    expect($scope.huntGroup.code).toEqual("huronHuntGroup.code");
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
