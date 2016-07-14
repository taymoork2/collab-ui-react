(function () {
  'use strict';

  angular.module('Hercules')
    .controller('ServiceSelectorController', ServiceSelectorController);

  /* @ngInject */
  function ServiceSelectorController($stateParams, Authinfo, Config, FusionClusterService) {
    var vm = this;
    vm.UIstate = 'loading';
    vm.isEntitledTo = {
      call: Authinfo.isEntitled(Config.entitlements.fusion_uc),
      calendar: Authinfo.isEntitled(Config.entitlements.fusion_cal)
    };
    vm.selectedServices = {
      call: false,
      calendar: false
    };
    vm.back = back;
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
            call: hasServiceSetUp(clusters, 'c_ucmc'),
            calendar: hasServiceSetUp(clusters, 'c_cal')
          };
        });
    }

    function next() {
      $stateParams.wizard.next({
        expressway: {
          selectedServices: vm.selectedServices
        }
      });
    }

    function back() {
      $stateParams.wizard.back();
    }

    function canGoNext() {
      return vm.selectedServices.call || vm.selectedServices.calendar;
    }

    function hasServiceSetUp(clusters, type) {
      return _.some(clusters, function (cluster) {
        return _.some(cluster.connectors, function (connector) {
          return connector.connectorType === type;
        });
      });
    }
  }
})();
