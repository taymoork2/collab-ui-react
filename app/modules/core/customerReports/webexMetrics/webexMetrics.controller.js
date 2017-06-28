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
        label: 'reportsPage.webexMetrics.search',
        selected: false,
        filterType: vm.search,
        toggle: function () {
          resetIframe(vm.search);
        },
      },
    ];

    var deregister = $scope.$on('selectEnable', function () {
      vm.selectEnable = !vm.selectEnable;
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
      }

      updateIframe();
    }

    vm.currentFilter = vm.metricsOptions[0];

    function onlyUnique(value, index, self) {
      return self.indexOf(value) === index;
    }

    function getUniqueWebexSiteUrls(siteUrls) {
      var conferenceServices = Authinfo.getConferenceServicesWithoutSiteUrl() || [];
      var linkedConferenceServices = Authinfo.getConferenceServicesWithLinkedSiteUrl() || [];
      var webexSiteUrls = [];
      webexSiteUrls = webexSiteUrls.concat(siteUrls);

      conferenceServices.forEach(
        function getWebExSiteUrl(conferenceService) {
          webexSiteUrls.push(conferenceService.license.siteUrl);
        }
      );

      linkedConferenceServices.forEach(
        function getWebExSiteUrl(linkedConferenceService) {
          webexSiteUrls.push(linkedConferenceService.license.linkedSiteUrl);
        }
      );

      return webexSiteUrls.filter(onlyUnique);
    }

    function generateWebexMetricsUrl(siteUrls) {
      var webexSiteUrls = getUniqueWebexSiteUrls(siteUrls);

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

      ProPackService.getProPackPurchased().then(function (isPurchased) {
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
            var trainSiteNames = _.get(data, 'trainSiteNames', []);
            var linkedTrainSiteNames = _.get(data, 'linkedTrainSiteNames', []);
            trainSites = trainSiteNames.concat(linkedTrainSiteNames);

            generateWebexMetricsUrl(trainSites);
          }
        }
      }
    );

    function updateWebexMetrics() {
      var storageMetricsSiteUrl = LocalStorage.get('webexMetricsSiteUrl');
      var webexSelected = vm.webexSelected;

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
      var getWebExReportData = _.get(QlikService, 'getWebExReportQBSfor' + viewType + 'Url');

      if (!_.isFunction(getWebExReportData)) {
        return;
      }
      getWebExReportData(userInfo).then(function (data) {
        vm.webexMetrics.appData = {
          ticket: data.ticket,
          appId: vm.reportView.appName,
          node: data.host,
          qrp: data.qlik_reverse_proxy,
          persistent: data.isPersistent,
          vID: data.siteId,
        };
        var QlikMashupChartsUrl = _.get(QlikService, 'getWebExReportAppfor' + viewType + 'Url')(vm.webexMetrics.appData.qrp);
        vm.webexMetrics.appData.url = QlikMashupChartsUrl;

        loadUrlAndIframe(QlikMashupChartsUrl);
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
