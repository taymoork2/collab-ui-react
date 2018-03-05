(function () {
  'use strict';

  angular
    .module('core.customer-reports')
    .controller('AutoLicenseCtrl', AutoLicenseCtrl);

  /* @ngInject */
  function AutoLicenseCtrl(
    $sce,
    $scope,
    $window,
    Analytics,
    Authinfo,
    Notification,
    QlikService,
    Userservice
  ) {
    var vm = this;

    vm.sparkMetrics = {};

    vm.init = init;

    init();

    function init() {
      setViewHeight();
      Userservice.getUser(
        'me',
        function (data) {
          if (data.success) {
            if (data.emails) {
              Authinfo.setEmails(data.emails);
              loadMetricsReport();
            }
          }
        }
      );
      Analytics.trackReportsEvent(Analytics.sections.REPORTS.eventNames.CUST_SPARK_REPORT);
    }

    function setViewHeight() {
      if (Authinfo.isReadOnlyAdmin()) {
        vm.iframeContainerClass = 'sparkMetricsContentWithReadOnly';
      } else {
        vm.iframeContainerClass = 'sparkMetricsContent';
      }
    }


    function loadMetricsReport() {
      var userInfo = {
        org_id: Authinfo.getOrgId(),
        email: Authinfo.getPrimaryEmail(),
      };

      // var getSparkReportData = _.get(QlikService, 'getSparkReportQBSfor' + viewType + 'Url');
      var getSparkReportData = _.get(QlikService, 'getQBSInfo');

      if (!_.isFunction(getSparkReportData)) {
        return;
      }
      getSparkReportData('license', '', userInfo).then(function (data) {
        vm.sparkMetrics.appData = {
          ticket: data.ticket,
          appId: data.appName,
          node: data.host,
          qrp: data.qlik_reverse_proxy,
          persistent: data.isPersistent,
          vID: Authinfo.getOrgId(),
        };
        var QlikMashupChartsUrl = _.get(QlikService, 'getQlikMashupUrl')(vm.sparkMetrics.appData.qrp, 'license', '');
        vm.sparkMetrics.appData.url = QlikMashupChartsUrl;
        vm.sparkMetrics.appData.appId = 'license';

        updateIframe();
      })
        .catch(function (error) {
          $scope.$broadcast('unfreezeState', true);
          Notification.errorWithTrackingId(error, 'common.error');
        });
    }

    function updateIframe() {
      var iframeUrl = vm.sparkMetrics.appData.url;
      var data = {
        trustIframeUrl: $sce.trustAsResourceUrl(iframeUrl),
        appId: vm.sparkMetrics.appData.appId,
        QlikTicket: vm.sparkMetrics.appData.ticket,
        node: vm.sparkMetrics.appData.node,
        persistent: vm.sparkMetrics.appData.persistent,
        vID: vm.sparkMetrics.appData.vID,
      };
      $scope.$broadcast('updateIframe', iframeUrl, data);
    }

    $scope.iframeLoaded = function (elem) {
      elem.ready(function () {
        var token = $window.sessionStorage.getItem('accessToken');
        var orgID = Authinfo.getOrgId();
        elem[0].contentWindow.postMessage(token + ',' + orgID, '*');
      });
    };
  }
})();
