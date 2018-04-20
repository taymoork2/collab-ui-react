(function () {
  'use strict';

  angular
    .module('Gemini')
    .component('ccaCard', {
      template: require('modules/gemini/components/cca-card.html'),
      controller: CcaCardCtrl,
    });

  /* @ngInject */
  function CcaCardCtrl(FeatureToggleService, $state) {
    var vm = this;
    vm.goto = goto;
    vm.$onInit = $onInit;

    function $onInit() {
      FeatureToggleService.supports(FeatureToggleService.features.gemServicesTab)
        .then(function (feature) {
          if (!feature) {
            $state.go('404');
          }
        });
    }

    function goto() {
      $state.go('gem.servicesPartner');
    }
  }
})();
