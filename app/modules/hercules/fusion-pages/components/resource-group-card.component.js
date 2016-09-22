(function () {
  'use strict';

  angular.module('Hercules')
    .component('resourceGroupCard', {
      bindings: {
        group: '<resourceGroup',
        onChange: '&',
        forceOpen: '<',
      },
      templateUrl: 'modules/hercules/fusion-pages/components/resource-group-card.html',
      controller: ResourceGroupCardController,
    });

  /* @ngInject */
  function ResourceGroupCardController($state, FusionUtils) {
    var ctrl = this;

    ctrl.showDetails = false;
    ctrl.openResourceGroupSettings = openResourceGroupSettings;
    ctrl.toggleDetails = toggleDetails;
    ctrl.showWarningText = showWarningText;
    ctrl.$onChanges = $onChanges;
    ctrl.getLocalizedReleaseChannel = FusionUtils.getLocalizedReleaseChannel;

    function toggleDetails() {
      ctrl.showDetails = !ctrl.showDetails;
    }

    function $onChanges(changes) {
      if (changes.forceOpen) {
        ctrl.showDetails = changes.forceOpen.currentValue;
      }
    }

    function openResourceGroupSettings() {
      $state.go('resource-group-settings', { id: ctrl.group.id });
    }

    function showWarningText() {
      return ctrl.group.clusters.length === 0;
    }

  }

})();
