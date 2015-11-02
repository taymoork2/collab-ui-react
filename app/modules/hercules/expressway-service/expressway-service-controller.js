(function () {
  'use strict';

  /* @ngInject */
  function ExpresswayServiceController(XhrNotificationService, ServiceStateChecker, ServiceDescriptor, $state,
    $modal, $scope, ClusterService, USSService2, ServiceStatusSummaryService, HelperNuggetsService) {

    ClusterService.subscribe('data', clustersUpdated, {
      scope: $scope
    });

    USSService2.subscribeStatusesSummary('data', extractSummaryForAService, {
      scope: $scope
    });

    var vm = this;
    vm.loading = true;
    vm.state = $state;
    vm.currentServiceType = $state.current.data.serviceType;
    vm.currentServiceId = HelperNuggetsService.serviceType2ServiceId(vm.currentServiceType);
    vm.selectedRow = -1;
    //TODO: Don't like this linking to routes...
    vm.route = HelperNuggetsService.serviceType2RouteName(vm.currentServiceType);
    vm.notificationTag = vm.currentServiceId;
    vm.clusters = _.values(ClusterService.getClusters());
    vm.clusterLength = function () {
      return _.size(vm.clusters);
    };
    vm.serviceIconClass = ServiceDescriptor.serviceIcon(vm.currentServiceId);

    if (vm.currentServiceId == "squared-fusion-mgmt") {
      ServiceDescriptor.services(function (error, services) {
        if (!error) {
          vm.serviceEnabled = _.any(ServiceDescriptor.filterAllExceptManagement(services), {
            enabled: true
          });
          vm.loading = false;
        }
      });
    } else {
      vm.serviceEnabled = false;
      ServiceDescriptor.isServiceEnabled(HelperNuggetsService.serviceType2ServiceId(vm.currentServiceType), function (a, b) {
        vm.serviceEnabled = b;
        vm.loading = false;
      });
    }

    vm.serviceNotInstalled = function (cluster) {
      return ServiceStatusSummaryService.serviceNotInstalled(vm.currentServiceType, cluster);
    };

    vm.softwareUpgradeAvailable = function (cluster) {
      return ServiceStatusSummaryService.softwareUpgradeAvailable(vm.currentServiceType, cluster);
    };

    vm.softwareVersionAvailable = function (cluster) {
      return ServiceStatusSummaryService.serviceFromCluster(vm.currentServiceType, cluster).software_upgrade_available ?
        ServiceStatusSummaryService.serviceFromCluster(vm.currentServiceType, cluster).not_approved_package.version : "?";
    };

    vm.selectedClusterAggregatedStatus = function (cluster) {
      return ServiceStatusSummaryService.clusterAggregatedStatus(vm.currentServiceType, cluster);
    };

    function clustersUpdated() {
      ServiceStateChecker.checkState(vm.currentServiceType, vm.currentServiceId);
      vm.clusters = _.values(ClusterService.getClusters());
    }

    function extractSummaryForAService() {
      vm.userStatusSummary = _.find(USSService2.getStatusesSummary(), {
        serviceId: HelperNuggetsService.serviceType2ServiceId(vm.currentServiceType)
      });
    }

    vm.openUserStatusReportModal = function (serviceId) {
      $scope.selectedServiceId = serviceId; //TODO: Fix. Currently compatible with "old" concept...
      $scope.modal = $modal.open({
        scope: $scope,
        controller: 'ExportUserStatusesController',
        templateUrl: 'modules/hercules/export/export-user-statuses.html'
      });
    };

    vm.enableService = function (serviceId) {
      ServiceDescriptor.setServiceEnabled(serviceId, true, function (error) {
        if (error !== null) {
          XhrNotificationService.notify("Problems enabling the service");
        }
      });
      vm.serviceEnabled = true;
    };

    vm.showClusterDetails = function (cluster) {
      $state.go('cluster-details-new', {
        cluster: cluster,
        serviceType: vm.currentServiceType
      });
    };

    vm.clusterListGridOptions = {
      data: 'exp.clusters',
      enableSorting: false,
      multiSelect: false,
      showFilter: false,
      showFooter: false,
      rowHeight: 75,
      rowTemplate: 'modules/hercules/expressway-service/cluster-list-row-template.html',
      headerRowHeight: 44,
      columnDefs: [{
        field: 'name',
        displayName: 'Expressway Clusters',
        cellTemplate: 'modules/hercules/expressway-service/cluster-list-display-name.html',
        width: '35%'
      }, {
        displayName: 'Service Status',
        cellTemplate: 'modules/hercules/expressway-service/cluster-list-status.html',
        width: '65%'
      }]
    };

    vm.openUserErrorsModal = function () {
      $scope.modal = $modal.open({
        scope: $scope,
        controller: 'UserErrorsController',
        controllerAs: 'userErrorsCtrl',
        templateUrl: 'modules/hercules/expressway-service/user-errors.html',
        resolve: {
          serviceId: function () {
            return vm.currentServiceId;
          }
        }
      });
    };
  }

  /* @ngInject */
  function ExpresswayServiceDetailsController(XhrNotificationService, ServiceStatusSummaryService, $state, $modal, $stateParams, ClusterService, HelperNuggetsService) {
    var vm = this;
    vm.state = $state;
    vm.clusterId = $stateParams.cluster.id;
    vm.serviceType = $stateParams.serviceType;
    vm.serviceId = HelperNuggetsService.serviceType2ServiceId(vm.serviceType);

    vm.cluster = ClusterService.getClusters()[vm.clusterId];

    vm.selectedService = function () {
      return _.find(vm.cluster.services, {
        service_type: vm.serviceType
      });
    };

    vm.alarms2hosts = _.memoize(function () {
      var alarms = {};

      _.forEach(vm.selectedService().connectors, function (conn) {
        _.forEach(conn.alarms, function (alarm) {
          if (!alarms[alarm.id]) {
            alarms[alarm.id] = {
              alarm: alarm,
              hosts: []
            };
          }
          alarms[alarm.id].hosts.push(conn.host);
        });
      });
      var mappedAlarms = _.toArray(alarms);
      return mappedAlarms;
    });

    //TODO: Don't like this linking to routes...
    vm.route = HelperNuggetsService.serviceType2RouteName(vm.serviceType);

    vm.serviceNotInstalled = function () {
      return ServiceStatusSummaryService.serviceNotInstalled(vm.serviceType, vm.cluster);
    };

    vm.upgrade = function () {
      $modal.open({
        templateUrl: "modules/hercules/expressway-service/software-upgrade-dialog.html",
        controller: SoftwareUpgradeController,
        controllerAs: "softwareUpgrade",
        resolve: {
          serviceId: function () {
            return vm.serviceId;
          }
        }
      }).result.then(function () {
        ClusterService
          .upgradeSoftware(vm.clusterId, vm.serviceType)
          .then(function () {}, XhrNotificationService.notify);
      });
    };

    /* @ngInject */
    function SoftwareUpgradeController(serviceId, $modalInstance) {
      var modalVm = this;
      modalVm.newVersion = vm.selectedService().not_approved_package.version;
      modalVm.oldVersion = vm.selectedService().connectors[0].version;
      modalVm.serviceId = serviceId;
      modalVm.ok = function () {
        $modalInstance.close();
      };
      modalVm.cancel = function () {
        $modalInstance.dismiss();
      };
      modalVm.clusterName = vm.cluster.name;
    }
  }

  /* @ngInject */
  function AlarmController($stateParams) {
    var vm = this;
    vm.alarm = $stateParams.alarm;
    vm.host = $stateParams.host;
  }

  /* @ngInject */
  function HostDetailsController($stateParams, $state, ClusterService, XhrNotificationService) {
    var vm = this;
    vm.host = $stateParams.host;
    vm.cluster = ClusterService.getClusters()[$stateParams.clusterId];
    vm.serviceType = $stateParams.serviceType;
    vm.connector = function () {
      var service = _.find(vm.cluster.services, {
        service_type: vm.serviceType
      });
      return _.find(service.connectors, function (connector) {
        return connector.host.serial == vm.host.serial;
      });
    };

    vm.deleteHost = function () {
      return ClusterService.deleteHost(vm.cluster.id, vm.connector().host.serial).then(function () {
        if (ClusterService.getClusters()[vm.cluster.id]) {
          $state.go('cluster-details', {
            clusterId: vm.cluster.id
          });
        } else {
          $state.sidepanel.close();
        }
      }, XhrNotificationService.notify);
    };
  }

  /* @ngInject */
  function ExpresswayClusterSettingsController(ServiceStatusSummaryService, $modal, $stateParams, ClusterService, $scope, XhrNotificationService) {
    var vm = this;
    vm.clusterId = $stateParams.clusterId;
    vm.serviceType = $stateParams.serviceType;
    vm.cluster = ClusterService.getClusters()[vm.clusterId];
    vm.saving = false;

    vm.selectedService = function () {
      return _.find(vm.cluster.services, {
        service_type: vm.serviceType
      });
    };

    vm.activeActiveApplicable = (vm.serviceType == 'c_cal' || vm.serviceType == 'c_ucmc');
    vm.activeActivePossible = vm.cluster.hosts.length > 1;
    vm.activeActiveEnabled = vm.activeActiveApplicable && isActiveActiveEnabled(vm.cluster, vm.serviceType);
    vm.activeActiveEnabledOld = vm.activeActiveApplicable && isActiveActiveEnabled(vm.cluster, vm.serviceType);

    var managementServiceType = "c_mgmt";
    vm.managementService = _.find(vm.cluster.services, {
      service_type: managementServiceType
    });

    vm.serviceNotInstalled = function () {
      return ServiceStatusSummaryService.serviceNotInstalled(vm.serviceType, vm.cluster);
    };

    function isActiveActiveEnabled(cluster, serviceType) {
      return cluster.properties && cluster.properties[activeActivePropertyName(serviceType)] == 'activeActive';
    }

    function activeActivePropertyName(serviceType) {
      switch (serviceType) {
      case 'c_cal':
        return 'fms.calendarAssignmentType';
      case 'c_ucmc':
        return 'fms.callManagerAssignmentType';
      default:
        return '';
      }
    }

    vm.showDeregisterDialog = function () {
      $modal.open({
        resolve: {
          cluster: function () {
            return vm.cluster;
          }
        },
        controller: 'ClusterDeregisterController',
        controllerAs: "clusterDeregister",
        templateUrl: 'modules/hercules/cluster-deregister/deregister-dialog.html'
      });
    };

    $scope.$watch('expresswayClusterSettingsCtrl.activeActiveEnabled', function (newVal, oldVal) {
      if (newVal !== undefined && newVal != oldVal) {
        vm.showButtons = newVal != vm.activeActiveEnabledOld;
      }
    });

    vm.save = function () {
      vm.saving = true;
      ClusterService.setProperty(vm.clusterId, activeActivePropertyName(vm.serviceType), vm.activeActiveEnabled ? 'activeActive' : 'standard')
        .then(function () {
          vm.saving = false;
        }, XhrNotificationService.notify);
    };

    vm.cancel = function () {
      vm.showButtons = false;
      vm.activeActiveEnabled = vm.activeActiveEnabledOld;
    };
  }

  /* @ngInject */
  function UserErrorsController(serviceId, USSService, XhrNotificationService, Userservice, ClusterService) {
    var vm = this;
    vm.loading = true;
    vm.limit = 5;
    vm.serviceId = serviceId;

    USSService.getStatuses(function (error, statuses) {
      if (error) {
        XhrNotificationService.notify("Failed to fetch user statuses", error);
        return;
      }
      if (statuses) {
        vm.totalCount = statuses.paging.count;
        vm.userStatuses = [];
        var connectorIds = [];

        _.forEach(statuses.userStatuses, function (userStatus) {
          if (userStatus.connectorId && !_.contains(connectorIds, userStatus.connectorId)) {
            connectorIds.push(userStatus.connectorId);
          }
          Userservice.getUser(userStatus.userId, function (data, status) {
            if (data.success) {
              userStatus.displayName = data.displayName || data.userName;
              vm.userStatuses.push(userStatus);
            }
          });
          return status;
        });

        _.forEach(connectorIds, function (connectorId) {
          ClusterService.getConnector(connectorId).then(function (connector) {
            if (connector) {
              _.forEach(statuses.userStatuses, function (userStatus) {
                if (userStatus.connectorId === connectorId) {
                  userStatus.connector = connector;
                }
              });
            }
          });
        });

      } else {
        vm.totalCount = 0;
        vm.userStatuses = [];
      }
      vm.loading = false;
    }, vm.serviceId, 'error', vm.limit);
  }

  angular
    .module('Hercules')
    .controller('ExpresswayServiceController', ExpresswayServiceController)
    .controller('ExpresswayServiceDetailsController', ExpresswayServiceDetailsController)
    .controller('ExpresswayClusterSettingsController', ExpresswayClusterSettingsController)
    .controller('AlarmController', AlarmController)
    .controller('HostDetailsController', HostDetailsController)
    .controller('UserErrorsController', UserErrorsController);
}());
