(function () {
  'use strict';

  angular.module('Hercules')
    .component('resourceGroupCard', {
      bindings: {
        group: '<resourceGroup'
      },
      templateUrl: 'modules/hercules/fusion-pages/components/resource-group-card.html',
      controller: ResourceGroupCardController
    });

  /* @ngInject */
  function ResourceGroupCardController($modal) {
    var ctrl = this;

    ctrl.showDetails = false;
    ctrl.openAddClusterModal = openAddClusterModal;
    ctrl.toggleDetails = toggleDetails;

    function toggleDetails() {
      ctrl.showDetails = !ctrl.showDetails;
    }

    function openAddClusterModal() {
      $modal.open({
        resolve: {
          resourceGroup: function () {
            return ctrl.group;
          }
        },
        controller: 'AssignClustersController',
        controllerAs: 'vm',
        templateUrl: 'modules/hercules/fusion-pages/resource-group-settings/assign-clusters.html',
        type: 'small'
      });
    }
  }

})();
