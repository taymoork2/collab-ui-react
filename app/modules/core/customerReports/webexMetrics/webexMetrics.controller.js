(function () {
  'use strict';

  angular
    .module('Core')
    .controller('WebExMetricsCtrl', WebExMetricsCtrl);

  /* @ngInject */
  function WebExMetricsCtrl($q, $scope, $stateParams, Authinfo, LocalStorage, Userservice, WebExApiGatewayService, $log,
    $sce,
    $timeout,
    $window,
    Notification,
    QlikService,
    ProPackService
  ) {
    var vm = this;

    vm.metrics = 'metrics';
    vm.search = 'search';
    vm.webexOptions = [];
    vm.webexSelected = null;
    vm.webexMetrics = {};

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

    vm.updateWebexMetrics = updateWebexMetrics;

    function resetIframe(filter) {
      if (vm.currentFilter.filterType !== filter) {
        vm.currentFilter = _.find(vm.metricsOptions, function (metrics) {
          return metrics.filterType === filter;
        });
      }
      updateIframe();
    }

    vm.currentFilter = vm.metricsOptions[0];

    function onlyUnique(value, index, self) {
      return self.indexOf(value) === index;
    }

    function getUniqueWebexSiteUrls() {
      var conferenceServices = Authinfo.getConferenceServicesWithoutSiteUrl() || [];
      var linkedConferenceServices = Authinfo.getConferenceServicesWithLinkedSiteUrl() || [];
      var webexSiteUrls = [];

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

    function generateWebexMetricsUrl() {
      var promiseChain = [];
      var webexSiteUrls = getUniqueWebexSiteUrls();

      webexSiteUrls.forEach(
        function chkWebexSiteUrl(url) {
          promiseChain.push(
            WebExApiGatewayService.siteFunctions(url).then(
              function getSiteSupportsIframeSuccess(result) {
                if (result.isAdminReportEnabled && result.isIframeSupported) {
                  vm.webexOptions.push(result.siteUrl);
                  vm.webexOptions.push('alpha.webex.com');
                  vm.webexOptions.push('go.webex.com');
                }
              }).catch(_.noop));
        }
      );

      $q.all(promiseChain).then(
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
      );
    }
    if (!_.isUndefined(Authinfo.getPrimaryEmail())) {
      generateWebexMetricsUrl();
    } else {
      Userservice.getUser(
        'me',
        function (data) {
          if (data.success) {
            if (data.emails) {
              Authinfo.setEmails(data.emails);
              generateWebexMetricsUrl();
            }
          }
        }
      );
    }

    function updateWebexMetrics() {
      var storageMetricsSiteUrl = LocalStorage.get('webexMetricsSiteUrl');
      var webexSelected = vm.webexSelected;

      if (webexSelected !== storageMetricsSiteUrl) {
        LocalStorage.put('webexMetricsSiteUrl', webexSelected);
      }

      loadMetricsReport();
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
      $log.log(userInfo.siteUrl);
      $log.log('getWebExReportQBSfor' + vm.reportView.view + 'Url');
      QlikService['getWebExReportQBSfor' + vm.reportView.view + 'Url'](userInfo).then(function (data) {
        var QlikMashupChartsUrl = QlikService['getWebExReportAppfor' + vm.reportView.view + 'Url']();

        vm.webexMetrics.appData = {
          ticket: data.ticket,
          appId: vm.reportView.appName,
          node: data.host,
          qrp: data.qlik_reverse_proxy,
          persistent: data.isPersistent,
          vID: data.siteId,
        };
        vm.webexMetrics.appData.url = QlikMashupChartsUrl.replace('QRP', vm.webexMetrics.appData.qrp);

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
      $scope.QlikTicket = vm.webexMetrics.appData.ticket;
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
    }; // iframeLoaded()
  }//WebExMetricsCtrl
})();
