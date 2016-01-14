(function () {
  'use strict';

  angular
    .module('Core')
    .directive('ucCallMetricsCustomer', ucCallMetricsCustomer);

  function ucCallMetricsCustomer() {
    var directive = {
      restrict: 'EA',
      scope: false,
      templateUrl: 'modules/core/customerReports/callMetrics/callMetricsCustomer.tpl.html'
    };

    return directive;
  }

})();
