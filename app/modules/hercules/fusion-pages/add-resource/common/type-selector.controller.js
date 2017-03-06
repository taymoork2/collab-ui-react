(function () {
  'use strict';

  angular.module('Hercules')
    .controller('TypeSelectorController', TypeSelectorController);

  /* @ngInject */
  function TypeSelectorController($q, $stateParams, $translate, Authinfo, Config, FusionClusterService) {
    var vm = this;
    vm.UIstate = 'loading';
    vm.isEntitledTo = {
      expressway: Authinfo.isEntitled(Config.entitlements.fusion_mgmt),
      mediafusion: Authinfo.isEntitled(Config.entitlements.mediafusion),
      context: Authinfo.isEntitled(Config.entitlements.context),
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

    if (Authinfo.isCustomerLaunchedFromPartner()) {
      vm.UIstate = 'isPartnerAdmin';
      return;
    }

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
          expresswayHelpText: vm.hasSetup.expressway ? $translate.instant('hercules.fusion.add-resource.type.expressway-description') : $translate.instant('hercules.fusion.add-resource.type.expressway-not-setup'),
          mediafusionHelpText: vm.hasSetup.mediafusion ? $translate.instant('hercules.fusion.add-resource.type.mediafusion-description') : $translate.instant('hercules.fusion.add-resource.type.mediafusion-not-setup'),
          contextHelpText: vm.hasSetup.context ? $translate.instant('hercules.fusion.add-resource.type.context-description') : $translate.instant('hercules.fusion.add-resource.type.context-not-setup'),
        };
        vm.UIstate = 'success';
      })
      .catch(function () {
        vm.UIstate = 'error';
      });

    function getSetupState(services) {
      var promises = _.map(services, function (service) {
        var serviceId;
        if (service === 'expressway') {
          serviceId = 'squared-fusion-mgmt';
        }
        if (service === 'mediafusion') {
          serviceId = 'squared-fusion-media';
        }
        if (service === 'context') {
          return true;
        }
        return FusionClusterService.serviceIsSetUp(serviceId);
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
      if (event.keyCode === 13 && canGoNext()) {
        next();
      }
    }

    function canGoNext() {
      return vm.selectedType !== '';
    }
  }
})();
