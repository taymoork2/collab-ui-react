(function () {
  'use strict';

  // TODO: Don't like this linking to routing name...
  var serviceType2RouteName = function (serviceType) {
    switch (serviceType) {
    case 'c_cal':
      return "calendar-service";
    case 'c_ucmc':
      return "call-service";
    default:
      //console.error("serviceType " + serviceType + " not supported in this controller");
      return "";
    }
  };

  var serviceType2ServiceId = function (serviceType) {
    switch (serviceType) {
    case 'c_cal':
      return "squared-fusion-cal";
    case 'c_ucmc':
      return "squared-fusion-uc";
    default:
      //console.error("serviceType " + serviceType + " not supported in this controller");
      return "";
    }
  };

  /* @ngInject */
  function CallController(FmsNotificationService, ServiceDescriptor, $stateParams, $state, $modal, $scope, ClusterService, USSService2, ConverterService, ServiceStatusSummaryService) {
    ClusterService.subscribe(angular.noop, {
      scope: $scope
    });

    FmsNotificationService.refresh();
    var vm = this;
    vm.state = $state;
    vm.currentServiceType = $state.current.data.serviceType;
    vm.currentServiceId = serviceType2ServiceId(vm.currentServiceType);

    //TODO: Don't like this linking to routes...
    vm.route = serviceType2RouteName(vm.currentServiceType);

    vm.clusters = ClusterService.getClusters();

    vm.startSetupClicked = false;
    vm.startSetup = function () {
      vm.startSetupClicked = true;
    };

    vm.serviceEnabled = false;
    ServiceDescriptor.isServiceEnabled(serviceType2ServiceId(vm.currentServiceType), function (a, b) {
      vm.serviceEnabled = b;
    });

    vm.hasNoCalendarConnectors = function (cluster) {
      return ServiceStatusSummaryService.serviceFromCluster(vm.currentServiceType, cluster).connectors.length === 0;
    };

    vm.softwareUpgradeAvailable = function (cluster) {
      return ServiceStatusSummaryService.serviceFromCluster(vm.currentServiceType, cluster).software_upgrade_available;
    };

    vm.softwareVersionAvailable = function (cluster) {
      return ServiceStatusSummaryService.serviceFromCluster(vm.currentServiceType, cluster).software_upgrade_available ? ServiceStatusSummaryService.serviceFromCluster("c_ucmc", cluster).not_approved_package.version : "?";
    };

    vm.selectedServiceAndManagementServiceStatus = function (cluster) {
      return ServiceStatusSummaryService.status(vm.currentServiceType, cluster);
    };

    function extractSummaryForAService(res) {
      var userStatusesSummary = res || {};
      vm.summary = _.find(userStatusesSummary, {
        serviceId: serviceType2ServiceId(vm.currentServiceType)
      });
    }

    USSService2.getStatusesSummary().then(extractSummaryForAService);
  }

  /* @ngInject */
  function CallClusterSettingsController($stateParams) {
    var vm = this;
    vm.cluster = $stateParams.cluster;
  }

  /* @ngInject */
  function CallDetailsController($state, $modal, $stateParams, ClusterService) {
    var vm = this;
    vm.state = $state;
    vm.clusterId = $stateParams.cluster.id;
    vm.serviceType = $stateParams.serviceType;

    vm.cluster = ClusterService.getClusters()[vm.clusterId];

    vm.selectedService = _.find(vm.cluster.services, {
      service_type: vm.serviceType
    });
    vm.managementService = _.find(vm.cluster.services, {
      service_type: "c_mgmt"
    });
    //console.log("selected service ", vm.selectedService);

    //TODO: Don't like this linking to routes...
    vm.route = serviceType2RouteName(vm.serviceType);

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

      alarmsVm.ok = function () {
        $modalInstance.close();
      };
      alarmsVm.cancel = function () {
        $modalInstance.dismiss();
      };
    }
  }

  /* @ngInject */
  function DisableConfirmController(ServiceDescriptor, $modalInstance, serviceId) {
    var modalVm = this;
    modalVm.serviceId = serviceId;
    modalVm.serviceIconClass = ServiceDescriptor.serviceIcon(serviceId);

    modalVm.ok = function () {
      $modalInstance.close();
    };
    modalVm.cancel = function () {
      $modalInstance.dismiss();
    };
  }

  /* @ngInject */
  function CallServiceSettingsController($scope, $modal, ServiceDescriptor, Authinfo, USSService2, $stateParams, NotificationConfigService, MailValidatorService, XhrNotificationService) {
    var vm = this;
    vm.config = "";
    vm.serviceEnabled = false;
    vm.serviceType = $stateParams.serviceType;
    vm.serviceId = serviceType2ServiceId(vm.serviceType);

    //console.log("Settingscontroller stateparams:", $stateParams)

    vm.squaredFusionEc = false;
    ServiceDescriptor.isServiceEnabled("squared-fusion-ec", function (a, b) {
      vm.squaredFusionEc = b;
    });

    ServiceDescriptor.isServiceEnabled(vm.serviceId, function (a, b) {
      vm.serviceEnabled = b;
    });

    vm.toggleEc = function () {
      ServiceDescriptor.setServiceEnabled("squared-fusion-ec", vm.squaredFusionEc, function (a, b) {});
    };

    vm.loading = true;
    USSService2.getOrg(Authinfo.getOrgId()).then(function (res) {
      vm.loading = false;
      vm.sipDomain = res.sipDomain;
      vm.org = res || {};
    }, function (err) {
      //  if (err) return notification.notify(err);
    });
    //UssService.getOrg(Authinfo.getOrgId(), function (err, org) {
    //  $scope.loading = false;
    //  if (err) return notification.notify(err);
    //  console.log("vm",vm)
    //  vm.org = org || {};
    //});

    vm.updateSipDomain = function () {
      vm.sipError = null;
      vm.savingSip = true;

      USSService2.updateOrg(vm.org).then(function (res) {
        vm.savingSip = false;
      }, function (err) {
        vm.savingSip = false;
        vm.sipError = "SIP domain was invalid. Please enter a valid SIP domain or IP address.";
      });
      //$scope.error = null;
      //$scope.saving = true;
      //ussService.updateOrg($scope.org, function (err) {
      //  $scope.saving = false;
      //  if (err) {
      //    $scope.error = "SIP domain was invalid. Please enter a valid SIP domain or IP address.";
      //  } else {
      //    $scope.$parent.modal.close();
      //  }
      //});

    };

    //
    //  PURE COPY FROM CALENDAR !!!
    //  CANDIDATE FOR SEPARATE SERVICE ?
    //

    vm.config = "";
    NotificationConfigService.read(function (err, config) {
      vm.loading = false;
      if (err) {
        //console.log("Error:", err);
        return XhrNotificationService.notify(err);
      }
      vm.config = config || {};
    });
    vm.cluster = $stateParams.cluster;

    vm.writeConfig = function () {
      if (vm.config.wx2users && !MailValidatorService.isValidEmailCsv(vm.config.wx2users)) {
        vm.emailError = "Please enter a list of comma-separated email addresses";
      } else {
        vm.emailError = null;
        vm.savingEmail = true;
        NotificationConfigService.write(vm.config, function (err) {
          vm.savingEmail = false;
          if (err) {
            return XhrNotificationService.notify(err);
          }
        });
      }
    };

    vm.disableService = function (serviceId) {
      ServiceDescriptor.setServiceEnabled(serviceId, false, function (error) {
        //console.log("ERROR disabling service:", error);
      });
      vm.serviceEnabled = false;
    };

    vm.confirmDisable = function (serviceId) {
      $modal.open({
        templateUrl: "modules/hercules/call-service/confirm-disable.html",
        controller: DisableConfirmController,
        controllerAs: "disableConfirmDialog",
        resolve: {
          serviceId: function () {
            return serviceId;
          }
        }
      }).result.then(function () {
        vm.disableService(serviceId);
        //TODO: should go to a new page after deactivate the service !!!
      });
    };

  }

  angular
    .module('Hercules')
    .controller('CallController', CallController)
    .controller('CallDetailsController', CallDetailsController)
    .controller('CallClusterSettingsController', CallClusterSettingsController)
    .controller('CallServiceSettingsController', CallServiceSettingsController)
    .controller('DisableConfirmController', DisableConfirmController);

}());
