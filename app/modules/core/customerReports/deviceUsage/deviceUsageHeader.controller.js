(function () {
  'use strict';

  angular
    .module('Core')
    .controller('DeviceUsageHeaderCtrl', DeviceUsageHeaderCtrl);

  /* @ngInject */
  function DeviceUsageHeaderCtrl($scope, $log, $state, $translate, deviceUsageFeatureToggle, ReportConstants, DeviceUsageCommonService) {
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
        title: $translate.instant('reportsPage.usageReports.all'),
        state: 'reports.device-usage.total'
      }, {
        title: $translate.instant('reportsPage.usageReports.timeline'),
        state: 'reports.device-usage.timeline'
      }, {
        title: $translate.instant('reportsPage.usageReports.distribution'),
        state: 'reports.device-usage.distribution'
      }];

    vm.pageTitle = $translate.instant('reportsPage.usageReports.usageReportTitle');

    function timeUpdate() {
      $scope.$broadcast('time-range-changed', vm.timeSelected);
      DeviceUsageCommonService.setTimeSelected(vm.timeSelected.value);
    }

  }

})();
