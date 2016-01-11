(function () {
  'use strict';

  angular
    .module('Core')
    .directive('ucCallMetricsAudio', ucCallMetricsAudio);

  function ucCallMetricsAudio() {
    var directive = {
      restrict: 'EA',
      scope: false,
      templateUrl: 'modules/core/customerReports/callMetrics/callMetricsAudio.tpl.html'
    };

    return directive;
  }

})();
