(function () {
  'use strict';

  angular
    .module('core.customer-reports')
    .component('metricsFrame', {
      templateUrl: 'modules/core/customerReports/webexMetrics/metrics/metricsFrame.tpl.html',
      controller: metricsFrameController,
    });

  /* @ngInject */
  function metricsFrameController($log, $rootScope, $scope, $timeout, $window) {
    var vm = this;
    vm.isIframeLoaded = false;

    $window.addEventListener('message', messageHandle, true);
    var stateChangeStart = $rootScope.$on('$stateChangeStart', onStateChangeStart);

    $scope.$on('updateIframe', function (event, iframeUrl, data) {
      vm.data = data;
      $timeout(
        function loadIframe() {
          var submitFormBtn = $window.document.getElementById('submitFormBtn');
          submitFormBtn.click();
        }, // loadIframe()
        0
      );
    });

    function onStateChangeStart(event, toState) {
      if (!vm.isIframeLoaded && toState.name.substr(0, 7) === 'reports') {
        event.preventDefault();
      }
    }

    function messageHandle(event) {
      var iframeEle = angular.element('#webexMetricsIframeContainer');
      var currScope = iframeEle.scope();

      if (event.data === 'unfreeze') {
        $log.log('Unfreeze message received.');
        currScope.$apply(function () {
          vm.isIframeLoaded = true;
        });
      }
    }

    this.$onDestroy = function () {
      stateChangeStart();
      $window.removeEventListener('message', messageHandle, true);
    };
  }
})();
