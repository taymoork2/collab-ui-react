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
        view: 'Basic',
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
      setViewHeight();
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

      var viewType = _.get(vm, 'reportView.view');

      // var getSparkReportData = _.get(QlikService, 'getSparkReportQBSfor' + viewType + 'Url');
      var getSparkReportData = _.get(QlikService, 'getQBSInfo');

      if (!_.isFunction(getSparkReportData)) {
        return;
      }
      getSparkReportData('spark', viewType, userInfo).then(function (data) {
        vm.sparkMetrics.appData = {
          ticket: data.ticket,
          appId: data.appName,
          node: data.host,
          qrp: data.qlik_reverse_proxy,
          persistent: data.isPersistent,
          vID: Authinfo.getOrgId(),
        };
        //TODO remove this 'if' segment, if QBS can handle this parameter
        if (vm.sparkMetrics.appData.persistent === 'false') {
          vm.sparkMetrics.appData.appId = vm.reportView.appName;
        }
        var QlikMashupChartsUrl = _.get(QlikService, 'getQlikMashupUrl')(vm.sparkMetrics.appData.qrp, 'spark', viewType);
        vm.sparkMetrics.appData.url = QlikMashupChartsUrl;

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
