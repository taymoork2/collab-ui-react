(function () {
  'use strict';

  angular.module('Hercules')
    .controller('ExpresswayServiceSelectorController', ExpresswayServiceSelectorController);

  /* @ngInject */
  function ExpresswayServiceSelectorController($stateParams, $translate, Authinfo, Config, FusionClusterService) {
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
    vm.next = next;
    vm.canGoNext = canGoNext;
    vm.handleKeypress = handleKeypress;
    vm._translation = {};

    ///////////////

    getSetupState()
      .then(function (setup) {
        vm.hasSetup = setup;
        vm._translation = {
          call: vm.hasSetup.call ? $translate.instant('hercules.serviceNames.squared-fusion-uc') : $translate.instant('hercules.fusion.add-resource.expressway.services.call-not-setup'),
          calendar: vm.hasSetup.calendar ? $translate.instant('hercules.serviceNames.squared-fusion-cal') : $translate.instant('hercules.fusion.add-resource.expressway.services.calendar-not-setup')
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

    function canGoNext() {
      return vm.selectedServices.call || vm.selectedServices.calendar;
    }

    function handleKeypress(event) {
      if (event.keyCode === 13 && canGoNext()) {
        next();
      }
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
