'use strict';

describe('Controller: FeatureCtrl', function () {

  var controller, $scope, $modal, $state, $filter, $timeout, Authinfo, HuntGroupService, CallParkService, Log, Notification;

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

  beforeEach(module('Huron'));
  beforeEach(module('Sunlight'));

  beforeEach(inject(function ($rootScope, $controller, _$modal_, _$state_, _$filter_, _$timeout_, _Authinfo_, _HuntGroupService_, _CallParkService_, _Log_, _Notification_) {
    $scope = $rootScope.$new();
    $modal = _$modal_;
    $state = _$state_;
    $filter = _$filter_;
    $timeout = _$timeout_;
    Authinfo = _Authinfo_;
    HuntGroupService = _HuntGroupService_;
    CallParkService = _CallParkService_;
    Log = _Log_;
    Notification = _Notification_;

    controller = $controller('HuronFeaturesCtrl', {
      $scope: $scope,
      $modal: $modal,
      $state: $state,
      $filter: $filter,
      $timeout: $timeout,
      Authinfo: Authinfo,
      HuntGroupService: HuntGroupService,
      CallParkService: CallParkService,
      Log: Log,
      Notification: Notification
    });

    spyOn($modal, 'open').and.returnValue(fakeModal);
  }));

  it("FeatureCtrl.feature is set by NewFeatureCtrl when input provided from Modal dialog.", function () {
    controller.openModal();
    fakeModal.close("AA");
    expect(controller.feature).toEqual("AA");
  });

  it("FeatureCtrl.feature is set empty by NewFeatureCtrl when Modal dialog dismissed.", function () {
    controller.openModal();
    fakeModal.dismiss('cancel');
    expect(controller.feature).toEqual("");
  });
});
