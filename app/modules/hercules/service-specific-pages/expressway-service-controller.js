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
        templateUrl: 'modules/hercules/service-specific-pages/components/user-status-report/export-user-statuses.html',
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


  }
}());
