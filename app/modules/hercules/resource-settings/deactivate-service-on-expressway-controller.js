(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('DeactivateServiceOnExpresswayModalController', DeactivateServiceOnExpresswayModalController);

  /* @ngInject */
  function DeactivateServiceOnExpresswayModalController($modalInstance, FusionUtils, serviceId, clusterId, clusterName, ClusterService) {
    var vm = this;
    vm.serviceId = serviceId;
    vm.clusterName = clusterName;
    vm.clusterId = clusterId;
    vm.deactivateService = deactivateService;
    vm.utils = FusionUtils;

    function deactivateService() {
      ClusterService.deprovisionConnector(vm.clusterId, vm.serviceId)
        .then(function (response) {
          $modalInstance.close();
        });
    }

  }
}());
