(function () {
  'use strict';

  angular
    .module('core.partner-reports')
    .controller('SparkReportsCtrl', SparkReportsCtrl)
    .directive('ngOnload', ngOnloadDirective);

  function ngOnloadDirective() {
    return {
      restrict: 'A',
      scope: {
        callback: '&ngOnload',
      },
      link: function (scope, element) {
        element.on('load', function (event) {
          scope.callback({ event: event });
        });
      },
    };
  }

  /* @ngInject */
  function SparkReportsCtrl(
    $sce,
    $timeout,
    $window,
    Analytics,
    Authinfo,
    Notification,
    QlikService,
    ReportService
  ) {
    var vm = this;
    var orgIds = [];

    vm.sparkReports = {};

    init();

    function init() {
      ReportService.getCustomerList().then(function (customerList) {
        orgIds = _.map(customerList, function (customer) {
          return customer.customerOrgId;
        });
        orgIds.unshift(Authinfo.getOrgId());
        loadSparkReports();
      });
      Analytics.trackReportsEvent(Analytics.sections.REPORTS.eventNames.PARTNER_SPARK_REPORT);
    }

    function loadSparkReports() {
      var userInfo = {
        org_id: orgIds.join(),
        email: Authinfo.getPrimaryEmail(),
      };

      var getSparkPartnerReportData = _.get(QlikService, 'getSparkReportQBSforPartnerUrl');

      if (!_.isFunction(getSparkPartnerReportData)) {
        return;
      }

      getSparkPartnerReportData(userInfo).then(function (data) {
        vm.sparkReports.appData = {
          QlikTicket: data.ticket,
          appName: 'partner_spark_v1',
          node: data.host,
          qrp: data.qlik_reverse_proxy,
          persistent: false,
          vID: data.vid,
        };
        var QlikMashupChartsUrl = _.get(QlikService, 'getSparkReportAppforPartnerUrl')(vm.sparkReports.appData.qrp);
        vm.sparkReports.appData.url = QlikMashupChartsUrl;
        updateIframe();
      })
        .catch(function (error) {
          Notification.errorWithTrackingId(error, 'common.error');
        });
    }

    function updateIframe() {
      vm.isIframeLoaded = false;

      var iframeUrl = vm.sparkReports.appData.url;
      vm.sparkReports.appData.trustIframeUrl = $sce.trustAsResourceUrl(iframeUrl);

      $timeout(
        function loadIframe() {
          var submitFormBtn = $window.document.getElementById('submitFormBtn');
          submitFormBtn.click();
        },
        0
      );
    }

    vm.iframeLoaded = function (iframeId) {
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
