(function () {
  'use strict';

  angular
    .module('Core')
    .controller('WebExMetricsCtrl', WebExMetricsCtrl);

  /* @ngInject */
  function WebExMetricsCtrl($q, $stateParams, Authinfo, LocalStorage, Userservice, WebExApiGatewayService,
    $sce,
    $timeout,
    $window,
    QlikService
  ) {

    var vm = this;

    vm.webexOptions = [];
    vm.webexSelected = null;

    vm.updateWebexMetrics = updateWebexMetrics;

    vm.metricsOptions = [
      {
        id: '0',
        type: 'webex',
        url: '',
        selected: true,
      },
      {
        id: '1',
        type: 'spark',
        url: '',
        selected: true,
      },
    ];
    vm.currentFilter = vm.metricsOptions[0];
    vm.metricsType = vm.currentFilter.type;

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
          updateWebexMetrics();
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
        _.find(vm.metricsOptions, function (metrics) {
          if (metrics.type === vm.metricsType) {
            metrics.url = url;
          }
        });
        updateIframe();
      }

      var userInfo = {
        'org_id': Authinfo.getOrgId(),
        'siteUrl': vm.webexSelected,
        'email': Authinfo.getPrimaryEmail(),
      };

      //TODO: remove it before QBS API finished. just for 23-5-2017 demo
      vm.webexSelected = 'go.webex.com';
      userInfo = {
        'org_id': 'cisco',
        'siteUrl': vm.webexSelected,
        'email': 'shiren@cisco.com',
      };

      QlikService.getMetricsLink(vm.metricsType, userInfo).then(function (urlWithTicket) {
        var QlikMashupChartsUrl = 'https://ds2-win2012-01/extensions/forDemo/forDemo.html';
        var QlikAppUrl = urlWithTicket.appUrl;

        QlikMashupChartsUrl += getAppParams(QlikAppUrl, 'app/');
        loadUrlAndIframe(QlikMashupChartsUrl);
      });
    }

    function getAppParams(urls, matchStr) {
      var appParams = '';
      if (_.includes(urls, matchStr)) {
        appParams = '?appId=';
        appParams += (_.split(urls, matchStr))[1];
        appParams.replace('/?', '&');
      }
      return appParams;
    }

    function updateIframe() {
      vm.isIframeLoaded = false;
      var iframeUrlOrig = vm.currentFilter.url;
      iframeUrlOrig = $sce.trustAsResourceUrl(iframeUrlOrig);
      $timeout(
        function loadIframe() {
          vm.metricsUrl = iframeUrlOrig;
        },
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
