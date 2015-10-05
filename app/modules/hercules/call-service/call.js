(function () {
  'use strict';

  /* @ngInject */
  function CallController($state, $modal, $scope, ClusterService, USSService2, ConverterService, ServiceStatusSummaryService) {
    ClusterService.subscribe(angular.noop, {
      scope: $scope
    });
    var vm = this;
    console.log("call")
    vm.clusters = ClusterService.getClusters();

    vm.hasNoCalendarConnectors = function (cluster) {
      return ServiceStatusSummaryService.serviceFromCluster("c_ucmc", cluster).connectors.length === 0;
    };

    vm.softwareUpgradeAvailable = function (cluster) {
      return ServiceStatusSummaryService.serviceFromCluster("c_ucmc", cluster).software_upgrade_available;
    };

    vm.softwareVersionAvailable = function (cluster) {
      return ServiceStatusSummaryService.serviceFromCluster("c_ucmc", cluster).software_upgrade_available ? ServiceStatusSummaryService.serviceFromCluster("c_ucmc", cluster).not_approved_package.version : "?";
    };

    vm.callAndManagementServiceStatus = function (cluster) {
      return ServiceStatusSummaryService.status("c_ucmc", cluster);
    };

    function extractSummaryForAService(res) {
      var userStatusesSummary = res || {};
      vm.summary = _.find(userStatusesSummary, {
        serviceId: "squared-fusion-uc"
      });
    }

    USSService2.getStatusesSummary().then(extractSummaryForAService);

  }

  /* Based on notifiction-config-controller used in the old cluster view */
  /* @ngInject */
  function CallServiceSettingsController($stateParams, NotificationConfigService, MailValidatorService, XhrNotificationService) {
    var vm = this;
    console.log("CallServiceSettingsController")
    vm.config = "";
  }

  angular
    .module('Hercules')
    .controller('CallController', CallController)
    .controller('CallServiceSettingsController', CallServiceSettingsController);

}());
