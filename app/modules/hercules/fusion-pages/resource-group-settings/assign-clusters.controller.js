(function () {
  'use strict';

  angular.module('Hercules')
    .controller('AssignClustersController', AssignClustersController);

  /* @ngInject */
  function AssignClustersController($modalInstance, resourceGroup) {
    var vm = this;
    vm.resourceGroup = resourceGroup;
    vm.saveClusterAssignments = saveClusterAssignments;

    function saveClusterAssignments() {
      $modalInstance.close();
    }
  }
})();
