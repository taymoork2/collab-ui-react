(function () {
  'use strict';

  angular
    .module('core.customer-reports')
    .controller('HybridMediaMetricsCtrl', HybridMediaMetricsCtrl);

  /* @ngInject */
  function HybridMediaMetricsCtrl(
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

    vm.displayQlik = true;
    vm.displayLiveResource = false;

    vm.hybridMetrics = {};

    vm.hybridMetrics.views = [{
      view: 'Basic',
      appName: 'basic_hybrid_media_v1',
    }];
    vm.reportView = vm.hybridMetrics.views[0];
    vm.changeTabs = changeTabs;
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
        vm.iframeContainerClass = 'hybridMetricsContentWithReadOnly';
      } else {
        vm.iframeContainerClass = 'hybridMetricsContent';
      }
    }

    function changeTabs(isQlik, isLive) {
      vm.displayQlik = isQlik;
      vm.displayLiveResource = isLive;
      if (vm.displayQlik) {
        init();
      } else {
        vm.displayLiveResource = true;
      }
    }

    function loadMetricsReport() {
      var userInfo = {
        org_id: Authinfo.getOrgId(),
        email: Authinfo.getPrimaryEmail(),
      };

      var viewType = _.get(vm, 'reportView.view');

      // var getHmsReportData = _.get(QlikService, 'getSparkReportQBSfor' + viewType + 'Url');
      var getHmsReportData = _.get(QlikService, 'getQBSInfo');

      if (!_.isFunction(getHmsReportData)) {
        return;
      }
      getHmsReportData('hybridMedia', viewType, userInfo).then(function (data) {
        vm.hybridMetrics.appData = {
          ticket: data.ticket,
          appId: data.appName,
          node: data.host,
          qrp: data.qlik_reverse_proxy,
          persistent: data.isPersistent,
          vID: Authinfo.getOrgId(),
        };
        //TODO remove this 'if' segment, if QBS can handle this parameter
        if (vm.hybridMetrics.appData.persistent === 'false') {
          vm.hybridMetrics.appData.appId = vm.reportView.appName;
        }
        var QlikMashupChartsUrl = _.get(QlikService, 'getQlikMashupUrl')(vm.hybridMetrics.appData.qrp, 'hybridMedia', viewType);
        vm.hybridMetrics.appData.url = QlikMashupChartsUrl;

        updateIframe();
      })
        .catch(function (error) {
          $scope.$broadcast('unfreezeState', true);
          Notification.errorWithTrackingId(error, 'common.error');
        });
    }

    function updateIframe() {
      var iframeUrl = vm.hybridMetrics.appData.url;
      var data = {
        trustIframeUrl: $sce.trustAsResourceUrl(iframeUrl),
        appId: vm.hybridMetrics.appData.appId,
        QlikTicket: vm.hybridMetrics.appData.ticket,
        node: vm.hybridMetrics.appData.node,
        persistent: vm.hybridMetrics.appData.persistent,
        vID: vm.hybridMetrics.appData.vID,
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
