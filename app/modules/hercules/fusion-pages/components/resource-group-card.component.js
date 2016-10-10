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
  function ResourceGroupCardController($state, FusionClusterStatesService, FusionUtils) {
    var ctrl = this;

    ctrl.showDetails = false;
    ctrl.openResourceGroupSettings = openResourceGroupSettings;
    ctrl.toggleDetails = toggleDetails;
    ctrl.hasZeroClusters = hasZeroClusters;
    ctrl.hasUsers = hasUsers;
    ctrl.$onChanges = $onChanges;
    ctrl.getLocalizedReleaseChannel = FusionUtils.getLocalizedReleaseChannel;
    ctrl.getStatusCssClass = getStatusCssClass;

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

    function hasZeroClusters() {
      return ctrl.group.clusters.length === 0;
    }

    function hasUsers() {
      return ctrl.group.numberOfUsers > 0;
    }

    function getStatusCssClass() {
      var connectors = _.chain(ctrl.group.clusters)
        .map('connectors')
        .flatten()
        .value();
      return FusionClusterStatesService.getMergedStateSeverity(connectors).cssClass;
    }
  }
})();
