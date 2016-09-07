(function () {
  'use strict';

  angular.module('Hercules')
    .component('resourceGroupCard', {
      bindings: {
        group: '<resourceGroup',
        onChange: '&'
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
    ctrl.showWarningText = showWarningText;

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
      }).result
      .then(ctrl.onChange);
    }

    function showWarningText() {
      return ctrl.group.clusters.length === 0;
    }
  }

})();
