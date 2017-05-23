(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('DeactivateServiceOnExpresswayModalController', DeactivateServiceOnExpresswayModalController);

  /* @ngInject */
  function DeactivateServiceOnExpresswayModalController($modalInstance, HybridServicesUtilsService, serviceId, clusterId, clusterName, HybridServicesClusterService, Notification, $translate) {
    var vm = this;
    vm.connectorId = serviceId;
    vm.clusterName = clusterName;
    vm.clusterId = clusterId;
    vm.deactivateService = deactivateService;
    vm.loading = false;

    function deactivateService() {
      vm.loading = true;
      HybridServicesClusterService.deprovisionConnector(vm.clusterId, vm.connectorId)
        .then($modalInstance.close)
        .catch(function (error) {
          Notification.errorWithTrackingId(error, 'hercules.genericFailure');
        })
        .finally(function () {
          vm.loading = false;
        });
    }

    vm.localizedConnectorName = $translate.instant('hercules.connectorNameFromConnectorType.' + vm.connectorId);
    vm.localizedServiceName = $translate.instant('hercules.serviceNameFromConnectorType.' + vm.connectorId);

    vm.getIconClassForService = getIconClassForService;

    function getIconClassForService() {
      return HybridServicesUtilsService.serviceId2Icon(HybridServicesUtilsService.connectorType2ServicesId(vm.connectorId)[0]);
    }

  }
}());
