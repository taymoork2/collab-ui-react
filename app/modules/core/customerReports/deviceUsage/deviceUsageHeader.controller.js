(function () {
  'use strict';

  angular
    .module('Core')
    .controller('DeviceUsageHeaderCtrl', DeviceUsageHeaderCtrl);

  /* @ngInject */
  function DeviceUsageHeaderCtrl($scope, $modal, $log, $state, $translate, deviceUsageFeatureToggle, ReportConstants, DeviceUsageCommonService) {
    var vm = this;
    if (!deviceUsageFeatureToggle) {
      // simulate a 404
      $log.warn("State not allowed.");
      $state.go('login');
    }

    vm.timeUpdate = timeUpdate;

    vm.timeOptions = _.cloneDeep(ReportConstants.timeFilter);
    vm.timeSelected = vm.timeOptions[0];

    vm.headerTabs = [{
      title: $translate.instant('reportsPage.sparkReports'),
      state: 'reports'
    }, {
      title: $translate.instant('reportsPage.usageReports.usageReportTitle'),
      state: 'reports.device-usage'
    }];

    vm.tabs = [
      // {
      // title: $translate.instant('reportsPage.usageReports.overview'),
      // state: "reports.device-usage.overview"
      // },
      {
        title: $translate.instant('reportsPage.usageReports.timeline'),
        state: 'reports.device-usage.timeline'
      }, {
        title: $translate.instant('reportsPage.usageReports.distribution'),
        state: 'reports.device-usage.distribution'
      }, {
        title: $translate.instant('reportsPage.usageReports.total'),
        state: 'reports.device-usage.total'
      }];

    vm.pageTitle = $translate.instant('reportsPage.usageReports.usageReportTitle');

    $modal.open({
      type: 'small',
      templateUrl: "modules/core/customerReports/deviceUsage/alpha.html",
    });

    function timeUpdate() {
      $scope.$broadcast('time-range-changed', vm.timeSelected);
      DeviceUsageCommonService.setTimeSelected(vm.timeSelected.value);
    }

  }

})();
