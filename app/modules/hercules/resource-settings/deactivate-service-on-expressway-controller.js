(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('DeactivateServiceOnExpresswayModalController', DeactivateServiceOnExpresswayModalController);

  /* @ngInject */
  function DeactivateServiceOnExpresswayModalController($modalInstance, FusionUtils, serviceId, clusterId, clusterName, FusionClusterService, Notification, $translate) {
    var vm = this;
    vm.connectorId = serviceId;
    vm.clusterName = clusterName;
    vm.clusterId = clusterId;
    vm.deactivateService = deactivateService;

    function deactivateService() {
      FusionClusterService.deprovisionConnector(vm.clusterId, vm.connectorId)
        .then($modalInstance.close)
        .catch(function (error) {
          Notification.errorWithTrackingId(error, 'hercules.genericFailure');
        });
    }

    vm.localizedConnectorName = $translate.instant('hercules.connectorNameFromConnectorType.' + vm.connectorId);
    vm.localizedServiceName = $translate.instant('hercules.serviceNameFromConnectorType.' + vm.connectorId);

    vm.getIconClassForService = getIconClassForService;

    function getIconClassForService() {
      return FusionUtils.serviceId2Icon(FusionUtils.connectorType2ServicesId(vm.connectorId)[0]);
    }

  }
}());
