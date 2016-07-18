(function () {
  'use strict';

  angular.module('Hercules')
    .controller('TypeSelectorController', TypeSelectorController);

  /* @ngInject */
  function TypeSelectorController($stateParams, Authinfo, Config, FusionClusterService) {
    var vm = this;
    vm.UIstate = 'loading';
    vm.isEntitledTo = {
      expressway: Authinfo.isEntitled(Config.entitlements.fusion_mgmt),
      mediafusion: Authinfo.isEntitled(Config.entitlements.mediafusion)
    };
    vm.selectedType = '';
    vm.next = next;
    vm.canGoNext = canGoNext;

    ///////////////

    getSetupState()
      .then(function (setup) {
        vm.hasSetup = setup;
        vm.UIstate = 'success';
      })
      .catch(function () {
        vm.UIstate = 'error';
      });

    function getSetupState() {
      // A cluster type is said to be setup if there is at least one cluster with one connector
      return FusionClusterService.getAll()
        .then(function (clusters) {
          return {
            expressway: hasAConnector(clusters, 'c_mgmt'),
            mediafusion: hasAConnector(clusters, 'mg_mgmt')
          };
        });
    }

    function next() {
      $stateParams.wizard.next({
        targetType: vm.selectedType
      }, vm.selectedType);
    }

    function canGoNext() {
      return vm.selectedType !== '';
    }

    function hasAConnector(clusters, type) {
      return _.some(clusters, function (cluster) {
        return _.some(cluster.connectors, function (connector) {
          return connector.connectorType === type;
        });
      });
    }
  }
})();
