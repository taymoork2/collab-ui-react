(function () {
  'use strict';

  angular
    .module('Hercules')
    .controller('ImpServiceSettingsController', ImpServiceSettingsController);

  function ImpServiceSettingsController(hasHybridImpFeatureToggle) {
    var vm = this;
    vm.hasHybridImpFeatureToggle = hasHybridImpFeatureToggle;
  }
}());

