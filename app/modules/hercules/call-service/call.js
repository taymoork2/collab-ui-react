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

  //TODO: Rewrite or use some existing stuff !!!!!!!!!!!!
  var enableEmailValidation = function () {
    //TODO: Someone rewrite code below - it's just a placeholder
    //No real functionality here, just needed something so I could style the input

    $(document).on('keyup', '#add-mails', function (e) {
      //console.log(e.keyCode);
      switch (e.keyCode) {
      case 13:
        addMail();
        break;

      case 186:
        addMail();
        break;

      case 188:
        addMail();
        break;
      }

      function addMail() {
        var mail = $("#add-mails").val();
        var pattern = /^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i;
        if (mail.indexOf(",") > -1 || mail.indexOf(";") > -1) {
          //console.log("has , or ;");
          mail = mail.slice(0, -1);
        }

        if (mail !== "") {
          if (!pattern.test(mail)) {
            $("#existing-mails").append("<p class='token-label alert'>" + mail + "<span class='del icon icon-close'></span></p>");
          } else {
            $("#existing-mails").append("<p class='token-label'>" + mail + "<span class='del icon icon-close'></span></p>");
          }
        }

        $("#add-mails").val("");
      }
    });
  };

  /* @ngInject */
  function CallController(NotificationService, FmsNotificationService, ServiceDescriptor, $stateParams, $state, $modal, $scope, ClusterService, USSService2, ConverterService, ServiceStatusSummaryService) {
    ClusterService.subscribe(angular.noop, {
      scope: $scope
    });

    var vm = this;
    vm.state = $state;
    vm.currentServiceType = $state.current.data.serviceType;
    vm.currentServiceId = serviceType2ServiceId(vm.currentServiceType);
    vm.selectedRow = -1;
    //TODO: Don't like this linking to routes...
    vm.route = serviceType2RouteName(vm.currentServiceType);

    vm.clusters = ClusterService.getClusters();
    vm.clusterLength = _.size(vm.clusters);

    FmsNotificationService.refresh();

    vm.startSetupClicked = false;
    vm.startSetup = function () {
      vm.startSetupClicked = true;
    };

    vm.serviceEnabled = false;
    ServiceDescriptor.isServiceEnabled(serviceType2ServiceId(vm.currentServiceType), function (a, b) {
      vm.serviceEnabled = b;
      if (!b) {
        NotificationService.addNotification(
          'todo',
          'serviceNotEnabled',
          1,
          'modules/hercules/notifications/service-not-enabled.html', {});
      } else {
        NotificationService.removeNotification('todo', 'serviceNotEnabled');
      }
    });

    vm.serviceNotInstalled = function (cluster) {
      var serviceInfo = ServiceStatusSummaryService.serviceFromCluster(vm.currentServiceType, cluster);
      if (serviceInfo === undefined) {
        return true;
      } else {
        return serviceInfo.connectors.length === 0;
      }
    };

    vm.softwareUpgradeAvailable = function (cluster) {
      var serviceInfo = ServiceStatusSummaryService.serviceFromCluster(vm.currentServiceType, cluster);
      if (serviceInfo === undefined) {
        return false;
      } else {
        return serviceInfo.software_upgrade_available;
      }
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
  function CallDetailsController(XhrNotificationService, ServiceDescriptor, ServiceStatusSummaryService, $state, $modal, $stateParams, ClusterService) {
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

    vm.serviceNotInstalled = function () {
      var serviceInfo = ServiceStatusSummaryService.serviceFromCluster(vm.serviceType, vm.cluster);
      if (serviceInfo === undefined) {
        return true;
      } else {
        return serviceInfo.connectors.length === 0;
      }
    };

    vm.upgrade = function () {
      $modal.open({
        templateUrl: "modules/hercules/call-service/software-upgrade-dialog.html",
        controller: SoftwareUpgradeController,
        controllerAs: "softwareUpgrade"
      }).result.then(function () {
        //console.log("Starting upgrade dialog...");
      });
    };

    vm.showAlarms = function () {
      $modal.open({
        templateUrl: "modules/hercules/call-service/alarms.html",
        controller: AlarmsController,
        controllerAs: "alarmsDialog"
      }).result.then(function () {
        //console.log("Starting alarms dialog...");
      });
    };

    /*
    vm.enableService = function (serviceId) {
      ServiceDescriptor.setServiceEnabled(serviceId, true, function (error) {
        XhrNotificationService.notify("Problems enabling the service")
        //console.log("ERROR disabling service:", error);
      });
      console.log("activate service")
      vm.serviceEnabled = true;
    };
    */

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
  function CallServiceSettingsController($scope, $modal, ServiceDescriptor, Authinfo, USSService2, $stateParams, NotificationConfigService, MailValidatorService, XhrNotificationService, CertService) {
    var vm = this;
    vm.config = "";
    vm.serviceEnabled = false;
    vm.serviceType = $stateParams.serviceType;
    vm.serviceId = serviceType2ServiceId(vm.serviceType);

    enableEmailValidation();

    var readCerts = function () {
      CertService.getCerts(Authinfo.getOrgId()).then(function (res) {
        vm.certificates = res || [];
      }, function (err) {
        return XhrNotificationService.notify(err);
      });
    };

    vm.squaredFusionEc = false;
    ServiceDescriptor.isServiceEnabled("squared-fusion-ec", function (a, b) {
      vm.squaredFusionEc = b;
      //if (vm.squaredFusionEc) {
      readCerts();
      //}
    });

    ServiceDescriptor.isServiceEnabled(vm.serviceId, function (a, b) {
      vm.serviceEnabled = b;
    });

    vm.storeEc = function () {
      //console.log("store ec", vm.squaredFusionEc)
      ServiceDescriptor.setServiceEnabled("squared-fusion-ec", vm.squaredFusionEc, function (a, b) {});
      if (vm.squaredFusionEc) {
        readCerts();
      }
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
        XhrNotificationService.notify("Problems disabling the service");
        //console.log("ERROR disabling service:", error);
      });
      vm.serviceEnabled = false;
    };

    vm.confirmDisable = function (serviceId) {
      $modal.open({
        templateUrl: "modules/hercules/call-service/confirm-disable-dialog.html",
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

    vm.uploadCert = function (file, event) {
      if (!file) {
        return;
      }
      CertService.uploadCert(Authinfo.getOrgId(), file).then(readCerts, XhrNotificationService.notify);
    };

    vm.deleteCert = function (certId) {
      CertService.deleteCert(certId).then(readCerts, XhrNotificationService.notify);
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
