(function() {
  'use strict';

  angular.module('Mediafusion')
    .directive('crMetricsInfoCard', crMetricsInfoCard);

  function crMetricsInfoCard() {
    return {
      restrict: 'EA',
      replace: true,
      templateUrl: 'modules/mediafusion/metrics/metricsPreview/metricsInfoCard.tpl.html',
      link: function (scope, element, attrs) {}
    };
  }
})();