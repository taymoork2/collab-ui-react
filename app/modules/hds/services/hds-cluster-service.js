(function () {
  'use strict';

  /* @ngInject */
  function HDSClusterService(ClusterService) {
    var vm = this;

    vm.ClusterService = ClusterService;
    function getRunningStateSeverity(state) {
      return vm.ClusterService.getRunningStateSeverity(state);
    }

    function getClustersByConnectorType(type) {
      return vm.ClusterService.getClustersByConnectorType(type);
    }


    return {
      getClustersByConnectorType: getClustersByConnectorType,
      getRunningStateSeverity: getRunningStateSeverity,
    };
  }

  angular
    .module('HDS')
    .service('HDSClusterService', HDSClusterService);

}());
