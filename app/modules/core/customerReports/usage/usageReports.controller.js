(function () {
  'use strict';

  angular
    .module('Core')
    .controller('UsageReportsCtrl', UsageReportsCtrl);

  /* @ngInject */
  function UsageReportsCtrl($state, $stateParams, $translate, $scope, DummyChartService, deviceUsageFeatureToggle) {
    var vm = this;
    vm.reportType = $stateParams.deviceReportType;

    if (!deviceUsageFeatureToggle) {
      // simulate a 404
      $state.go('login');
    }

    vm.tabs = [{
      title: $translate.instant('reportsPage.usageReports.inUse'),
      state: "reports.usage({deviceReportType: 'inUse'})",
    }, {
      title: $translate.instant('reportsPage.usageReports.peakHour'),
      state: "reports.usage({deviceReportType: 'peakHour'})",
    }];

    $scope.usageChart = DummyChartService.makePeakHourChart();
    vm.pageTitle = $translate.instant('reportsPage.usageReports.usageReportTitle');
  }

})();
