(function () {
  'use strict';

  angular
    .module('Mediafusion')
    .directive('ucNewMetricsInfoCard', ucNewMetricsInfoCard);

  function ucNewMetricsInfoCard() {
    var directive = {
      restrict: 'EA',
      scope: false,
      templateUrl: 'modules/mediafusion/media-service-report-v2/metrics-report/newmetricsInfoCard/newmetricsInfoCard.tpl.html'
    };

    return directive;
  }

})();
