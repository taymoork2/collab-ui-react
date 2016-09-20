(function () {
  'use strict';

  angular
    .module('Core')
    .directive('ucUsage', UcUsage);

  /* @ngInject */
  function UcUsage() {

    function link(scope, element, attrs) {
      scope.title = attrs.title;
      AmCharts.makeChart('usage-chart', scope.usageChart);
    }

    var directive = {
      restrict: 'E',
      scope: {
        usageChart: '=chart'
      },
      templateUrl: 'modules/core/customerReports/usage/usage.tpl.html',
      link: link
    };

    return directive;
  }

})();
