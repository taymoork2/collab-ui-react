'use strict';

describe('Controller : HDSSettingsController', function () {
  var $controller, hdsCtrlr, Notification, $state, $scope;

  beforeEach(angular.mock.module('HDS'));
  beforeEach(angular.mock.module('Core'));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);


  function dependencies(_$controller_, _Notification_, _$state_, _$rootScope_) {
    $controller = _$controller_;
    Notification = _Notification_;
    $state = _$state_;
    $scope = _$rootScope_;
  }
  function initSpies() {
    spyOn(Notification, 'success');
    spyOn($state, 'go');
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
});
