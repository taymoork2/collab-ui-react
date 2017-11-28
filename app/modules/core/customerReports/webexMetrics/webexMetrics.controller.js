(function () {
  'use strict';

  angular
    .module('core.customer-reports')
    .controller('WebExMetricsCtrl', WebExMetricsCtrl);

  /* @ngInject */
  function WebExMetricsCtrl(
    $q,
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
    FeatureToggleService,
    WebexMetricsService
  ) {
    var vm = this;

    vm.metrics = 'metrics';
    vm.search = 'search';
    vm.MEI = 'MEI';
    vm.metricsSiteOptions = [];
    vm.metricsOptions = [];
    vm.metricsSelected = '';
    vm.webexMetrics = {};
    vm.isNoData = false;
    vm.selectEnable = false;
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

    var selectEnable = $scope.$on('selectEnable', function (data) {
      vm.selectEnable = data.defaultPrevented;
    });
    var $stateChangeStart = $rootScope.$on('$stateChangeStart', onStateChangeStart);
    var $stateChangeSuccess = $rootScope.$on('$stateChangeSuccess', onStateChangeSuccess);
    $scope.$on('$destroy', onDestory);

    vm.$state = $state;
    vm.init = init;
    vm.goMetricsInitState = goMetricsInitState;
    vm.generateMetrics = generateMetrics;
    vm.loadMetricsReport = loadMetricsReport;
    vm.onStateChangeStart = onStateChangeStart;
    vm.onStateChangeSuccess = onStateChangeSuccess;
    vm.updateWebexMetrics = updateWebexMetrics;
    vm.updateIframe = updateIframe;
    vm.features = [];

    init();

    function initialSites(isUsedState) {
      WebexMetricsService.getMetricsSites().then(function (sites) {
        var webexSiteUrls = sites;
        vm.metricsSiteOptions = webexSiteUrls;

        promisChainDone(isUsedState);
      });
    }

    function promisChainDone(isUsedState) {
      var stateParamsSiteUrl = $stateParams.siteUrl;
      var stateParamsSiteUrlIndex = vm.metricsSiteOptions.indexOf(stateParamsSiteUrl);

      var storageMetricsSiteUrl = LocalStorage.get('webexMetricsSiteUrl');
      var storageMetricsSiteUrlIndex = vm.metricsSiteOptions.indexOf(storageMetricsSiteUrl);

      var metricsSelected = '';
      if (-1 !== stateParamsSiteUrlIndex) {
        metricsSelected = stateParamsSiteUrl;
      } else if (-1 !== storageMetricsSiteUrlIndex) {
        metricsSelected = storageMetricsSiteUrl;
      } else {
        metricsSelected = vm.metricsSiteOptions[0];
      }
      vm.metricsSelected = metricsSelected;
      if (isUsedState) {
        goMetricsState();
      } else {
        updateWebexMetrics();
      }
    }

    function init() {
      setViewHeight();
      var promises = {
        isMetricsOn: FeatureToggleService.webexMetricsGetStatus(),
        // hasClassicSite: WebexMetricsService.hasClassicEnabled(),
        hasMetricsSite: WebexMetricsService.hasMetricsSites(),
        isMEIOn: FeatureToggleService.webexMEIGetStatus(),
        isSystemOn: FeatureToggleService.webexSystemGetStatus(),
      };
      $q.all(promises).then(function (features) {
        vm.features = features;
        if (features.isMetricsOn && features.hasMetricsSite) {
          vm.metricsOptions.push({
            title: 'reportsPage.webexMetrics.metrics',
            state: 'reports.webex-metrics.metrics',
          },
          {
            title: 'reportsPage.webexMetrics.diagnostics',
            state: 'reports.webex-metrics.diagnostics',
          });
        }
        if (features.isMEIOn) {
          vm.metricsOptions.push({
            title: 'reportsPage.webexMetrics.MEI',
            state: 'reports.webex-metrics.MEI',
          });
        }
        if (features.isSystemOn) {
          vm.metricsOptions.push({
            title: 'reportsPage.webexMetrics.System',
            state: 'reports.webex-metrics.system',
          });
        }
        /*$log.log('-----------webexMetricsController features ------------------');
        $log.log(features);
        if (features.isMetricsOn && features.hasClassicSite) {
          vm.metricsOptions.push({
            title: 'reportsPage.webexMetrics.classic',
            state: 'reports.webex-metrics.classic',
          });
        }*/
        if (features.isMetricsOn && $scope.header.isWebexClassicEnabled) {
          vm.metricsOptions.push({
            title: 'reportsPage.webexMetrics.classic',
            state: 'reports.webex-metrics.classic',
          });
        }
        $timeout(goMetricsInitState);
      });

      Analytics.trackReportsEvent(Analytics.sections.REPORTS.eventNames.CUST_WEBEX_REPORT);
    }

    function generateMetrics(isUsedState) {
      checkProPackPurchased().then(function () {
        initialSites(isUsedState);
      });
    }

    function setViewHeight() {
      if (Authinfo.isReadOnlyAdmin()) {
        vm.iframeContainerClass = 'webexMetricsContentWithReadOnly';
      } else {
        vm.iframeContainerClass = 'webexMetricsContent';
      }
    }

    function checkProPackPurchased() {
      var deferred = $q.defer();
      ProPackService.hasProPackPurchased().then(function (isPurchased) {
        if (isPurchased) {
          vm.webexMetrics.views[0] = {
            view: 'Premium',
            appName: 'premium_webex_v1',
          };
          vm.reportView = vm.webexMetrics.views[0];
        }
        deferred.resolve(isPurchased);
      },
      function (response) {
        deferred.reject(response);
      });
      return deferred.promise;
    }

    function setStorageSite(siteUrl) {
      var storageMetricsSiteUrl = LocalStorage.get('webexMetricsSiteUrl');

      if (siteUrl !== storageMetricsSiteUrl) {
        LocalStorage.put('webexMetricsSiteUrl', siteUrl);
      }
    }

    function resetSiteSelector() {
      var storageMetricsSiteUrl = LocalStorage.get('webexMetricsSiteUrl');
      var metricsSelected = vm.metricsSelected;

      if (metricsSelected !== storageMetricsSiteUrl && !_.isEmpty(storageMetricsSiteUrl)) {
        vm.metricsSelected = storageMetricsSiteUrl;
      }
    }

    function updateWebexMetrics() {
      $scope.$broadcast('unfreezeState', false);

      if (vm.selectEnable && (_.isNull(vm.metricsSelected) || _.isUndefined(vm.metricsSelected))) {
        vm.isNoData = true;
        $scope.$broadcast('unfreezeState', true);
      } else {
        vm.loadMetricsReport();
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
        siteUrl: vm.metricsSelected.toLowerCase(),
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
          setStorageSite(vm.metricsSelected);
          loadUrlAndIframe(QlikMashupChartsUrl);
        }
      })
        .catch(function (error) {
          resetSiteSelector();
          $scope.$broadcast('unfreezeState', true);
          Notification.errorWithTrackingId(error, 'reportsPage.webexMetrics.errorRequest');
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
    }

    function onStateChangeSuccess(event, toState, toParams, fromState) {
      if (toState.name === 'reports.webex-metrics.metrics') {
        vm.selectEnable = true;
        if (fromState.name.indexOf('reports.webex-metrics.classic') === 0) {
          vm.generateMetrics(false);
        } else {
          vm.updateWebexMetrics();
        }
      } else if (toState.name === 'reports.webex-metrics.MEI') {
        vm.selectEnable = false;
        vm.updateWebexMetrics();
      } else if (toState.name === 'reports.webex-metrics.classic') {
        vm.selectEnable = false;
      }
    }

    function goMetricsInitState() {
      var metricsDefaultLink = vm.metricsOptions[0].state;
      if (_.endsWith(metricsDefaultLink, '.metrics')) {
        generateMetrics(true);
      } else {
        $state.go(metricsDefaultLink);
      }
    }

    function goMetricsState() {
      $state.go('reports.webex-metrics.metrics');
    }

    function onDestory() {
      selectEnable();
      $stateChangeStart();
      $stateChangeSuccess();
    }
  }
})();
