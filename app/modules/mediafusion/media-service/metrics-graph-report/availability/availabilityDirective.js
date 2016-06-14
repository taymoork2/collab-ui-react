(function () {
  'use strict';

  angular
    .module('Mediafusion')
    .directive('ucAvailabilityMetrics', ucAvailabilityMetrics);

  function ucAvailabilityMetrics() {
    var directive = {
      restrict: 'EA',
      scope: false,
      templateUrl: 'modules/mediafusion/media-service/metrics-graph-report/availability/availability.tpl.html'
    };

    return directive;
  }

})();
