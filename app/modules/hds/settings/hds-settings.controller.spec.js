'use strict';

describe('Controller : HDSSettingsController', function () {
  var $controller, hdsCtrlr, Notification, $state, $scope, HDSService, $q;

  beforeEach(angular.mock.module('HDS'));
  beforeEach(angular.mock.module('Core'));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);


  function dependencies(_$controller_, _Notification_, _$state_, _$rootScope_, _HDSService_, _$q_) {
    $controller = _$controller_;
    Notification = _Notification_;
    $state = _$state_;
    $scope = _$rootScope_;
    HDSService = _HDSService_;
    $q = _$q_;
  }
  function initSpies() {
    spyOn(Notification, 'success');
    spyOn($state, 'go');
    spyOn(Notification, 'errorWithTrackingId');
    spyOn(HDSService, 'getOrgSettings').and.callFake(function () {
      return $q.reject();
    });
  }

  function initCtrlr(featureToggle) {
    hdsCtrlr = $controller('HDSSettingsController', { hasHDSFeatureToggle: featureToggle });
  }

  it('must pop notification when changing service status.', function () {
    initCtrlr(true);
    hdsCtrlr.onTrialProduction();
    expect(Notification.success.calls.count()).toBe(1);
  });
  it('must set $state to 404 when feature toggle is not set.', function () {
    initCtrlr(false);
    expect($state.go.calls.count()).toBe(1);
    expect($state.go.calls.argsFor(0)).toEqual(['404']);
  });
  it('must have spinner initially appears and disappears when we get data from the server.', function () {
    initCtrlr(true);

    expect(hdsCtrlr.loading).toBe(true);
    $scope.$apply();
    expect(hdsCtrlr.loading).toBe(false);
  });
  it('must pop notification failure with tracking id in case of failure of retrieving org data.', function () {
    initCtrlr(true);
    $scope.$apply();
    expect(Notification.errorWithTrackingId.calls.count()).toBe(1);
  });
});
