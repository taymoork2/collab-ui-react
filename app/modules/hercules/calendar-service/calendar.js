(function () {
  'use strict';

  /* @ngInject */
  function CalendarController(FmsNotificationService, $state, $modal, $scope, ClusterService, USSService2, ConverterService,
    ServiceStatusSummaryService) {
    ClusterService.subscribe(angular.noop, {
      scope: $scope
    });
    var vm = this;
    vm.state = $state;

    FmsNotificationService.refresh();

    vm.clusters = ClusterService.getClusters();

    vm.hasNoCalendarConnectors = function (cluster) {
      return ServiceStatusSummaryService.serviceFromCluster("c_cal", cluster).connectors.length === 0;
    };

    vm.softwareUpgradeAvailable = function (cluster) {
      return ServiceStatusSummaryService.serviceFromCluster("c_cal", cluster).software_upgrade_available;
    };

    vm.softwareVersionAvailable = function (cluster) {
      return ServiceStatusSummaryService.serviceFromCluster("c_cal", cluster).software_upgrade_available ? ServiceStatusSummaryService.serviceFromCluster(
        "c_cal", cluster).not_approved_package.version : "?";
    };

    vm.calendarAndManagementServiceStatus = function (cluster) {
      return ServiceStatusSummaryService.status("c_cal", cluster);
    };

    function extractSummaryForAService(res) {
      var userStatusesSummary = res || {};
      vm.summary = _.find(userStatusesSummary, {
        serviceId: "squared-fusion-cal"
      });
    }

    USSService2.getStatusesSummary().then(extractSummaryForAService);

    // TODO: Fix up the userStatusesReport modal because it now uses the same as the "old" cluster view.
    // TODO: Use controllerAs etc. as in the other popups...
    vm.openUserStatusReportModal = function () {
      $scope.selectedServiceId = "squared-fusion-cal";
      $scope.modal = $modal.open({
        scope: $scope,
        controller: 'ExportUserStatusesController',
        templateUrl: 'modules/hercules/export/export-user-statuses.html'
      });
    };

  }

  /* @ngInject */
  function CalendarClusterSettingsController($stateParams) {
    var vm = this;
    vm.cluster = $stateParams.cluster;
  }

  /* Based on notifiction-config-controller used in the old cluster view */
  /* @ngInject */
  function CalendarServiceSettingsController($stateParams, NotificationConfigService, MailValidatorService, XhrNotificationService) {
    var vm = this;

    vm.config = "";

    NotificationConfigService.read(function (err, config) {
      vm.loading = false;
      if (err) return XhrNotificationService.notify(err);
      vm.config = config || {};
    });
    vm.cluster = $stateParams.cluster;

    vm.writeConfig = function () {
      if (vm.config.wx2users && !MailValidatorService.isValidEmailCsv(vm.config.wx2users)) {
        vm.error = "Please enter a list of comma-separated email addresses";
      } else {
        vm.error = null;
        vm.saving = true;
        NotificationConfigService.write(vm.config, function (err) {
          vm.saving = false;
          if (err) return XhrNotificationService.notify(err);
        });
      }
    };
  }

  /* @ngInject */
  function CalendarDetailsController($state, $modal, $stateParams, ClusterService) {
    var vm = this;
    vm.state = $state;
    vm.clusterId = $stateParams.cluster.id;
    vm.cluster = ClusterService.getClusters()[vm.clusterId];
    //console.log("cluster", vm.cluster);
    vm.selectedService = _.find(vm.cluster.services, {
      service_type: "c_cal"
    });
    vm.managementService = _.find(vm.cluster.services, {
      service_type: "c_mgmt"
    });
    //console.log("selected service ", vm.selectedService);
    //console.log("managementService ", vm.managementService);

    vm.upgrade = function () {
      $modal.open({
        templateUrl: "modules/hercules/calendar-service/software-upgrade.html",
        controller: SoftwareUpgradeController,
        controllerAs: "softwareUpgrade"
      }).result.then(function () {
        //console.log("Starting upgrade dialog...");
      });
    };

    vm.showAlarms = function () {
      $modal.open({
        templateUrl: "modules/hercules/calendar-service/alarms.html",
        controller: AlarmsController,
        controllerAs: "alarmsDialog"
      }).result.then(function () {
        //console.log("Starting alarms dialog...");
      });
    };

    /* @ngInject */
    function SoftwareUpgradeController($modalInstance) {
      var modalVm = this;
      modalVm.newVersion = vm.selectedService.not_approved_package.version;
      modalVm.oldVersion = vm.selectedService.connectors[0].version;
      modalVm.ok = function () {
        $modalInstance.close();
      };
      modalVm.cancel = function () {
        $modalInstance.dismiss();
      };
      modalVm.clusterName = vm.cluster.name;
      //console.log("SoftwareUpgradeController", modalVm.clusterName);
    }

    /* @ngInject */
    function AlarmsController($modalInstance) {
      var alarmsVm = this;
      alarmsVm.connectors = vm.selectedService.connectors;

      alarmsVm.colorFromSeverity = function (alarm) {
        if (alarm.severity === "error") {
          return "red";
        } else if (alarm.severity === "critical") {
          return "orange";
        } else {
          return "black";
        }
      };

      //console.log("AlarmsDialog", alarmsVm.connectors);
      alarmsVm.ok = function () {
        $modalInstance.close();
      };
      alarmsVm.cancel = function () {
        $modalInstance.dismiss();
      };
    }

  }

  angular
    .module('Hercules')
    .controller('CalendarController', CalendarController)
    .controller('CalendarDetailsController', CalendarDetailsController)
    .controller('CalendarServiceSettingsController', CalendarServiceSettingsController)
    .controller('CalendarClusterSettingsController', CalendarClusterSettingsController);

}());
