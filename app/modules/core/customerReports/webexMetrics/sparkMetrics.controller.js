(function () {
  'use strict';

  angular
    .module('Core')
    .controller('SparkMetricsCtrl', SparkMetricsCtrl);

  /* @ngInject */
  function SparkMetricsCtrl($scope, Authinfo, Userservice,
    $sce,
    $timeout,
    $window,
    Notification,
    QlikService,
    ProPackService
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

    function generateWebexMetricsUrl() {
      /*if (Authinfo.isPartner()) {
        vm.reportView = vm.sparkMetrics.views[2];
      } else {
        ProPackService.getProPackPurchased().then(function (isPurchased) {
          if (isPurchased) {
            vm.reportView = vm.sparkMetrics.views[1];
          }
          loadMetricsReport();
        });
      }*/
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

      QlikService['getSparkReportQBSfor' + vm.reportView.view + 'Url'](userInfo).then(function (data) {
        var QlikMashupChartsUrl = QlikService['getSparkReportAppfor' + vm.reportView.view + 'Url']();

        vm.sparkMetrics.appData = {
          ticket: data.ticket,
          appId: vm.reportView.appName,
          node: data.host,
          qrp: data.qlik_reverse_proxy,
          persistent: false,
          vID: '1eb65fdf-9643-417f-9974-ad72cae0e10f', //Authinfo.getOrgId(),
        };
        vm.sparkMetrics.appData.url = QlikMashupChartsUrl.replace('QRP', vm.sparkMetrics.appData.qrp);

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
      $scope.QlikTicket = vm.sparkMetrics.appData.ticket;
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
    }; // iframeLoaded()
  }//SparkMetricsCtrl
})();
