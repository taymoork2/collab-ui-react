require('./metricsFrame.scss');

(function () {
  'use strict';

  angular
    .module('core.partner-reports')
    .component('sparkPartnerMetricsFrame', {
      template: require('./metricsFrame.tpl.html'),
      controller: metricsFrameController,
      bindings: {
        onIframeLoad: '&',
      },
    });

  /* @ngInject */
  function metricsFrameController($log, $rootScope, $sce, $scope, $timeout, $window, LoadingTimeout) {
    var vm = this;
    var eventListeners = [];
    vm.isIframeLoaded = false;
    vm.qlikReportUrl = $sce.trustAsResourceUrl('about: blank');
    vm.messageHandle = messageHandle;
    vm.setQlikUrls = setQlikUrls;

    $window.addEventListener('message', messageHandle, true);

    eventListeners.push($scope.$on('updateIframe', updateIframe), $scope.$on('unfreezeState', unfreezeState));

    function updateIframe(event, iframeUrl, data) {
      vm.data = data;
      $timeout(
        function loadIframe() {
          startLoadReport();
          vm.qlikReportUrl = setQlikUrls(iframeUrl, data);
        },
        0
      );
    }

    function setQlikUrls(iframeUrl, data) {
      var qlikUrls = data.trustIframeUrl;
      var params = [];
      if (_.isObject(data) && !_.isEmpty(data)) {
        _.forEach(data, function (value, key) {
          if (key !== 'trustIframeUrl') {
            params.push(key + '=' + value);
          }
        });
        qlikUrls += ('?' + params.join('&'));
      }
      return $sce.trustAsResourceUrl(qlikUrls);
    }

    function messageHandle(event) {
      if (event.data === 'unfreeze') {
        $log.log('Unfreeze message received.');
        unfreezeState(null, true);
        $timeout.cancel(vm.startLoadReportTimer);
      }
    }

    function unfreezeState(event, isLoaded) {
      if (event) {
        vm.isIframeLoaded = isLoaded;
      } else {
        $scope.$apply(function () {
          vm.isIframeLoaded = isLoaded;
        });
      }
    }

    function startLoadReport() {
      vm.startLoadReportTimer = $timeout(
        function () {
          unfreezeState(null, true);
        },
        LoadingTimeout
      );
    }

    this.$onDestroy = function () {
      if (vm.startLoadReportTimer) {
        $timeout.cancel(vm.startLoadReportTimer);
      }
      while (!_.isEmpty(eventListeners)) {
        _.attempt(eventListeners.pop());
      }
      $window.removeEventListener('message', messageHandle, true);
    };
  }
})();
