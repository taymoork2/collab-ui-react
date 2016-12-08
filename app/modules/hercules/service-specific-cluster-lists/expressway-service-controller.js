(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('ExpresswayServiceController', ExpresswayServiceController);

  /* @ngInject */
  function ExpresswayServiceController($state, $modal, $scope, $stateParams, $translate, CloudConnectorService, ClusterService, FusionClusterService, FusionUtils, Notification, ServiceDescriptor, ServiceStateChecker, USSService, hasGoogleCalendarFeatureToggle) {
    ClusterService.subscribe('data', clustersUpdated, {
      scope: $scope
    });
    USSService.subscribeStatusesSummary('data', extractSummaryForAService, {
      scope: $scope
    });

    var vm = this;
    vm.connectorType = $state.current.data.connectorType;
    vm.servicesId = FusionUtils.connectorType2ServicesId(vm.connectorType);
    vm.route = FusionUtils.connectorType2RouteName(vm.connectorType); // kill?
    vm.loadingClusters = true;
    vm.backState = 'services-overview';

    // Added for <cs-page-header>
    vm.pageTitle = $translate.instant('hercules.hybridServiceNames.' + vm.servicesId[0]);
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
        if (!_.isUndefined($stateParams.clusterId) && $stateParams.clusterId !== null) {
          showClusterSidepanel(ClusterService.getCluster(vm.connectorType, $stateParams.clusterId));
        }
      },
      columnDefs: [{
        field: 'name',
        displayName: $translate.instant('hercules.overview.clusters-title'),
        cellTemplate: 'modules/hercules/service-specific-cluster-lists/cluster-list-display-name.html',
        width: '35%'
      }, {
        field: 'serviceStatus',
        displayName: $translate.instant('hercules.overview.status-title'),
        cellTemplate: 'modules/hercules/service-specific-cluster-lists/cluster-list-status.html',
        width: '65%'
      }]
    };

    function clustersUpdated() {
      ServiceStateChecker.checkState(vm.connectorType, vm.servicesId[0]);
      FusionClusterService.setClusterAllowListInfoForExpressway(ClusterService.getClustersByConnectorType(vm.connectorType))
        .then(function (clusters) {
          vm.clusters = clusters;
        }).catch(function () {
          vm.clusters = ClusterService.getClustersByConnectorType(vm.connectorType);
        }).finally(function () {
          vm.loadingClusters = false;
        });
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

    function showClusterSidepanel(cluster) {
      $state.go('cluster-details', {
        clusterId: cluster.id,
        connectorType: vm.connectorType
      });
    }

    function openAddResourceModal() {
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
      })
      .result.finally(function () {
        $state.reload();
      });
    }

    function init() {

      // Until a proper fix, never show the setup modal
      // It should be trigerred from the card in services-overview instead
      var hackishBoolean = false;
      if (hackishBoolean && vm.servicesId[0] === 'squared-fusion-cal' && hasGoogleCalendarFeatureToggle) {

        CloudConnectorService.isServiceSetup('squared-fusion-gcal')
          .then(function (isSetup) {
            if (!isSetup) {
              $modal.open({
                controller: 'SelectCalendarServiceController',
                controllerAs: 'vm',
                templateUrl: 'modules/hercules/service-settings/calendar-service-setup/select-calendar-service-modal.html',
              })
                .result
                .then(function (result) {
                  if (result === 'exchange') {
                    firstTimeExchangeSetup();
                  }
                  if (result === 'google') {
                    firstTimeGoogleSetup();
                  }
                })
                .catch(function () {
                  $state.go('services-overview');
                });
            }
          })
          .catch(function (error) {
            Notification.errorWithTrackingId(error, 'hercules.settings.googleCalendar.couldNotReadGoogleCalendarStatus');
          });
      } else {
        ServiceDescriptor.isServiceEnabled(vm.servicesId[0], function (error, enabled) {
          if (!enabled) {
            firstTimeExchangeSetup();
          }
        });
      }
    }
    init();

    function firstTimeExchangeSetup() {
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
      })
      .result.catch(function () {
        $state.go('services-overview');
      });
    }

    function firstTimeGoogleSetup() {
      $modal.open({
        controller: 'FirstTimeGoogleSetupController',
        controllerAs: 'vm',
        templateUrl: 'modules/hercules/service-settings/calendar-service-setup/first-time-google-setup.html',
      })
        .result.then(function (goToState) {
          $state.go(goToState);
        })
        .catch(function () {
          $state.go('services-overview');
        });
    }
  }
}());
