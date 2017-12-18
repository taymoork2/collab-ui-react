'use strict';

describe('Component: metricsFrame', function () {
  var $scope, $timeout, controller, $componentCtrl;
  var iframeUrl = 'qlik-load';
  var testData = {
    trustIframeUrl: 'qlik-load',
    appId: '123-test-app-id',
    QlikTicket: '123-test-ticket',
    node: '123-node',
    persistent: false,
    vID: '123-vid',
  };

  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('core.customer-reports'));
  beforeEach(inject(dependencies));
  beforeEach(initSpies);
  beforeEach(initController);

  function dependencies(_$rootScope_, _$timeout_, _$componentController_) {
    $scope = _$rootScope_.$new();
    $timeout = _$timeout_;
    $componentCtrl = _$componentController_;
  }

  function initSpies() {

  }

  function initController() {
    controller = $componentCtrl('metricsFrame', { $scope: $scope });
  }

  it('should set the iframeLoaded state to false when send the unfreezeState with false', function () {
    $scope.$broadcast('updateIframe', iframeUrl, testData);
    $timeout.flush();
    $scope.$broadcast('unfreezeState', false);
    expect(controller.isIframeLoaded).toBeFalsy();
  });

  it('should set the iframeLoaded state to false when send the messageHandle with false', function () {
    controller.messageHandle({ data: 'unfreeze' });
    expect(controller.isIframeLoaded).toBeTruthy();
  });

  it('should set the iframeLoaded state to true when send the unfreezeState with true', function () {
    $scope.$broadcast('unfreezeState', true);
    expect(controller.isIframeLoaded).toBeTruthy();
  });

  it('should register/unregister event handlers over lifecycle', function () {
    var listeners = $scope.$$listeners;
    expect(_.isFunction(listeners['updateIframe'][0])).toBeTruthy();
    expect(_.isFunction(listeners['unfreezeState'][0])).toBeTruthy();
    controller.$onDestroy();
    expect(_.isFunction(listeners['updateIframe'][0])).toBeFalsy();
    expect(_.isFunction(listeners['unfreezeState'][0])).toBeFalsy();
  });
});
