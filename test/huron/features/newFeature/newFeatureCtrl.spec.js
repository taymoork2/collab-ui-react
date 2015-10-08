'use strict';

describe('Controller: NewFeatureCtrl', function () {

  beforeEach(module('Huron'));

  var controller, $scope, $modal;

  var fakeModal = {
    result: {
      then: function (okCallback, cancelCallback) {
        this.okCallback = okCallback;
        this.cancelCallback = cancelCallback;
      }
    },
    close: function (item) {
      this.result.okCallback(item);
    },
    dismiss: function (type) {
      this.result.cancelCallback(type);
    }
  };

  beforeEach(inject(function ($rootScope, $controller, _$modal_) {
    $scope = $rootScope.$new();
    $modal = _$modal_;

    controller = $controller('NewFeatureCtrl', {
      $scope: $scope,
      $modal: $modal
    });

    spyOn($modal, 'open').and.returnValue(fakeModal);
  }));

  it("$scope.feature is set empty when NewFeatureCtrl is initialized.", function () {
    expect($scope.feature).toEqual("");
  });

  it("$scope.feature is set by NewFeatureCtrl when input provided from Modal dialog.", function () {
    $scope.open();
    fakeModal.close("AA");
    expect($scope.feature).toEqual("AA");
  });

  it("$scope.feature is set empty by NewFeatureCtrl when Modal dialog dismissed.", function () {
    $scope.open();
    fakeModal.dismiss('cancel');
    expect($scope.feature).toEqual("");
  });
});
