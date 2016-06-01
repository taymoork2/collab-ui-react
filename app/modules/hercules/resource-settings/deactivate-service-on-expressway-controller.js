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
    vm.utils = FusionUtils;

    function deactivateService() {
      ClusterService.deprovisionConnector(vm.clusterId, vm.serviceId)
        .then($modalInstance.close)
        .catch(XhrNotificationService.notify);
    }

    vm.localizedConnectorName = $translate.instant('hercules.connectorNameFromConnectorType.' + vm.connectorId);
    vm.localizedServiceName = $translate.instant('hercules.serviceNameFromConnectorType.' + vm.connectorId);

  }
}());
