(function () {
  'use strict';

  angular
    .module('core.partner-reports')
    .controller('SparkReportsCtrl', SparkReportsCtrl);

  /* @ngInject */
  function SparkReportsCtrl(
    $sce,
    $scope,
    $state,
    $stateParams,
    $q,
    $window,
    Analytics,
    Authinfo,
    Notification,
    QlikService,
    FeatureToggleService,
    Userservice
  ) {
    var vm = this;
    //var orgIds = [];

    vm.sparkReports = {};
    vm.viewType = 'Partner';

    init();

    function init() {
      Userservice.getUser(
        'me',
        function (data) {
          if (data.success) {
            if (data.emails) {
              Authinfo.setEmails(data.emails);
              var promises = {
                isFeatureToggleOn: FeatureToggleService.atlasPartnerSparkReportsGetStatus(),
              };
              $q.all(promises).then(function (features) {
                if (!features.isFeatureToggleOn) {
                  $state.go('partnerreports.tab.base');
                }
              });
              setViewHeight();
              loadSparkReports();
            }
          }
        }
      );
      Analytics.trackReportsEvent(Analytics.sections.REPORTS.eventNames.PARTNER_SPARK_REPORT);
    }

    function setViewHeight() {
      if (Authinfo.isReadOnlyAdmin()) {
        vm.iframeContainerClass = 'sparkMetricsContentWithReadOnly';
      } else {
        vm.iframeContainerClass = 'sparkMetricsContent';
      }
    }

    function loadSparkReports() {
      var userInfo = {
        org_id: Authinfo.getOrgId(),
        email: Authinfo.getPrimaryEmail(),
      };

      var getSparkPartnerReportData = _.get(QlikService, 'getQBSInfo');

      if (!_.isFunction(getSparkPartnerReportData)) {
        return;
      }

      var reportType = _.get($stateParams, 'sparktype');

      getSparkPartnerReportData(reportType, vm.viewType, userInfo).then(function (data) {
        if (!_.isUndefined(data) && _.isObject(data)) {
          vm.sparkReports.appData = data;
        }
        var QlikMashupChartsUrl = _.get(QlikService, 'getQlikMashupUrl')(vm.sparkReports.appData.qlik_reverse_proxy, reportType, vm.viewType);
        vm.sparkReports.appData.url = QlikMashupChartsUrl;
        updateIframe();
      })
        .catch(function (error) {
          Notification.errorWithTrackingId(error, 'common.error');
        });
    }

    function updateIframe() {
      var iframeUrl = vm.sparkReports.appData.url;
      var data = {
        trustIframeUrl: $sce.trustAsResourceUrl(iframeUrl),
        appid: vm.sparkReports.appData.appName,
        QlikTicket: vm.sparkReports.appData.ticket,
        node: vm.sparkReports.appData.host,
        persistent: true,
        vID: Authinfo.getOrgId(),
      };
      $scope.$broadcast('updateIframe', iframeUrl, data);
    }

    $scope.iframeLoaded = function (elem) {
      elem.ready(function () {
        if (!_.startsWith(elem[0].src, 'about')) {
          var token = $window.sessionStorage.getItem('accessToken');
          var orgID = Authinfo.getOrgId();
          elem[0].contentWindow.postMessage(token + ',' + orgID, '*');
        }
      });
    };
  }
})();
