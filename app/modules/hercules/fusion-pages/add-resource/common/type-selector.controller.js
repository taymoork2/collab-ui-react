(function () {
  'use strict';

  module.exports = TypeSelectorController;

  var KeyCodes = require('modules/core/accessibility').KeyCodes;

  /* @ngInject */
  function TypeSelectorController($q, $stateParams, $translate, Authinfo, Config, hasCucmSupportFeatureToggle, hasImpSupportFeatureToggle, ServiceDescriptorService) {
    var vm = this;
    vm.UIstate = 'loading';
    vm.isEntitledTo = {
      expressway: Authinfo.isEntitled(Config.entitlements.fusion_mgmt),
      mediafusion: Authinfo.isEntitled(Config.entitlements.mediafusion),
      context: Authinfo.isEntitled(Config.entitlements.context),
      cucm: Authinfo.isEntitled(Config.entitlements.fusion_khaos) && hasCucmSupportFeatureToggle,
    };
    vm.selectedType = '';
    vm.next = next;
    vm.canGoNext = canGoNext;
    vm.handleKeypress = handleKeypress;
    vm._translation = {};

    var servicesEntitledTo = _.chain(vm.isEntitledTo)
      .omitBy(function (value) {
        return !value;
      })
      .keys()
      .value();

    ///////////////

    getSetupState(servicesEntitledTo)
      .then(function (setup) {
        vm.hasSetup = setup;
        var setupServices = _.chain(vm.hasSetup)
          .omit(function (value) {
            return !value;
          })
          .keys()
          .value();
        if (setupServices.length > 0) {
          vm.selectedType = setupServices[0];
        }
        if (servicesEntitledTo.length === 1 && canGoNext()) {
          next();
        }
        vm._translation = {
          expressway: $translate.instant('hercules.fusion.types.expressway'),
          mediafusion: $translate.instant('hercules.fusion.types.mediafusion'),
          context: $translate.instant('hercules.fusion.types.context'),
          cucm: $translate.instant('hercules.fusion.types.cucm'),
          expresswayHelpText: vm.hasSetup.expressway ? $translate.instant('hercules.fusion.add-resource.type.expressway-description') : $translate.instant('hercules.fusion.add-resource.type.expressway-not-setup'),
          mediafusionHelpText: vm.hasSetup.mediafusion ? $translate.instant('hercules.fusion.add-resource.type.mediafusion-description') : $translate.instant('hercules.fusion.add-resource.type.mediafusion-not-setup'),
          contextHelpText: vm.hasSetup.context ? $translate.instant('hercules.fusion.add-resource.type.context-description') : $translate.instant('hercules.fusion.add-resource.type.context-not-setup'),
          cucmHelpText: $translate.instant('hercules.fusion.add-resource.type.cucm-description'),
        };

        if (hasImpSupportFeatureToggle) {
          vm._translation.expresswayHelpText = $translate.instant('hercules.fusion.add-resource.type.expressway-description-with-imp');
        }

        // Only Expressway supports the partner registration
        if (Authinfo.isCustomerLaunchedFromPartner()) {
          vm.hasSetup.mediafusion = false;
          vm.hasSetup.context = false;
          vm._translation.mediafusionHelpText = $translate.instant('hercules.fusion.add-resource.type.partner-registration-not-supported');
          vm._translation.contextHelpText = $translate.instant('hercules.fusion.add-resource.type.partner-registration-not-supported');
        }
        vm.UIstate = 'success';
      })
      .catch(function () {
        vm.UIstate = 'error';
      });

    function getSetupState(services) {
      var promises = _.map(services, function (service) {
        switch (service) {
          case 'expressway':
            return ServiceDescriptorService.isServiceEnabled('squared-fusion-mgmt');
          case 'mediafusion':
            return ServiceDescriptorService.isServiceEnabled('squared-fusion-media');
          default:
            return true;
        }
      });
      var map = _.zipObject(services, promises);
      return $q.all(map);
    }

    function next() {
      $stateParams.wizard.next({
        targetType: vm.selectedType,
      }, vm.selectedType);
    }

    function handleKeypress(event) {
      if (event.keyCode === KeyCodes.ENTER && canGoNext()) {
        next();
      }
    }

    function canGoNext() {
      return vm.selectedType !== '';
    }
  }
})();
