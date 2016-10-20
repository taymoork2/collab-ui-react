(function () {
  'use strict';

  angular
    .module('Sunlight')
    .directive('careFeatureCard', careFeatureCard);

  function careFeatureCard() {
    return {
      restrict: 'E',
      scope: false,
      templateUrl: 'modules/sunlight/features/featureLanding/careFeatureCard.tpl.html'
    };
  }
})();
