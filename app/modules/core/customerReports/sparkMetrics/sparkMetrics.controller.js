(function () {
  'use strict';

  angular
    .module('core.customer-reports')
    .controller('SparkMetricsCtrl', SparkMetricsCtrl);

  /* @ngInject */
  function SparkMetricsCtrl(
    $sce,
    $scope,
    $stateParams,
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

    function generateWebexMetricsUrl() {
      ProPackService.hasProPackPurchased().then(function (isPurchased) {
        if (isPurchased) {
          vm.reportView = vm.sparkMetrics.views[1];
        }
        loadMetricsReport();
      });
    }

    function loadMetricsReport() {
      var userInfo = {
        org_id: Authinfo.getOrgId(),
        email: Authinfo.getPrimaryEmail(),
      };

      var viewType = _.get(vm, 'reportView.view');
      var reportType = _.get($stateParams, 'sparktype');

      // var getSparkReportData = _.get(QlikService, 'getSparkReportQBSfor' + viewType + 'Url');
      var getSparkReportData = _.get(QlikService, 'getQBSInfo');

      if (!_.isFunction(getSparkReportData)) {
        return;
      }
      getSparkReportData(reportType, viewType, userInfo).then(function (data) {
        if (!_.isUndefined(data) && _.isObject(data)) {
          vm.sparkMetrics.appData = data;
        }
        //TODO remove this 'if' segment, if QBS can handle this parameter
        if (vm.sparkMetrics.appData.isPersistent === 'false') {
          vm.sparkMetrics.appData.appName = vm.reportView.appName;
        }
        var QlikMashupChartsUrl = _.get(QlikService, 'getQlikMashupUrl')(vm.sparkMetrics.appData.qlik_reverse_proxy, reportType, viewType);
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
        appid: vm.sparkMetrics.appData.appName,
        QlikTicket: vm.sparkMetrics.appData.ticket,
        node: vm.sparkMetrics.appData.host,
        persistent: vm.sparkMetrics.appData.isPersistent,
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
