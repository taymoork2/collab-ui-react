(function () {
  'use strict';

  angular
    .module('Core')
    .controller('WebExMetricsCtrl', WebExMetricsCtrl);

  /* @ngInject */
  function WebExMetricsCtrl($q, $scope, $stateParams, $translate, Authinfo, LocalStorage, Userservice, WebExApiGatewayService,
    $sce,
    $timeout,
    $window,
    QlikService,
    ITProPackService
  ) {
    var vm = this;

    vm.metricsUrl = '';
    vm.metrics = 'metrics';
    vm.reportView = 'Base';
    vm.search = 'search';
    vm.webexOptions = [];
    vm.webexSelected = null;
    vm.metricsOptions = [
      {
        id: '0',
        label: $translate.instant('reportsPage.webexMetrics.metrics'),
        selected: true,
        filterType: vm.metrics,
        toggle: function () {
          resetIframe(vm.metrics);
        },
      },
      {
        id: '1',
        label: $translate.instant('reportsPage.webexMetrics.search'),
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

          ITProPackService.getITProPackPurchased().then(function (isPurchased) {
            if (isPurchased) {
              vm.reportView = 'Premium';
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
        siteUrl: vm.webexSelected,
        email: Authinfo.getPrimaryEmail(),
      };

      //TODO: remove it before QBS API finished. just for 23-5-2017 demo
      vm.webexSelected = 'go.webex.com';
      userInfo = {
        org_id: 'TEST-QV-3',
        siteUrl: vm.webexSelected,
        email: 'qvadmin@cisco.com',
      };

      QlikService['getWebExReportQBSfor' + vm.reportView + 'Url'](userInfo).then(function (urlWithTicket) {
        var QlikMashupChartsUrl = QlikService['getWebExReportAppfor' + vm.reportView + 'Url']();
        var rx = /app[/](.*?)[/?]/g;
        var QlikAppUrl = '';
        QlikAppUrl = rx.exec(urlWithTicket.appUrl);
        vm.currentFilter.appId = QlikAppUrl[1];
        vm.currentFilter.QlikTicket = urlWithTicket.ticket;

        loadUrlAndIframe(QlikMashupChartsUrl);
      });
    }

    function updateIframe() {
      vm.isIframeLoaded = false;

      var iframeUrl = vm.currentFilter.url;
      $scope.trustIframeUrl = $sce.trustAsResourceUrl(iframeUrl);
      $scope.appId = vm.currentFilter.appId;
      $scope.QlikTicket = vm.currentFilter.QlikTicket;
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
