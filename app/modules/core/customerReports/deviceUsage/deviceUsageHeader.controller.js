(function () {
  'use strict';

  angular
    .module('Core')
    .controller('DeviceUsageHeaderCtrl', DeviceUsageHeaderCtrl);

  /* @ngInject */
  function DeviceUsageHeaderCtrl($modal, $log, $state, $translate, deviceUsageFeatureToggle) {
    var vm = this;
    if (!deviceUsageFeatureToggle) {
      // simulate a 404
      $log.warn("State not allowed.");
      $state.go('login');
    }

    vm.tabs = [{
      title: $translate.instant('reportsPage.usageReports.overview'),
      state: "reports.device-usage.overview"
    }, {
      title: $translate.instant('reportsPage.usageReports.timeline'),
      state: "reports.device-usage.timeline"
    }, {
      title: $translate.instant('reportsPage.usageReports.distribution'),
      state: "reports.device-usage.distribution"
    }];

    vm.pageTitle = $translate.instant('reportsPage.usageReports.usageReportTitle');

    $modal.open({
      type: 'small',
      templateUrl: "modules/core/customerReports/deviceUsage/alpha.html",
    });

  }

})();
