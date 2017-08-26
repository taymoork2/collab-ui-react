(function () {
  'use strict';

  angular
    .module('core.customer-reports')
    .controller('WebExMetricsCtrl', WebExMetricsCtrl);

  /* @ngInject */
  function WebExMetricsCtrl(
    $log,
    $sce,
    $scope,
    $stateParams,
    $timeout,
    $window,
    $rootScope,
    $state,
    Analytics,
    Authinfo,
    LocalStorage,
    Notification,
    ProPackService,
    QlikService,
    Userservice
  ) {
    var vm = this;

    vm.metrics = 'metrics';
    vm.search = 'search';
    vm.classic = 'classic';
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
        view: 'Premium',
        appName: 'premium_webex_v1',
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
      {
        title: 'reportsPage.webexMetrics.classic',
        state: 'reports.webex-metrics.classic',
      },
    ];

    var selectEnable = $scope.$on('selectEnable', function (data) {
      vm.selectEnable = data.defaultPrevented;
    });
    var $stateChangeStart = $rootScope.$on('$stateChangeStart', onStateChangeStart);
    var $stateChangeSuccess = $rootScope.$on('$stateChangeSuccess', onStateChangeSuccess);
    $scope.$on('$destroy', onDestory);

    vm.$state = $state;
    vm.init = init;
    vm.goMetricsState = goMetricsState;
    vm.loadMetricsReport = loadMetricsReport;
    vm.onStateChangeStart = onStateChangeStart;
    vm.onStateChangeSuccess = onStateChangeSuccess;
    vm.updateWebexMetrics = updateWebexMetrics;
    vm.updateIframe = updateIframe;

    init();

    function onlyUnique(value, index, self) {
      return self.indexOf(value) === index;
    }

    function handleSiteForReadOnly(siteUrls) {
      var sites = [];
      _.each(siteUrls, function (site) {
        sites.push(_.replace(site, /#.*$/g, ''));
      });
      return sites;
    }

    function getUniqueWebexSiteUrls(siteUrls) {
      return siteUrls.filter(onlyUnique);
    }

    function generateWebexMetricsUrl(trainSites) {
      var webexSiteUrls = handleSiteForReadOnly(trainSites);
      webexSiteUrls = getUniqueWebexSiteUrls(webexSiteUrls);

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
      ProPackService.hasProPackPurchased().then(function (isPurchased) {
        if (isPurchased) {
          vm.reportView = vm.webexMetrics.views[1];
        }
        updateWebexMetrics();
      });
    }

    function init() {
      Userservice.getUser(
        'me',
        function (data) {
          if (data.success) {
            var trainSites = [];
            if (data.emails) {
              Authinfo.setEmails(data.emails);
              var adminTrainSiteNames = _.get(data, 'adminTrainSiteNames', []);
              var linkedTrainSiteNames = _.get(data, 'linkedTrainSiteNames', []);
              trainSites = _.concat(adminTrainSiteNames, linkedTrainSiteNames);
              generateWebexMetricsUrl(trainSites);
            }
          }
        }
      );
      Analytics.trackReportsEvent(Analytics.sections.REPORTS.eventNames.CUST_WEBEX_REPORT);
    }

    function updateWebexMetrics() {
      var storageMetricsSiteUrl = LocalStorage.get('webexMetricsSiteUrl');
      var webexSelected = vm.webexSelected;

      if (webexSelected !== storageMetricsSiteUrl) {
        LocalStorage.put('webexMetricsSiteUrl', webexSelected);
      }

      if (!_.isNull(vm.webexSelected)) {
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

    $window.iframeLoaded = function (iframeId) {
      $log.log('Iframe loaded ' + iframeId);
    };

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
          vm.loadMetricsReport();
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
