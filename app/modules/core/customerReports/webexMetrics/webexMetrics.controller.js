(function () {
  'use strict';

  angular
    .module('core.customer-reports')
    .controller('WebExMetricsCtrl', WebExMetricsCtrl);

  /* @ngInject */
  function WebExMetricsCtrl(
    $sce,
    $scope,
    $stateParams,
    $timeout,
    $rootScope,
    $state,
    Analytics,
    Authinfo,
    LocalStorage,
    Notification,
    ProPackService,
    QlikService,
    FeatureToggleService
  ) {
    var vm = this;

    vm.metrics = 'metrics';
    vm.search = 'search';
    vm.classic = 'classic';
    vm.MEI = 'MEI';
    vm.webexOptions = [];
    vm.webexSelected = null;
    vm.webexMetrics = {};
    vm.isNoData = false;
    vm.selectEnable = true;
    vm.reportType = 'WebEx';
    vm.env = {
      int: 'integration',
      prod: 'prod',
    };

    vm.webexMetrics.views = [
      {
        view: 'Base',
        appName: 'basic_webex_v1',
      },
      {
        view: 'MEI',
        appName: 'mei',
      },
    ];
    vm.reportView = vm.webexMetrics.views[0];
    vm.metricsOptions = [
      {
        title: 'reportsPage.webexMetrics.metrics',
        state: 'reports.webex-metrics.metrics',
      },
      {
        title: 'reportsPage.webexMetrics.diagnostics',
        state: 'reports.webex-metrics.diagnostics',
      },
    ];

    function featureToggleoOnMEI() {
      vm.metricsOptions.push({
        title: 'reportsPage.webexMetrics.MEI',
        state: 'reports.webex-metrics.MEI',
      });
    }

    var selectEnable = $scope.$on('selectEnable', function (data) {
      vm.selectEnable = data.defaultPrevented;
    });
    var $stateChangeStart = $rootScope.$on('$stateChangeStart', onStateChangeStart);
    var $stateChangeSuccess = $rootScope.$on('$stateChangeSuccess', onStateChangeSuccess);
    $scope.$on('$destroy', onDestory);

    vm.$state = $state;
    vm.init = init;
    vm.checkClassic = checkClassic;
    vm.goMetricsState = goMetricsState;
    vm.loadMetricsReport = loadMetricsReport;
    vm.onStateChangeStart = onStateChangeStart;
    vm.onStateChangeSuccess = onStateChangeSuccess;
    vm.updateWebexMetrics = updateWebexMetrics;
    vm.updateIframe = updateIframe;

    init();

    function generateWebexMetricsUrl() {
      var webexSiteUrls = $scope.header.webexSiteList;
      vm.webexOptions = webexSiteUrls;

      promisChainDone();
    }

    function promisChainDone() {
      var stateParamsSiteUrl = $stateParams.siteUrl;
      var stateParamsSiteUrlIndex = vm.webexOptions.indexOf(stateParamsSiteUrl);

      var storageMetricsSiteUrl = LocalStorage.get('webexMetricsSiteUrl');
      var storageMetricsSiteUrlIndex = vm.webexOptions.indexOf(storageMetricsSiteUrl);

      var webexSelected = null;
      if (-1 !== stateParamsSiteUrlIndex) {
        webexSelected = stateParamsSiteUrl;
      } else if (-1 !== storageMetricsSiteUrlIndex) {
        webexSelected = storageMetricsSiteUrl;
      } else {
        webexSelected = vm.webexOptions[0];
      }
      vm.webexSelected = webexSelected;
      $timeout(goMetricsState);
      updateWebexMetrics();
    }

    function init() {
      checkProPackPurchased();
      checkClassic();
      checkWebexMEI();
      generateWebexMetricsUrl();
      Analytics.trackReportsEvent(Analytics.sections.REPORTS.eventNames.CUST_WEBEX_REPORT);
    }

    function checkProPackPurchased() {
      ProPackService.hasProPackPurchased().then(function (isPurchased) {
        if (isPurchased) {
          vm.webexMetrics.views[0] = {
            view: 'Premium',
            appName: 'premium_webex_v1',
          };
          vm.reportView = vm.webexMetrics.views[0];
        }
      });
    }

    function checkClassic() {
      vm.isWebexMetricsEnabled = $scope.header.isWebexMetricsEnabled;
      vm.isWebexClassicEnabled = $scope.header.isWebexClassicEnabled;
      if (vm.isWebexMetricsEnabled && vm.isWebexClassicEnabled) {
        vm.metricsOptions.push({
          title: 'reportsPage.webexMetrics.classic',
          state: 'reports.webex-metrics.classic',
        });
      }
    }

    function checkWebexMEI() {
      var userId = Authinfo.getUserId();
      FeatureToggleService.getFeaturesForUser(userId, FeatureToggleService.features.webexMEI).then(function (response) {
        _.forEach(response.developer, function (value) {
          if (value.key === FeatureToggleService.features.webexMEI && value.val === true) {
            featureToggleoOnMEI();
          }
        });
      });
    }

    function updateWebexMetrics() {
      var storageMetricsSiteUrl = LocalStorage.get('webexMetricsSiteUrl');
      var webexSelected = vm.webexSelected;
      $scope.$broadcast('unfreezeState', false);

      if (webexSelected !== storageMetricsSiteUrl) {
        LocalStorage.put('webexMetricsSiteUrl', webexSelected);
      }

      if (!(_.isNull(vm.webexSelected) || _.isUndefined(vm.webexSelected))) {
        vm.isNoData = false;
        vm.loadMetricsReport();
      } else {
        vm.isNoData = true;
      }
    }

    function loadMetricsReport() {
      function loadUrlAndIframe(url) {
        vm.metricsOptions[0].url = url;
        updateIframe();
      }

      if ($state.current.name === 'reports.webex-metrics.MEI') {
        vm.reportView = vm.webexMetrics.views[1];
      } else {
        vm.reportView = vm.webexMetrics.views[0];
      }

      var userInfo = {
        org_id: Authinfo.getOrgId(),
        siteUrl: vm.webexSelected.toLowerCase(),
        email: Authinfo.getPrimaryEmail(),
      };

      var viewType = _.get(vm, 'reportView.view');
      var getWebExReportData = _.get(QlikService, 'getReportQBSUrl');

      if (!_.isFunction(getWebExReportData)) {
        return;
      }
      getWebExReportData(vm.reportType, viewType, userInfo).then(function (data) {
        if (!_.isUndefined(data)) {
          vm.webexMetrics.appData = {
            ticket: data.ticket,
            appId: data.appName,
            node: data.host,
            qrp: data.qlik_reverse_proxy,
            persistent: data.isPersistent,
            vID: data.siteId,
          };
          //TODO remove this 'if' segment, if QBS can handle this parameter
          if (vm.webexMetrics.appData.persistent === 'false') {
            vm.webexMetrics.appData.appId = vm.reportView.appName;
          }
          var QlikMashupChartsUrl = _.get(QlikService, 'getWebExReportAppfor' + viewType + 'Url')(vm.webexMetrics.appData.qrp);
          vm.webexMetrics.appData.url = QlikMashupChartsUrl;

          loadUrlAndIframe(QlikMashupChartsUrl);
        }
      })
        .catch(function (error) {
          $scope.$broadcast('unfreezeState', true);
          Notification.errorWithTrackingId(error, 'common.error');
        });
    }

    function updateIframe() {
      var iframeUrl = vm.webexMetrics.appData.url;
      var data = {
        trustIframeUrl: $sce.trustAsResourceUrl(iframeUrl),
        appId: vm.webexMetrics.appData.appId,
        QlikTicket: vm.webexMetrics.appData.ticket,
        node: vm.webexMetrics.appData.node,
        persistent: vm.webexMetrics.appData.persistent,
        vID: vm.webexMetrics.appData.vID,
      };
      $scope.$broadcast('updateIframe', iframeUrl, data);
    }

    function onStateChangeStart(event, toState, toParams, fromState) {
      var isSubState = fromState.name.indexOf('reports.webex-metrics.') === 0;

      if (isSubState && toState.name === 'reports.webex-metrics') {
        event.preventDefault();
      }

      if (isSubState) {
        toParams.siteUrl = vm.webexSelected;
      }
    }

    function onStateChangeSuccess(event, toState, toParams, fromState) {
      if (toState.name === 'reports.webex-metrics.metrics') {
        vm.selectEnable = true;
        if (fromState.name.indexOf('reports.webex-metrics.') === 0) {
          vm.updateWebexMetrics();
        }
      } else if (toState.name === 'reports.webex-metrics.MEI') {
        vm.selectEnable = false;
        if (fromState.name.indexOf('reports.webex-metrics.') === 0) {
          vm.updateWebexMetrics();
        }
      } else if (toState.name === 'reports.webex-metrics.classic') {
        vm.selectEnable = false;
      }
    }

    function goMetricsState() {
      if ($state.current.name === 'reports.webex-metrics') {
        $state.go('reports.webex-metrics.metrics');
      }
    }

    function onDestory() {
      selectEnable();
      $stateChangeStart();
      $stateChangeSuccess();
    }
  }
})();
