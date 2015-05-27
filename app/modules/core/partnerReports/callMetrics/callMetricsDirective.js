(function () {
  'use strict';

  angular
    .module('Core')
    .directive('ucCallMetrics', ucCallMetrics);

  function ucCallMetrics() {
    var directive = {
      restrict: 'EA',
      scope: false,
      templateUrl: 'modules/core/partnerReports/callMetrics/callMetrics.tpl.html'
    };

    return directive;
  }

})();
