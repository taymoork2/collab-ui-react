(function () {
  'use strict';

  angular.module('Hercules')
    .controller('TypeSelectorController', TypeSelectorController);

  /* @ngInject */
  function TypeSelectorController($stateParams, $translate, Authinfo, Config, FusionClusterService) {
    var vm = this;
    vm.UIstate = 'loading';
    vm.isEntitledTo = {
      expressway: Authinfo.isEntitled(Config.entitlements.fusion_mgmt),
      mediafusion: Authinfo.isEntitled(Config.entitlements.mediafusion)
    };
    vm.selectedType = '';
    vm.next = next;
    vm.canGoNext = canGoNext;
    vm.handleKeypress = handleKeypress;
    vm._translation = {};

    ///////////////

    getSetupState()
      .then(function (setup) {
        vm.hasSetup = setup;
        vm._translation = {
          expressway: $translate.instant('hercules.fusion.types.expressway'),
          mediafusion: $translate.instant('hercules.fusion.types.mediafusion'),
          expresswayHelpText: vm.hasSetup.expressway ? $translate.instant('hercules.fusion.add-resource.type.expressway-description') : $translate.instant('hercules.fusion.add-resource.type.expressway-not-setup'),
          mediafusionHelpText: vm.hasSetup.mediafusion ? $translate.instant('hercules.fusion.add-resource.type.mediafusion-description') : $translate.instant('hercules.fusion.add-resource.type.mediafusion-not-setup')
        };
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

    function handleKeypress(event) {
      if (event.keyCode === 13 && canGoNext()) {
        next();
      }
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
