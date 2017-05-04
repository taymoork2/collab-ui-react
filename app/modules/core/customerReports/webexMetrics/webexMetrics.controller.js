(function () {
  'use strict';

  angular
    .module('Core')
    .controller('WebExMetricsCtrl', WebExMetricsCtrl);

  /* @ngInject */
  function WebExMetricsCtrl($q, $stateParams, $translate, Authinfo, LocalStorage, Userservice, WebExApiGatewayService,
    $sce,
    $timeout,
    $window,
    UrlConfig,
    QlikService
  ) {

    var vm = this;

    vm.webexOptions = [];
    vm.webexSelected = null;
    vm.updateWebexMetrics = updateWebexMetrics;

    // vm.allReports = 'all';
    vm.webexReportInMashup = 'webexReportInMashup';
    vm.webexReportInQlikApp = 'webexReportInQlikApp';
    vm.sparkReportInMashup = 'sparkReportInMashup';
    vm.meetingUsage = 'meetingUsage';
    vm.joinMeetingTime = 'joinMeetingTime';
    vm.webexReportWithTicketInMashup = 'webexReportWithTicketInMashup';
    vm.sparkReportWithTicketInMashup = 'sparkReportWithTicketInMashup';
    vm.currentFilter = vm.webexReportInMashup;
    vm.displayMeetingUsage = false;
    vm.displayJoinMeetingTime = false;
    vm.displayWebexReportInMashup = true;
    vm.displayWebexReportInQlikApp = false;
    vm.displaySparkReportInMashup = true;


    vm.webexMetricsOptions = [
      {
        'id': '0',
        'label': $translate.instant('reportsPage.webexMetrics.webexReportInMashup'),
        'selected': true,
        toggle: function () {
          resetIframe(vm.webexReportInMashup);
        },
      },
      {
        'id': '1',
        'label': $translate.instant('reportsPage.webexMetrics.sparkReportInMashup'),
        'selected': false,
        toggle: function () {
          resetIframe(vm.sparkReportInMashup);
        },
      },
      /*{
        'id': '2',
        'label': $translate.instant('reportsPage.webexMetrics.webexReportInQlikApp'),
        'selected': false,
        toggle: function () {
          resetIframe(vm.webexReportInQlikApp);
        },
      },
      {
        'id': '3',
        'label': $translate.instant('reportsPage.webexMetrics.meetingUsage'),
        'selected': false,
        toggle: function () {
          resetIframe(vm.meetingUsage);
        },
      },
      {
        'id': '4',
        'label': $translate.instant('reportsPage.webexMetrics.joinMeetingTime'),
        'selected': false,
        toggle: function () {
          resetIframe(vm.joinMeetingTime);
        },
      },*/
      {
        'id': '2',
        'label': $translate.instant('reportsPage.webexMetrics.webexReportWithTicket'),
        'selected': false,
        toggle: function () {
          resetIframe(vm.webexReportWithTicketInMashup);
        },
      },
      {
        'id': '3',
        'label': $translate.instant('reportsPage.webexMetrics.sparkReportWithTicket'),
        'selected': false,
        toggle: function () {
          resetIframe(vm.sparkReportWithTicketInMashup);
        },
      },
    ];
    vm.webexMetricsOptions[0].url = UrlConfig.getWebexReportInMashupUrl();
    vm.webexMetricsOptions[0].filterType = 'webexReportInMashup';


    vm.webexMetricsOptions[1].url = UrlConfig.getSparkReportInMashupUrl();
    vm.webexMetricsOptions[1].filterType = 'sparkReportInMashup';

    /*vm.webexMetricsOptions[2].url = UrlConfig.getWebexReportInQlikAppUrl();
    vm.webexMetricsOptions[2].filterType = 'webexReportInQlikApp';

    vm.webexMetricsOptions[3].url = UrlConfig.getMeetingUsageUrl();
    vm.webexMetricsOptions[3].filterType = 'meetingUsage';

    vm.webexMetricsOptions[4].url = UrlConfig.getJoinMeetingTimeUrl();
    vm.webexMetricsOptions[4].filterType = 'joinMeetingTime';*/

    vm.webexMetricsOptions[2].url = '';
    vm.webexMetricsOptions[2].filterType = 'webexReportWithTicketInMashup';

    vm.webexMetricsOptions[3].url = '';
    vm.webexMetricsOptions[3].filterType = 'sparkReportWithTicketInMashup';

    getQlikUrl();

    function resetIframe(filter) {
      if (vm.currentFilter !== filter) {
        vm.displayWebexReportInMashup = false;
        vm.displayWebExReportInQlik = false;
        vm.displayMeetingUsage = false;
        vm.displayJoinMeetingTime = false;
        vm.displaySparkReportInMashup = false;
        if (filter === vm.webexReportInMashup) {
          vm.displayWebexReportInMashup = true;
        }
        if (filter === vm.sparkReportInMashup) {
          vm.displaySparkReportInMashup = true;
        }
        if (filter === vm.webexReportInQlikApp) {
          vm.displayWebExReportInQlik = true;
        }
        if (filter === vm.meetingUsage) {
          vm.displayMeetingUsage = true;
        }
        if (filter === vm.joinMeetingTime) {
          vm.displayJoinMeetingTime = true;
        }
        vm.currentFilter = filter;
      }
      updateIframe();
    }

    function onlyUnique(value, index, self) {
      return self.indexOf(value) === index;
    }

    function getUniqueWebexSiteUrls() {
      var conferenceServices = Authinfo.getConferenceServicesWithoutSiteUrl() || [];
      var webexSiteUrls = [];

      conferenceServices.forEach(
        function getWebExSiteUrl(conferenceService) {
          webexSiteUrls.push(conferenceService.license.siteUrl);
        }
      );

      return webexSiteUrls.filter(onlyUnique);
    }

    function generateWebexMetricsUrl() {
      var promiseChain = [];
      var webexSiteUrls = getUniqueWebexSiteUrls(); // strip off any duplicate webexSiteUrl to prevent unnecessary XML API calls

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
    }

    function updateIframe() {
      vm.isIframeLoaded = false;
      vm.webexMetricsOptions[2].url = vm.qlikWebexAppUrl;
      vm.webexMetricsOptions[3].url = vm.qlikSparkAppUrl;
      var iframeUrlOrig = _.find(vm.webexMetricsOptions, function (metrics) {
        return metrics.filterType === vm.currentFilter;
      }).url;
      iframeUrlOrig = $sce.trustAsResourceUrl(iframeUrlOrig);
      $timeout(
        function loadIframe() {
          vm.metricsUrl = iframeUrlOrig;
        },
        0
      );
    }

    function getQlikUrl() {
      QlikService.getQlikInfos().then(function (qlikInfo) {
        var ticket = qlikInfo.ticket;
        //access app
        vm.qlikWebexAppUrl = 'https://ds2-qlikdemo/custom/sense/app/2a4c2eb6-cc4f-4181-8ff7-c20ad389e292/sheet/vmNuum/state/analysis?QlikTicket=' + ticket;
        vm.qlikSparkAppUrl = 'https://ds2-qlikdemo/custom/sense/app/43f0146d-94a1-4add-addd-a21213a5f5c4/sheet/KYmpu/state/analysis?QlikTicket=' + ticket;
        updateIframe();
      });
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
