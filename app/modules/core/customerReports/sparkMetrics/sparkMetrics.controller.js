(function () {
  'use strict';

  angular
    .module('core.customer-reports')
    .controller('SparkMetricsCtrl', SparkMetricsCtrl);

  /* @ngInject */
  function SparkMetricsCtrl(
    $sce,
    $scope,
    $window,
    Analytics,
    Authinfo,
    Notification,
    ProPackService,
    QlikService,
    Userservice
  ) {
    var vm = this;

    vm.sparkMetrics = {};

    vm.sparkMetrics.views = [
      {
        view: 'Base',
        appName: 'basic_spark_v1',
      },
      {
        view: 'Premium',
        appName: 'premium_spark_v1',
      },
    ];
    vm.reportView = vm.sparkMetrics.views[0];
    vm.init = init;

    init();

    function generateWebexMetricsUrl() {
      ProPackService.hasProPackPurchased().then(function (isPurchased) {
        if (isPurchased) {
          vm.reportView = vm.sparkMetrics.views[1];
        }
        loadMetricsReport();
      });
    }

    function init() {
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
      Analytics.trackReportsEvent(Analytics.sections.REPORTS.eventNames.CUST_SPARK_REPORT);
    }

    function loadMetricsReport() {
      var userInfo = {
        org_id: Authinfo.getOrgId(),
        email: Authinfo.getPrimaryEmail(),
      };

      var viewType = _.get(vm, 'reportView.view');

      var getSparkReportData = _.get(QlikService, 'getSparkReportQBSfor' + viewType + 'Url');

      if (!_.isFunction(getSparkReportData)) {
        return;
      }
      getSparkReportData(userInfo).then(function (data) {
        vm.sparkMetrics.appData = {
          ticket: data.ticket,
          appId: vm.reportView.appName, //TODO changes to data.appName, if QBS can handle this parameter
          node: data.host,
          qrp: data.qlik_reverse_proxy,
          persistent: false, //TODO changes to data.isPersistent, if QBS can handle this parameter
          vID: Authinfo.getOrgId(),
        };
        var QlikMashupChartsUrl = _.get(QlikService, 'getSparkReportAppfor' + viewType + 'Url')(vm.sparkMetrics.appData.qrp);
        vm.sparkMetrics.appData.url = QlikMashupChartsUrl;

        updateIframe();
      })
        .catch(function (error) {
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

    $window.iframeLoaded = function (iframeId) {
      var rec = angular.element(iframeId);
      rec.ready(function () {
        var token = $window.sessionStorage.getItem('accessToken');
        var orgID = Authinfo.getOrgId();
        rec[0].contentWindow.postMessage(token + ',' + orgID, '*');
      });
    };
  }
})();
