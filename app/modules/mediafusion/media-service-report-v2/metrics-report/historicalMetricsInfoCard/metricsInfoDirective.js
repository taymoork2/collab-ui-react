(function () {
  'use strict';

  angular
    .module('Mediafusion')
    .directive('ucMetricsHistoricalInfoCard', ucMetricsHistoricalInfoCard);

  function ucMetricsHistoricalInfoCard() {
    var directive = {
      restrict: 'EA',
      scope: false,
      templateUrl: 'modules/mediafusion/media-service-report-v2/metrics-report/historicalMetricsInfoCard/metricsInfoCard.tpl.html'
    };

    return directive;
  }

})();
