(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('ExpresswayServiceController', ExpresswayServiceController);

  /* @ngInject */
  function ExpresswayServiceController($state, $modal, $scope, $stateParams, $translate, CloudConnectorService, ClusterService, FusionClusterService, FusionUtils, Notification, ServiceDescriptor, ServiceStateChecker, USSService) {
    USSService.subscribeStatusesSummary('data', extractSummaryForAService, {
      scope: $scope
    });

    var vm = this;
    vm.connectorType = $state.current.data.connectorType;
    vm.servicesId = FusionUtils.connectorType2ServicesId(vm.connectorType);

    vm.openUserStatusReportModal = openUserStatusReportModal;
    vm.openAddResourceModal = openAddResourceModal;

    //function clustersUpdated() {
    //  ServiceStateChecker.checkState(vm.connectorType, vm.servicesId[0]);
    //  FusionClusterService.setClusterAllowListInfoForExpressway(ClusterService.getClustersByConnectorType(vm.connectorType))
    //    .then(function (clusters) {
    //      vm.clusters = clusters;
    //    })
    //    .catch(function () {
    //      vm.clusters = ClusterService.getClustersByConnectorType(vm.connectorType);
    //    })
    //}

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

  }
}());
