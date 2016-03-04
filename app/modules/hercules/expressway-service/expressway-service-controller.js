(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('ExpresswayServiceController', ExpresswayServiceController)
    .controller('UserErrorsController', UserErrorsController);

  /* @ngInject */
  function ExpresswayServiceController($state, $modal, $scope, $translate, XhrNotificationService, ServiceStateChecker, ServiceDescriptor, ClusterService, USSService2, ServiceStatusSummaryService, HelperNuggetsService) {
    ClusterService.subscribe('data', clustersUpdated, {
      scope: $scope
    });

    USSService2.subscribeStatusesSummary('data', extractSummaryForAService, {
      scope: $scope
    });

    var vm = this;
    vm.currentServiceType = $state.current.data.serviceType;
    vm.currentServiceId = HelperNuggetsService.serviceType2ServiceId(vm.currentServiceType);
    vm.serviceEnabled = null; // when we don't know yet, otherwise the value is true or false
    vm.loadingClusters = true;
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

    vm.clusters = ClusterService.getClustersByConnectorType(vm.currentServiceType);
    vm.getSeverity = ClusterService.getRunningStateSeverity;
    vm.serviceIconClass = ServiceDescriptor.serviceIcon(vm.currentServiceId);
    vm.openUserStatusReportModal = openUserStatusReportModal;
    vm.openUserErrorsModal = openUserErrorsModal;
    vm.addResourceButtonClicked = addResourceButtonClicked;
    vm.showClusterDetails = showClusterDetails;
    vm.enableService = enableService;

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

    if (vm.currentServiceId == 'squared-fusion-mgmt') {
      ServiceDescriptor.services(function (error, services) {
        if (!error) {
          vm.serviceEnabled = _.any(ServiceDescriptor.filterAllExceptManagement(services), {
            enabled: true
          });
        }
      });
    } else {
      ServiceDescriptor.isServiceEnabled(vm.currentServiceId, function (error, enabled) {
        if (!error) {
          vm.serviceEnabled = enabled;
        }
      });
    }

    function clustersUpdated() {
      ServiceStateChecker.checkState(vm.currentServiceType, vm.currentServiceId);
      vm.clusters = ClusterService.getClustersByConnectorType(vm.currentServiceType);
      vm.loadingClusters = false;
    }

    function extractSummaryForAService() {
      vm.userStatusSummary = _.find(USSService2.getStatusesSummary(), {
        serviceId: vm.currentServiceId
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
          XhrNotificationService.notify('Problems enabling the service');
        }
        vm.serviceEnabled = true;
        vm.waitForEnabled = false;
      });
    }

    function showClusterDetails(cluster) {
      $state.go('cluster-details', {
        clusterId: cluster.id,
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

    function addResourceButtonClicked() {
      $modal.open({
        controller: 'RedirectTargetController',
        controllerAs: 'redirectTarget',
        templateUrl: 'modules/hercules/redirect-target/redirect-target-dialog.html'
      });
    }
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
        XhrNotificationService.notify('Failed to fetch user statuses', error);
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
}());
