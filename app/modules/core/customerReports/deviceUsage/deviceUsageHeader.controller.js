(function () {
  'use strict';

  angular
    .module('Core')
    .controller('DeviceUsageHeaderCtrl', DeviceUsageHeaderCtrl);

  /* @ngInject */
  function DeviceUsageHeaderCtrl($q, $scope, $log, $state, $translate, deviceUsageFeatureToggle, ReportConstants, DeviceUsageCommonService, FeatureToggleService, MediaServiceActivationV2, Authinfo, DeviceUsageSplunkMetricsService) {
    var vm = this;
    if (!deviceUsageFeatureToggle) {
      // simulate a 404
      $log.warn("State not allowed.");
      $state.go('login');
    }

    vm.timeUpdate = timeUpdate;

    vm.timeOptions = _.cloneDeep(ReportConstants.timeFilter);
    vm.timeSelected = vm.timeOptions[0];

    // TODO: Now that there is the customerReportsHeader, the Device Usage Page should utilize that so that
    // all header tabs are accounted for, page conventions are maintained accross all reports pages more easily,
    // and there won't be any unnecessary duplicate code
    vm.headerTabs = [{
      title: $translate.instant('reportsPage.sparkReports'),
      state: 'reports.spark'
    }, {
      title: $translate.instant('reportsPage.usageReports.usageReportMenuTitle'),
      state: 'reports.device-usage'
    }];

    var promises = {
      mf: FeatureToggleService.atlasMediaServiceMetricsGetStatus(),
      care: FeatureToggleService.atlasCareTrialsGetStatus(),
      isMfEnabled: MediaServiceActivationV2.getMediaServiceState()
    };

    $q.all(promises).then(function (features) {
      if (features.mf && features.isMfEnabled) {
        vm.headerTabs.unshift({
          title: $translate.instant('mediaFusion.page_title'),
          state: 'reports.metrics'
        });
      }
      if (Authinfo.isCare() && features.care) {
        vm.headerTabs.push({
          title: $translate.instant('reportsPage.careTab'),
          state: 'reports.care'
        });
      }
    });

    vm.tabs = [
      // {
      // title: $translate.instant('reportsPage.usageReports.overview'),
      // state: "reports.device-usage.overview"
      // },
      {
        title: $translate.instant('reportsPage.usageReports.all'),
        state: 'reports.device-usage.total'
      }
      // ,
      // {
      //   title: $translate.instant('reportsPage.usageReports.timeline'),
      //   state: 'reports.device-usage.timeline'
      // }, {
      //   title: $translate.instant('reportsPage.usageReports.distribution'),
      //   state: 'reports.device-usage.distribution'
      // }
    ];

    vm.pageTitle = $translate.instant('reportsPage.usageReports.usageReportTitle');

    function timeUpdate() {
      $scope.$broadcast('time-range-changed', vm.timeSelected);
      DeviceUsageCommonService.setTimeSelected(vm.timeSelected.value);
      DeviceUsageSplunkMetricsService.reportClick(DeviceUsageSplunkMetricsService.eventTypes.timeRangeSelected, vm.timeSelected);
    }

  }

})();
