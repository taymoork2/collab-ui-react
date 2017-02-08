'use strict';

describe('Controller: NewCareFeatureModalCtrl', function () {

  beforeEach(angular.mock.module('Sunlight'));

  var $scope, Authinfo, $q, FeatureToggleService, $timeout;
  var modalFake = {
    close: jasmine.createSpy('modalInstance.close'),
    dismiss: jasmine.createSpy('modalInstance.dismiss')
  };

  beforeEach(inject(function ($rootScope, $controller, $state, _$timeout_, _$q_, _Authinfo_, _FeatureToggleService_) {
    $scope = $rootScope.$new();
    $timeout = _$timeout_;
    $q = _$q_;
    Authinfo = _Authinfo_;
    FeatureToggleService = _FeatureToggleService_;
    spyOn($state, 'go');
    spyOn(Authinfo, 'isCare').and.returnValue(true);

    $controller('NewCareFeatureModalCtrl', {
      $scope: $scope,
      $modalInstance: modalFake,
      $q: $q
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

  it("feature list to have care - chat and callback", function () {
    expect($scope.features.length).toEqual(2);
  });

  it("feature list to have care - chat and callback only if feature toggle for chat plus callback is false", function () {
    spyOn(FeatureToggleService, 'atlasCareChatPlusCallbackTrialsGetStatus').and.returnValue($q.resolve(false));
    expect($scope.features.length).toEqual(2);
  });

  it("feature list to have care - chat, callback and chatPlusCallback if feature toggle for chat plus callback is true", function () {
    spyOn(FeatureToggleService, 'atlasCareChatPlusCallbackTrialsGetStatus').and.returnValue($q.resolve(true));
    $timeout(function () {
      expect($scope.features.length).toEqual(3);
    }, 100);
    $timeout.flush();
  });

});
