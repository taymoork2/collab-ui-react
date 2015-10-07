(function () {
  'use strict';

  /* @ngInject */
  function CallController($state, $modal, $scope, ClusterService, USSService2, ConverterService, ServiceStatusSummaryService) {
    ClusterService.subscribe(angular.noop, {
      scope: $scope
    });
    var vm = this;
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

  /* Based on notifiction-config-controller used in the old cluster view */
  /* @ngInject */
  function CallServiceSettingsController($scope, $modal, ServiceDescriptor, Authinfo, USSService2, $stateParams, NotificationConfigService, MailValidatorService, XhrNotificationService) {
    var vm = this;
    vm.config = "";

    vm.serviceEnabled = false;

    vm.squaredFusionEc = false;
    ServiceDescriptor.isServiceEnabled("squared-fusion-ec", function (a, b) {
      vm.squaredFusionEc = b;
    });

    ServiceDescriptor.isServiceEnabled("squared-fusion-uc", function (a, b) {
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
    .controller('CallServiceSettingsController', CallServiceSettingsController)
    .controller('DisableConfirmController', DisableConfirmController);

}());
