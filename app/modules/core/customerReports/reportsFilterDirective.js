(function () {
  'use strict';

  angular
    .module('Core')
    .directive('reportsFilter', reportsFilter);

  function reportsFilter() {
    var directive = {
      restrict: 'EA',
      scope: false,
      templateUrl: 'modules/core/customerReports/reportsFilter.tpl.html'
    };

    return directive;
  }

})();
