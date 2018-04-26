(function () {
  'use strict';

  angular
    .module('core.customer-reports')
    .controller('WebExMetricsCtrl', WebExMetricsCtrl);

  /* @ngInject */
  function WebExMetricsCtrl(
    $log,
    $location,
    $q,
    $rootScope,
    $sce,
    $scope,
    $state,
    $stateParams,
    $timeout,
    Analytics,
    Authinfo,
    FeatureToggleService,
    Notification,
    LocalStorage,
    ProPackService,
    QlikService,
    WebexMetricsService) {
    var vm = this;

    //varibles
    vm.metricsOptions = [];
    vm.metricsSiteOptions = [];
    vm.metricsSelected = '';

    vm.selectEnable = false;
    vm.isWebexClassicEnabled = false;
    vm.hasClassicTab = false;

    vm.isNoData = false;
    vm.reportType = 'webex';
    vm.features = null;
    vm.isStateReady = false;
    vm.webexMetricsState = 'reports.webex-metrics';
    vm.iframeContainerClass = 'webexMetricsContent';

    vm.webexMetricsViews = '';
    vm.isMetricsInit = false;
    vm.viewType = 'basic';
    vm.webexMetrics = {
      views: {
        metrics: {
          basic: {
            view: 'Basic',
            appName: 'basic_webex_v1',
          },
          premium: {
            view: 'Premium',
            appName: 'premium_webex_v1',
          },
        },
        mei: {
          view: 'MEI',
          appName: 'mei',
        },
        system: {
          view: 'System',
          appName: 'system',
        },
        dashboard: {
          view: 'Dashboard',
          appName: 'dashboard_webex_v1',
        },
        jms: {
          view: 'JMS',
          appName: 'jms_webex_v1',
        },
        jmt: {
          view: 'JMT',
          appName: 'jmt_webex_v1',
        },
      },
      states: {
        metrics: {
          title: 'reportsPage.webexMetrics.metrics',
          state: 'reports.webex-metrics.metrics',
          initialed: false,
        },
        diagnostics: {
          title: 'reportsPage.webexMetrics.diagnostics',
          state: 'reports.webex-metrics.diagnostics',
          initialed: true,
        },
        mei: {
          title: 'reportsPage.webexMetrics.MEI',
          state: 'reports.webex-metrics.MEI',
          initialed: true,
        },
        system: {
          title: 'reportsPage.webexMetrics.system',
          state: 'reports.webex-metrics.system',
          initialed: true,
        },
        classic: {
          title: 'reportsPage.webexMetrics.classic',
          state: 'reports.webex-metrics.classic',
          initialed: true,
        },
        dashboard: {
          title: 'reportsPage.webexMetrics.dashboard',
          state: 'reports.webex-metrics.dashboard',
          initialed: true,
        },
        jms: {
          title: 'reportsPage.webexMetrics.JMS',
          state: 'reports.webex-metrics.jms',
          initialed: true,
        },
        jmt: {
          title: 'reportsPage.webexMetrics.JMT',
          state: 'reports.webex-metrics.jmt',
          initialed: true,
        },
      },
    };

    vm.$state = $state;
    vm.init = init;
    vm.checkClassic = checkClassic;
    vm.checkStatePermission = checkStatePermission;
    vm.goMetricsInitState = goMetricsInitState;
    vm.loadMetricsReport = loadMetricsReport;
    vm.onStateChangeStart = onStateChangeStart;
    vm.onStateChangeSuccess = onStateChangeSuccess;
    vm.pushClassicTab = pushClassicTab;
    vm.updateWebexMetrics = updateWebexMetrics;
    vm.updateIframe = updateIframe;

    var hasClassicEnabled = null;
    var $stateChangeStart = null;
    var $stateChangeSuccess = null;
    $scope.$on('$destroy', onDestory);

    init();

    function init() {
      setViewHeight();
      bindEvents();
      setupSubTabs();
    }

    function bindEvents() {
      hasClassicEnabled = $scope.$on('classicEnabled', function (event, isWebexClassicEnabled) {
        vm.isWebexClassicEnabled = isWebexClassicEnabled;
        vm.checkClassic(vm.isWebexClassicEnabled);
      });
      $stateChangeStart = $rootScope.$on('$stateChangeStart', onStateChangeStart);
      $stateChangeSuccess = $rootScope.$on('$stateChangeSuccess', onStateChangeSuccess);
    }

    function checkClassic() {
      FeatureToggleService.webexMetricsGetStatus().then(function (isMetricsOn) {
        if (isMetricsOn && vm.isWebexClassicEnabled) {
          vm.pushClassicTab();
          if (!_.isNull(vm.features) && vm.webexOptions.length === 1) {
            $timeout(goMetricsInitState, 0);
          }
        }
      });
    }

    function checkStatePermission(toState) {
      var isRedirected = false;
      var stateName = $state.current.name;
      if (!_.isUndefined(toState)) {
        stateName = toState.name;
      }
      if (!vm.features.isMetricsOn) {
        isRedirected = true;
        goLogin();
      }
      if (!vm.features.hasMetricsSite && _.isEqual(stateName, vm.webexMetrics.states.metrics.state)) {
        isRedirected = true;
      }
      if (!vm.features.hasMetricsSite && _.isEqual(stateName, vm.webexMetrics.states.diagnostics.state)) {
        isRedirected = true;
      }
      if (!(vm.features.isSystemOn && isCiscoUser()) && _.isEqual(stateName, vm.webexMetrics.states.system.state)) {
        isRedirected = true;
      }
      if (!vm.features.isInternalOn && _.isEqual(stateName, vm.webexMetrics.states.dashboard.state)) {
        isRedirected = true;
      }
      if (!vm.features.isInternalOn && _.isEqual(stateName, vm.webexMetrics.states.jms.state)) {
        isRedirected = true;
      }
      if (!vm.features.isInternalOn && _.isEqual(stateName, vm.webexMetrics.states.jmt.state)) {
        isRedirected = true;
      }
      if (!vm.features.isMEIOn && _.isEqual(stateName, vm.webexMetrics.states.mei.state)) {
        isRedirected = true;
      }
      if (!vm.isWebexClassicEnabled && _.isEqual(stateName, vm.webexMetrics.states.classic.state)) {
        isRedirected = true;
      }
      return isRedirected;
    }

    function goLogin() {
      $state.go('login');
    }

    function goMetricsInitState() {
      if (checkStatePermission($state.current.name)) {
        return;
      }
      if (vm.metricsOptions.length > 0) {
        var metricsDefaultLink = vm.metricsOptions[0].state;
        if ($state.is(vm.webexMetricsState)) {
          $state.go(metricsDefaultLink);
        } else if (!vm.isStateReady) {
          $state.reload($state.current.name);
        }
      }
    }

    function getReportType() {
      var urlPath = $location.path();
      urlPath = urlPath.split('/');
      var reportType = '';
      if (urlPath.length > 0) {
        reportType = urlPath[urlPath.length - 1];
      }
      return _.toLower(reportType);
    }

    function initSiteUrl() {
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
      vm.webexMetrics.states.metrics.initialed = true;
      updateMetricsView();
    }

    function initViewsAndSites() {
      ProPackService.hasProPackPurchased().then(function (isPurchased) {
        if (isPurchased) {
          vm.viewType = 'premium';
        }
        return WebexMetricsService.getMetricsSites();
      }).then(function (sites) {
        var webexSiteUrls = sites;
        vm.metricsSiteOptions = webexSiteUrls;

        $timeout(initSiteUrl, 0);
      });
    }

    function isReportsChanged(viewType, userInfo) {
      return (isMetrics() && userInfo.siteUrl !== vm.metricsSelected.toLowerCase()) || (!isMetrics() && _.get(vm.webexMetrics.views[vm.webexMetricsViews], 'view') !== viewType);
    }

    function isMetrics() {
      return vm.webexMetricsViews === 'metrics';
    }

    function loadMetricsReport() {
      var reportView = vm.webexMetrics.views[vm.webexMetricsViews];
      if (isMetrics()) {
        reportView = vm.webexMetrics.views[vm.webexMetricsViews][vm.viewType];
      }

      var userInfo = {
        org_id: Authinfo.getOrgId(),
        siteUrl: vm.metricsSelected.toLowerCase(),
        email: Authinfo.getPrimaryEmail(),
      };

      var viewType = _.get(reportView, 'view');
      var getWebExReportData = _.get(QlikService, 'getQBSInfo');
      if (isMetrics()) {
        getWebExReportData = _.get(QlikService, 'getProdToBTSQBSInfo');
      }

      if (!_.isFunction(getWebExReportData)) {
        return;
      }
      getWebExReportData(vm.reportType, viewType, userInfo).then(function (data) {
        if (!_.isUndefined(data) && !isReportsChanged(viewType, userInfo)) {
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
            vm.webexMetrics.appData.appId = reportView.appName;
          }
          var QlikMashupChartsUrl = _.get(QlikService, 'getQlikMashupUrl')(vm.webexMetrics.appData.qrp, vm.reportType, viewType);
          vm.webexMetrics.appData.url = QlikMashupChartsUrl;
          setStorageSite(vm.metricsSelected);
          updateIframe();
        }
      })
        .catch(function (error) {
          resetSiteSelector();
          $scope.$broadcast('unfreezeState', true);
          Notification.errorWithTrackingId(error, 'reportsPage.webexMetrics.errorRequest');
        });
    }

    function onDestory() {
      hasClassicEnabled();
      $stateChangeStart();
      $stateChangeSuccess();
    }

    function onStateChangeStart(event, toState, toParams, fromState) {
      vm.isStateReady = true;
      var isSubState = fromState.name.indexOf('reports.webex-metrics.') === 0;


      $log.log('onStateChangeStart: checkStatePermission -----------');
      if (/*isSubState &&*/_.startsWith(toState.name, vm.webexMetricsState) && checkStatePermission(toState)) {
        event.preventDefault();
        if (!isSubState || (isSubState && toState.name.indexOf('classic') !== -1)) {
          $state.go(fromState);
        } else {
          goLogin();
        }
      }

      if (isSubState && toState.name === vm.webexMetricsState) {
        event.preventDefault();
      }
    }

    function onStateChangeSuccess(event, toState) {
      switch (toState.name) {
        case vm.webexMetrics.states.metrics.state:
          vm.webexMetricsViews = 'metrics';
          if (!vm.webexMetrics.states.metrics.initialed) {
            initViewsAndSites();
          } else {
            updateMetricsView();
          }
          break;
        case vm.webexMetrics.states.diagnostics.state:
          vm.webexMetricsViews = 'diagnostics';
          vm.selectEnable = false;
          break;
        case vm.webexMetrics.states.mei.state:
          vm.webexMetricsViews = 'mei';
          vm.selectEnable = false;
          vm.updateWebexMetrics();
          break;
        case vm.webexMetrics.states.system.state:
          vm.webexMetricsViews = 'system';
          vm.selectEnable = false;
          vm.updateWebexMetrics();
          break;
        case 'reports.webex-metrics.main':
          vm.selectEnable = false;
          vm.webexMetricsViews = getReportType();
          if (vm.webexMetricsViews) {
            vm.updateWebexMetrics();
          }
          break;
        case vm.webexMetrics.states.dashboard.state:
          vm.webexMetricsViews = 'dashboard';
          vm.selectEnable = false;
          vm.updateWebexMetrics();
          break;
        case vm.webexMetrics.states.jms.state:
          vm.webexMetricsViews = 'jms';
          vm.selectEnable = false;
          vm.updateWebexMetrics();
          break;
        case vm.webexMetrics.states.jmt.state:
          vm.webexMetricsViews = 'jmt';
          vm.selectEnable = false;
          vm.updateWebexMetrics();
          break;
        case vm.webexMetrics.states.classic.state:
          vm.webexMetricsViews = 'classic';
          vm.selectEnable = false;
          break;
      }
      Analytics.trackReportsEvent(Analytics.sections.REPORTS.eventNames.CUST_WEBEX_REPORT);
    }

    function pushClassicTab() {
      if (!vm.hasClassicTab) {
        vm.hasClassicTab = true;
        vm.metricsOptions.push(vm.webexMetrics.states.classic);
      }
    }

    function resetSiteSelector() {
      var storageMetricsSiteUrl = LocalStorage.get('webexMetricsSiteUrl');
      var metricsSelected = vm.metricsSelected;

      if (metricsSelected !== storageMetricsSiteUrl && !_.isEmpty(storageMetricsSiteUrl)) {
        vm.metricsSelected = storageMetricsSiteUrl;
      }
    }

    function setStorageSite(siteUrl) {
      var storageMetricsSiteUrl = LocalStorage.get('webexMetricsSiteUrl');

      if (siteUrl !== storageMetricsSiteUrl) {
        LocalStorage.put('webexMetricsSiteUrl', siteUrl);
      }
    }

    function setViewHeight() {
      if (Authinfo.isReadOnlyAdmin()) {
        vm.iframeContainerClass = 'webexMetricsContentWithReadOnly';
      }
    }

    function setupSubTabs() {
      var promises = {
        isMetricsOn: FeatureToggleService.webexMetricsGetStatus(),
        // hasClassicSite: WebexMetricsService.hasClassicEnabled(),
        hasMetricsSite: WebexMetricsService.hasMetricsSites(),
        isMEIOn: false, //FeatureToggleService.webexMEIGetStatus(),
        isSystemOn: FeatureToggleService.webexSystemGetStatus(),
        isInternalOn: false, //FeatureToggleService.webexInternalGetStatus(),
      };
      $q.all(promises).then(function (features) {
        vm.features = features;
        if (features.isSystemOn && isCiscoUser()) {
          vm.metricsOptions.splice(0, 0, vm.webexMetrics.states.system);
        }
        if (features.isInternalOn) {
          vm.metricsOptions.push(vm.webexMetrics.states.dashboard, vm.webexMetrics.states.jms, vm.webexMetrics.states.jmt);
        }
        if (features.isMetricsOn && features.hasMetricsSite) {
          vm.metricsOptions.push(vm.webexMetrics.states.metrics, vm.webexMetrics.states.diagnostics);
        }
        /*if (features.isMEIOn) {
          vm.metricsOptions.push(vm.webexMetrics.states.mei);
        }*/
        if ($scope.header.isWebexClassicEnabled) {
          vm.isWebexClassicEnabled = true;
          pushClassicTab();
        }
        $timeout(goMetricsInitState, 0);
      });
    }

    function isCiscoUser() {
      var isCiscoUser = false;
      isCiscoUser = Authinfo.isCisco();
      return isCiscoUser;
    }

    function updateIframe() {
      var iframeUrl = vm.webexMetrics.appData.url;
      var data = {
        trustIframeUrl: $sce.trustAsResourceUrl(iframeUrl),
        appid: vm.webexMetrics.appData.appId,
        QlikTicket: vm.webexMetrics.appData.ticket,
        node: vm.webexMetrics.appData.node,
        persistent: vm.webexMetrics.appData.persistent,
        vID: vm.webexMetrics.appData.vID,
      };
      $scope.$broadcast('updateIframe', iframeUrl, data);
    }

    function updateMetricsView() {
      vm.selectEnable = true;
      vm.updateWebexMetrics();
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
  }
})();
