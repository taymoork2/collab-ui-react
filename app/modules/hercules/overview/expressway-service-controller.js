(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('ExpresswayServiceController', ExpresswayServiceController);

  /* @ngInject */
  function ExpresswayServiceController($state, $modal, $scope, $translate, XhrNotificationService, ServiceStateChecker, ServiceDescriptor, ClusterService, USSService, FusionUtils, FeatureToggleService, $stateParams) {
    ClusterService.subscribe('data', clustersUpdated, {
      scope: $scope
    });
    USSService.subscribeStatusesSummary('data', extractSummaryForAService, {
      scope: $scope
    });

    var vm = this;
    vm.connectorType = $state.current.data.connectorType;
    vm.servicesId = FusionUtils.connectorType2ServicesId(vm.connectorType);
    vm.serviceEnabled = null; // when we don't know yet, otherwise the value is true or false
    vm.route = FusionUtils.connectorType2RouteName(vm.connectorType); // kill?
    vm.loadingClusters = true;

    // Added for <cs-page-header>
    vm.pageTitle = $translate.instant('hercules.serviceNames.' + vm.servicesId[0]);
    vm.tabs = [{
      title: $translate.instant('common.resources'),
      state: vm.route + '.list'
    }, {
      title: $translate.instant('common.settings'),
      state: vm.route + '.settings({connectorType: vm.connectorType})'
    }];

    vm.clusters = ClusterService.getClustersByConnectorType(vm.connectorType);
    vm.getSeverity = ClusterService.getRunningStateSeverity;
    vm.serviceIconClass = FusionUtils.serviceId2Icon(vm.servicesId[0]); // kill?
    vm.openUserStatusReportModal = openUserStatusReportModal;
    vm.openAddResourceModal = openAddResourceModal;
    vm.showClusterSidepanel = showClusterSidepanel;
    vm.enableService = enableService;
    vm.featureToggled = false;

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
          $scope.exp.showClusterSidepanel(row.entity);
        });
        if (angular.isDefined($stateParams.clusterId) && $stateParams.clusterId !== null) {
          showClusterSidepanel(ClusterService.getCluster(vm.connectorType, $stateParams.clusterId));
        }
      },
      columnDefs: [{
        field: 'name',
        displayName: $translate.instant('hercules.overview.clusters-title'),
        cellTemplate: 'modules/hercules/cluster-list/cluster-list-display-name.html',
        width: '35%'
      }, {
        field: 'serviceStatus',
        displayName: $translate.instant('hercules.overview.status-title'),
        cellTemplate: 'modules/hercules/cluster-list/cluster-list-status.html',
        width: '65%'
      }]
    };

    // TODO: use the new getClusters API for that
    if (vm.servicesId[0] === 'squared-fusion-mgmt') {
      ServiceDescriptor.services(function (error, services) {
        if (!error) {
          vm.serviceEnabled = _.any(ServiceDescriptor.filterAllExceptManagement(services), {
            enabled: true
          });
        }
      });
    } else {
      ServiceDescriptor.isServiceEnabled(vm.servicesId[0], function (error, enabled) {
        if (!error) {
          vm.serviceEnabled = enabled;
        }
      });
    }

    function clustersUpdated() {
      ServiceStateChecker.checkState(vm.connectorType, vm.servicesId[0]);
      vm.clusters = ClusterService.getClustersByConnectorType(vm.connectorType);
      vm.loadingClusters = false;
    }

    function extractSummaryForAService() {
      vm.userStatusSummary = USSService.extractSummaryForAService(vm.servicesId);
    }

    function openUserStatusReportModal() {
      $scope.modal = $modal.open({
        controller: 'ExportUserStatusesController',
        controllerAs: 'exportUserStatusesCtrl',
        templateUrl: 'modules/hercules/user-statuses/export-user-statuses.html',
        type: 'small',
        resolve: {
          servicesId: function () {
            return vm.servicesId;
          },
          userStatusSummary: function () {
            return vm.userStatusSummary;
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

    function showClusterSidepanel(cluster) {
      $state.go('cluster-details', {
        clusterId: cluster.id,
        connectorType: vm.connectorType
      });
    }

    function openAddResourceModal() {
      if (vm.featureToggled) {
        $modal.open({
          resolve: {
            connectorType: function () {
              return vm.connectorType;
            },
            servicesId: function () {
              return vm.servicesId;
            },
            firstTimeSetup: false
          },
          controller: 'AddResourceController',
          controllerAs: 'vm',
          templateUrl: 'modules/hercules/add-resource/add-resource-modal.html',
          type: 'small'
        });
      } else {
        $modal.open({
          controller: 'RedirectTargetController',
          controllerAs: 'redirectTarget',
          templateUrl: 'modules/hercules/redirect-target/redirect-target-dialog.html',
          type: 'small'
        });
      }
    }

    function isFeatureToggled() {
      return FeatureToggleService.supports(FeatureToggleService.features.atlasHybridServicesResourceList);
    }
    isFeatureToggled().then(function (reply) {
      vm.featureToggled = reply;
      if (vm.featureToggled) {
        ServiceDescriptor.isServiceEnabled(vm.servicesId[0], function (error, enabled) {
          if (!enabled) {
            firstTimeSetup();
          }
        });
      }
    });

    function firstTimeSetup() {
      $modal.open({
        resolve: {
          connectorType: function () {
            return vm.connectorType;
          },
          servicesId: function () {
            return vm.servicesId;
          },
          firstTimeSetup: true
        },
        controller: 'AddResourceController',
        controllerAs: 'vm',
        templateUrl: 'modules/hercules/add-resource/add-resource-modal.html',
        type: 'small'
      });
    }

  }
}());
