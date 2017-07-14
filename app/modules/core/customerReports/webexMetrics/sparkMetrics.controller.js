(function () {
  'use strict';

  angular
    .module('core.customer-reports')
    .controller('SparkMetricsCtrl', SparkMetricsCtrl);

  /* @ngInject */
  function SparkMetricsCtrl(
    $sce,
    $scope,
    $timeout,
    $window,
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
    vm.reportType = 'Spark';

    function generateWebexMetricsUrl() {
      ProPackService.getProPackPurchased().then(function (isPurchased) {
        if (isPurchased) {
          vm.reportView = vm.sparkMetrics.views[1];
        }
        loadMetricsReport();
      });
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

    function loadMetricsReport() {
      var userInfo = {
        org_id: Authinfo.getOrgId(),
        email: Authinfo.getPrimaryEmail(),
      };

      var viewType = _.get(vm, 'reportView.view');

      var getSparkReportData = _.get(QlikService, 'getReportQBSUrl');

      if (!_.isFunction(getSparkReportData)) {
        return;
      }
      getSparkReportData(vm.reportType, viewType, userInfo).then(function (data) {
        vm.sparkMetrics.appData = {
          ticket: data.ticket,
          appId: data.appName,
          node: data.host,
          qrp: data.qlik_reverse_proxy,
          persistent: data.isPersistent,
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
      vm.isIframeLoaded = false;

      var iframeUrl = vm.sparkMetrics.appData.url;
      $scope.trustIframeUrl = $sce.trustAsResourceUrl(iframeUrl);
      $scope.appId = vm.sparkMetrics.appData.appId;
      $scope.QlikTicket = vm.sparkMetrics.appData.ticket;
      $scope.node = vm.sparkMetrics.appData.node;
      $scope.persistent = vm.sparkMetrics.appData.persistent;
      $scope.vID = vm.sparkMetrics.appData.vID;

      var parser = $window.document.createElement('a');
      parser.href = iframeUrl;

      $timeout(
        function loadIframe() {
          var submitFormBtn = $window.document.getElementById('submitFormBtn');
          submitFormBtn.click();
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
    };
  }
})();
