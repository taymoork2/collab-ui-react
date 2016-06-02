(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('DeactivateServiceOnExpresswayModalController', DeactivateServiceOnExpresswayModalController);

  /* @ngInject */
  function DeactivateServiceOnExpresswayModalController($modalInstance, FusionUtils, serviceId, clusterId, clusterName, ClusterService, XhrNotificationService, $translate) {
    var vm = this;
    vm.connectorId = serviceId;
    vm.clusterName = clusterName;
    vm.clusterId = clusterId;
    vm.deactivateService = deactivateService;

    function deactivateService() {
      ClusterService.deprovisionConnector(vm.clusterId, vm.connectorId)
        .then($modalInstance.close)
        .catch(XhrNotificationService.notify);
    }

    vm.localizedConnectorName = $translate.instant('hercules.connectorNameFromConnectorType.' + vm.connectorId);
    vm.localizedServiceName = $translate.instant('hercules.serviceNameFromConnectorType.' + vm.connectorId);

    vm.getIconClassForService = getIconClassForService;

    function getIconClassForService() {
      return FusionUtils.serviceId2Icon(FusionUtils.connectorType2ServicesId(vm.connectorId)[0]);
    }

  }
}());
