(function () {
  'use strict';

  angular.module('Core')
    .controller('BrandingFeatureCtrl', BrandingFeatureCtrl);

  function BrandingFeatureCtrl(FeatureToggleService) {
    var brand = this;
    FeatureToggleService.supports(FeatureToggleService.features.brandingWordingChange).then(function (toggle) {
      brand.feature = toggle;
    });
  }
})();
