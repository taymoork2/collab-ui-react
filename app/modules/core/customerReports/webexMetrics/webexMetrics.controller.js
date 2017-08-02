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
    $window,
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
        id: '0',
        label: 'reportsPage.webexMetrics.metrics',
        selected: true,
        filterType: vm.metrics,
        toggle: function () {
          resetIframe(vm.metrics);
        },
      },
      {
        id: '1',
        label: 'reportsPage.webexMetrics.diagnostics',
        selected: false,
        filterType: vm.search,
        toggle: function () {
          resetIframe(vm.search);
        },
      },
    ];

    var deregister = $scope.$on('selectEnable', function (data) {
      vm.selectEnable = data.defaultPrevented;
    });
    $scope.$on('$destroy', deregister);  // -- by zoncao@cisco.com for site select

    vm.updateWebexMetrics = updateWebexMetrics;

    function resetIframe(filter) {
      if (vm.currentFilter.filterType !== filter) {
        vm.currentFilter = _.find(vm.metricsOptions, function (metrics) {
          return metrics.filterType === filter;
        });
      }

      if (filter === 'search') {
        return false;
      } else {
        vm.selectEnable = true;
      }

      updateIframe();
    }

    vm.currentFilter = vm.metricsOptions[0];

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

      ProPackService.hasProPackPurchased().then(function (isPurchased) {
        if (isPurchased) {
          vm.reportView = vm.webexMetrics.views[1];
        }
        updateWebexMetrics();
      });
    }

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

    function updateWebexMetrics() {
      var storageMetricsSiteUrl = LocalStorage.get('webexMetricsSiteUrl');
      var webexSelected = vm.webexSelected;
      vm.isIframeLoaded = false;

      if (webexSelected !== storageMetricsSiteUrl) {
        LocalStorage.put('webexMetricsSiteUrl', webexSelected);
      }

      if (!_.isNull(vm.webexSelected)) {
        vm.isNoData = false;
        loadMetricsReport();
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
      vm.isIframeLoaded = false;

      var iframeUrl = vm.webexMetrics.appData.url;
      $scope.trustIframeUrl = $sce.trustAsResourceUrl(iframeUrl);
      $scope.appId = vm.webexMetrics.appData.appId;
      $scope.QlikTicket = vm.webexMetrics.appData.ticket;
      $scope.node = vm.webexMetrics.appData.node;
      $scope.persistent = vm.webexMetrics.appData.persistent;
      $scope.vID = vm.webexMetrics.appData.vID;

      var parser = $window.document.createElement('a');
      parser.href = iframeUrl;

      $timeout(
        function loadIframe() {
          var submitFormBtn = $window.document.getElementById('submitFormBtn');
          submitFormBtn.click();
        }, // loadIframe()
        0
      );
    }

    $window.iframeLoaded = function (iframeId) {
      var currScope = angular.element(iframeId).scope();
      var phase = currScope.$$phase;

      if (!phase) {
        currScope.$apply(function () {
          vm.isIframeLoaded = true;
        });
      }
    };
  }
})();
