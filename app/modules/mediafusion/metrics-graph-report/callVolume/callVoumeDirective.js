(function () {
  'use strict';

  angular
    .module('Mediafusion')
    .directive('ucCallVolumeMetrics', ucCallVolumeMetrics);

  function ucCallVolumeMetrics() {
    var directive = {
      restrict: 'EA',
      scope: false,
      templateUrl: 'modules/mediafusion/metrics-graph-report/callVolume/callVolume.tpl.html'
    };

    return directive;
  }

})();
