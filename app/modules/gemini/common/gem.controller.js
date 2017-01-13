(function () {
  'use strict';

  angular
    .module('Gemini')
    .controller('GemCtrl', GemCtrl);

  /* @ngInject */
  function GemCtrl(FeatureToggleService, $state) {
    init();

    function init() {
      FeatureToggleService.supports(FeatureToggleService.features.gemCCA)
        .then(function (feature) {
          if (!feature) {
            $state.go('404');
            return;
          }
        });
    }
  }
})();
