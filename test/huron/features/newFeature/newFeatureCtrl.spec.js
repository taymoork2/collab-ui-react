'use strict';

describe('Controller: FeatureCtrl', function () {

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

    controller = $controller('FeaturesCtrl', {
      $modal: $modal
    });

    spyOn($modal, 'open').and.returnValue(fakeModal);
  }));

  it("FeatureCtrl.feature is set by NewFeatureCtrl when input provided from Modal dialog.", function () {
    controller.newFeature();
    fakeModal.close("AA");
    expect(controller.feature).toEqual("AA");
  });

  it("FeatureCtrl.feature is set empty by NewFeatureCtrl when Modal dialog dismissed.", function () {
    controller.newFeature();
    fakeModal.dismiss('cancel');
    expect(controller.feature).toEqual("");
  });
});
