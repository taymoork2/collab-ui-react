'use strict';

describe('controller: WebExMetricsCtrl', function () {
  var $controller, $sce, $window, UrlConfig, controller;

  beforeEach(angular.mock.module('Core'));
  beforeEach(inject(dependencies));
  beforeEach(initController);
  beforeEach(initSpies);
  afterEach(destructDI);

  function dependencies(_$controller_, _$sce_, _$window_, _UrlConfig_) {
    $controller = _$controller_;
    $sce = _$sce_;
    $window = _$window_;
    UrlConfig = _UrlConfig_;
  }

  function initController() {
    controller = $controller('WebExMetricsCtrl', {
      $sce: $sce,
      UrlConfig: UrlConfig,
      $window: $window,
    });
  }

  function destructDI() {
    $controller = $sce = $window = UrlConfig = controller = undefined;
  }

  function initSpies() {
    spyOn($sce, 'trustAsResourceUrl');
    spyOn(UrlConfig, 'getWebexMetricsUrl');
  }

  it('frame load, should have not been loaded', function () {
    expect(controller.isIframeLoaded).toBeFalsy();
  });

  it('getTrustUrl, should call getWebexMetricsUrl and trustAsResourceUrl', function () {
    controller.getTrustUrl();
    expect(UrlConfig.getWebexMetricsUrl).toHaveBeenCalled();
    expect($sce.trustAsResourceUrl).toHaveBeenCalled();
  });
});
