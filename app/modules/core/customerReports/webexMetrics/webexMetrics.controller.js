(function () {
  'use strict';

  angular
    .module('Core')
    .controller('WebExMetricsCtrl', WebExMetricsCtrl);

  /* @ngInject */
  function WebExMetricsCtrl(
    $sce, $window, UrlConfig
  ) {
    var vm = this;

    vm.isIframeLoaded = false;
    vm.getTrustUrl = getTrustUrl;
    vm.metricsUrl = getTrustUrl();
    $window.iframeLoaded = iframeLoaded;

    function getTrustUrl() {
      return $sce.trustAsResourceUrl(UrlConfig.getWebexMetricsUrl());
    }

    function iframeLoaded(iframeId) {
      var currScope = angular.element(iframeId).scope();
      var phase = currScope.$$phase;

      if (!phase) {
        currScope.$apply(function () {
          vm.isIframeLoaded = true;
        });
      }
    }
  }
})();
