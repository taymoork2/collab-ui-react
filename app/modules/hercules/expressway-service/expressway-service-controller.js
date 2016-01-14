(function () {
  'use strict';

  /* @ngInject */
  function ExpresswayServiceController(XhrNotificationService, ServiceStateChecker, ServiceDescriptor, $state,
    $modal, $scope, $translate, ClusterService, USSService2, ServiceStatusSummaryService, HelperNuggetsService, ScheduleUpgradeChecker) {

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

    // Added for cs-page-header
    vm.pageTitle = $translate.instant('hercules.serviceNames.' + vm.currentServiceId);
    vm.tabs = [{
      title: $translate.instant('common.resources'),
      state: vm.route + '.list'
    }, {
      title: $translate.instant('common.settings'),
      state: vm.route + '.settings({serviceType:vm.currentServiceType})'
    }];

    vm.notificationTag = vm.currentServiceId;
    vm.clusters = ClusterService.getExpresswayClusters();
    vm.serviceIconClass = ServiceDescriptor.serviceIcon(vm.currentServiceId);
    vm.clusterLength = clusterLength;
    vm.serviceNotInstalled = serviceNotInstalled;
    vm.softwareUpgradeAvailable = softwareUpgradeAvailable;
    vm.softwareVersionAvailable = softwareVersionAvailable;
    vm.selectedClusterAggregatedStatus = selectedClusterAggregatedStatus;
    vm.openUserStatusReportModal = openUserStatusReportModal;
    vm.enableService = enableService;
    vm.showClusterDetails = showClusterDetails;
    vm.openUserErrorsModal = openUserErrorsModal;

    vm.clusterListGridOptions = {
      data: 'exp.clusters',
      enableSorting: false,
      multiSelect: false,
      enableRowHeaderSelection: false,
      enableColumnResize: true,
      enableColumnMenus: false,
      rowHeight: 75,
      onRegisterApi: function (gridApi) {
        $scope.gridApi = gridApi;
        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
          $scope.exp.showClusterDetails(row.entity);
        });
      },
      columnDefs: [{
        field: 'name',
        displayName: $translate.instant('hercules.overview.clusters-title'),
        cellTemplate: 'modules/hercules/expressway-service/cluster-list-display-name.html',
        width: '35%'
      }, {
        field: 'serviceStatus',
        displayName: $translate.instant('hercules.overview.status-title'),
        cellTemplate: 'modules/hercules/expressway-service/cluster-list-status.html',
        width: '65%'
      }]
    };

    ScheduleUpgradeChecker.check(vm.currentServiceType, vm.currentServiceId, vm.route + '.settings({serviceType:vm.currentServiceType})');

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

    function clusterLength() {
      return _.size(vm.clusters);
    }

    function serviceNotInstalled(cluster) {
      return ServiceStatusSummaryService.serviceNotInstalled(vm.currentServiceType, cluster);
    }

    function softwareUpgradeAvailable(cluster) {
      return ServiceStatusSummaryService.softwareUpgradeAvailable(vm.currentServiceType, cluster);
    }

    function softwareVersionAvailable(cluster) {
      return ServiceStatusSummaryService.serviceFromCluster(vm.currentServiceType, cluster).software_upgrade_available ?
        ServiceStatusSummaryService.serviceFromCluster(vm.currentServiceType, cluster).not_approved_package.version : "?";
    }

    function selectedClusterAggregatedStatus(cluster) {
      return ServiceStatusSummaryService.clusterAggregatedStatus(vm.currentServiceType, cluster);
    }

    function clustersUpdated() {
      ServiceStateChecker.checkState(vm.currentServiceType, vm.currentServiceId);
      vm.clusters = ClusterService.getExpresswayClusters();
    }

    function extractSummaryForAService() {
      vm.userStatusSummary = _.find(USSService2.getStatusesSummary(), {
        serviceId: HelperNuggetsService.serviceType2ServiceId(vm.currentServiceType)
      });
    }

    function openUserStatusReportModal(serviceId) {
      $scope.modal = $modal.open({
        controller: 'ExportUserStatusesController',
        controllerAs: 'exportUserStatusesCtrl',
        templateUrl: 'modules/hercules/export/export-user-statuses.html',
        resolve: {
          serviceId: function () {
            return vm.currentServiceId;
          }
        }
      });
    }

    function enableService(serviceId) {
      vm.waitForEnabled = true;
      ServiceDescriptor.setServiceEnabled(serviceId, true, function (error) {
        if (error !== null) {
          XhrNotificationService.notify("Problems enabling the service");
        }
        vm.serviceEnabled = true;
        vm.waitForEnabled = false;
      });
    }

    function showClusterDetails(cluster) {
      $state.go('cluster-details', {
        cluster: cluster,
        serviceType: vm.currentServiceType
      });
    }

    function openUserErrorsModal() {
      $scope.modal = $modal.open({
        controller: 'UserErrorsController',
        controllerAs: 'userErrorsCtrl',
        templateUrl: 'modules/hercules/expressway-service/user-errors.html',
        resolve: {
          serviceId: function () {
            return vm.currentServiceId;
          }
        }
      });
    }
  }

  /* @ngInject */
  function AlarmController($stateParams) {
    var vm = this;
    vm.alarm = $stateParams.alarm;
    vm.host = $stateParams.host;
  }

  /* @ngInject */
  function ExpresswayHostDetailsController($stateParams, $state, ClusterService, XhrNotificationService) {
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

    //TODO Turn on when active-active is implemented by services
    //vm.activeActiveApplicable = (vm.serviceType == 'c_cal' || vm.serviceType == 'c_ucmc');
    vm.activeActiveApplicable = false;
    vm.activeActivePossible = vm.cluster.hosts.length > 1;
    vm.activeActiveEnabled = vm.activeActiveApplicable && isActiveActiveEnabled(vm.cluster, vm.serviceType);
    vm.activeActiveEnabledOld = vm.activeActiveApplicable && isActiveActiveEnabled(vm.cluster, vm.serviceType);

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
  function UserErrorsController($modal, $scope, serviceId, USSService, XhrNotificationService, Userservice, ClusterService) {
    var vm = this;
    vm.loading = true;
    vm.limit = 5;
    vm.serviceId = serviceId;

    vm.openUserStatusReportModal = function (serviceId) {
      // $scope.modal.close();
      $scope.close = function () {
        $scope.$parent.modal.close();
      };
      $scope.modal = $modal.open({
        scope: $scope,
        controller: 'ExportUserStatusesController',
        controllerAs: 'exportUserStatusesCtrl',
        templateUrl: 'modules/hercules/export/export-user-statuses.html',
        resolve: {
          serviceId: function () {
            return vm.serviceId;
          }
        }
      });
    };

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
    .controller('ExpresswayClusterSettingsController', ExpresswayClusterSettingsController)
    .controller('AlarmController', AlarmController)
    .controller('ExpresswayHostDetailsController', ExpresswayHostDetailsController)
    .controller('UserErrorsController', UserErrorsController);
}());
