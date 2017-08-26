(function () {
  'use strict';

  angular
    .module('core.customer-reports')
    .component('metricsFrame', {
      templateUrl: 'modules/core/customerReports/webexMetrics/metrics/metricsFrame.tpl.html',
      controller: metricsFrameController,
    });

  /* @ngInject */
  function metricsFrameController($log, $rootScope, $scope, $timeout, $window, LoadingTimeout) {
    var vm = this;
    vm.isIframeLoaded = false;

    $window.addEventListener('message', messageHandle, true);
    var stateChangeStart = $rootScope.$on('$stateChangeStart', onStateChangeStart);

    $scope.$on('updateIframe', updateIframe);
    $scope.$on('unfreezeState', unfreezeState);

    function updateIframe(event, iframeUrl, data) {
      vm.data = data;
      $timeout(
        function loadIframe() {
          var submitFormBtn = $window.document.getElementById('submitFormBtn');
          submitFormBtn.click();
          startLoadReport();
        },
        0
      );
    }

    function onStateChangeStart(event, toState) {
      if (!vm.isIframeLoaded && toState.name.substr(0, 7) === 'reports') {
        event.preventDefault();
      }
    }

    function messageHandle(event) {
      if (event.data === 'unfreeze') {
        $log.log('Unfreeze message received.');
        unfreezeState(null, true);
        $timeout.cancel(vm.startLoadReportTimer);
      }
    }

    function unfreezeState(event, isLoaded) {
      var iframeEle = angular.element('#webexMetricsIframeContainer');
      var currScope = iframeEle.scope();

      currScope.$apply(function () {
        vm.isIframeLoaded = isLoaded;
      });
    }

    function startLoadReport() {
      vm.startLoadReportTimer = $timeout(
        unfreezeState(true),
        LoadingTimeout
      );
    }

    this.$onDestroy = function () {
      stateChangeStart();
      $window.removeEventListener('message', messageHandle, true);
    };
  }
})();
