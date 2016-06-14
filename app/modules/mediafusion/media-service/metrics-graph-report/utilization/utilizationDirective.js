(function () {
  'use strict';

  angular
    .module('Mediafusion')
    .directive('ucUtilizationMetrics', ucUtilizationMetrics);

  function ucUtilizationMetrics() {
    var directive = {
      restrict: 'EA',
      scope: false,
      templateUrl: 'modules/mediafusion/media-service/metrics-graph-report/utilization/utilization.tpl.html'
    };

    return directive;
  }

})();
