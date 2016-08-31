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
  function ResourceGroupCardController($window) {
    var ctrl = this;

    ctrl.showDetails = false;
    ctrl.openAddClusterModal = openAddClusterModal;
    ctrl.toggleDetails = toggleDetails;

    function toggleDetails() {
      ctrl.showDetails = !ctrl.showDetails;
    }

    function openAddClusterModal(id) {
      $window.alert('soon… ' + id);
    }
  }

})();
