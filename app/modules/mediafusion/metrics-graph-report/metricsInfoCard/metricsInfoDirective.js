(function () {
  'use strict';

  angular
    .module('Mediafusion')
    .directive('ucMetricsInfoCard', ucMetricsInfoCard);

  function ucMetricsInfoCard() {
    var directive = {
      restrict: 'EA',
      scope: false,
      templateUrl: 'modules/mediafusion/metrics-graph-report/metricsInfoCard/metricsInfoCard.tpl.html'
    };

    return directive;
  }

})();
