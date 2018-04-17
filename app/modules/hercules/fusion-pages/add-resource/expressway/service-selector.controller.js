(function () {
  'use strict';

  angular.module('Hercules')
    .controller('ExpresswayServiceSelectorController', ExpresswayServiceSelectorController);

  var KeyCodes = require('modules/core/accessibility').KeyCodes;

  /* @ngInject */
  function ExpresswayServiceSelectorController($stateParams, $translate, Authinfo, Config, HybridServicesClusterService, hasImpSupportFeatureToggle) {
    var vm = this;
    vm.UIstate = 'loading';
    vm.hasImpSupportFeatureToggle = hasImpSupportFeatureToggle;
    vm.isEntitledTo = {
      call: Authinfo.isEntitled(Config.entitlements.fusion_uc),
      calendar: Authinfo.isEntitled(Config.entitlements.fusion_cal),
      imp: Authinfo.isEntitled(Config.entitlements.imp) && hasImpSupportFeatureToggle,
    };
    vm.selectedServices = {
      call: false,
      calendar: false,
      imp: false,
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
          call: vm.hasSetup.call ? $translate.instant('hercules.hybridServiceNames.squared-fusion-uc') : $translate.instant('hercules.fusion.add-resource.expressway.services.call-not-setup'),
          calendar: vm.hasSetup.calendar ? $translate.instant('hercules.hybridServiceNames.squared-fusion-cal') : $translate.instant('hercules.fusion.add-resource.expressway.services.calendar-not-setup'),
          imp: vm.hasSetup.imp ? $translate.instant('hercules.hybridServiceNames.spark-hybrid-impinterop') : $translate.instant('hercules.fusion.add-resource.expressway.services.imp-not-setup'),
        };
        vm.UIstate = 'success';
      })
      .catch(function () {
        vm.UIstate = 'error';
      });

    function getSetupState() {
      // A cluster type is said to be setup if there is at least one cluster with one connector
      return HybridServicesClusterService.getAll()
        .then(function (clusters) {
          return {
            call: hasServiceSetUp(clusters, 'c_ucmc'),
            calendar: hasServiceSetUp(clusters, 'c_cal'),
            imp: hasServiceSetUp(clusters, 'c_imp'),
          };
        });
    }

    function next() {
      $stateParams.wizard.next({
        expressway: {
          selectedServices: vm.selectedServices,
        },
      });
    }

    function canGoNext() {
      return vm.selectedServices.call || vm.selectedServices.calendar || vm.selectedServices.imp;
    }

    function handleKeypress(event) {
      if (event.keyCode === KeyCodes.ENTER && canGoNext()) {
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
