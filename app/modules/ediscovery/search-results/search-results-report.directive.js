(function () {
  'use strict';

  angular
    .module('Ediscovery')
    .directive('searchResultsReport', searchResultsReport);

  function searchResultsReport() {
    var directive = {
      restrict: 'E',
      templateUrl: 'modules/ediscovery/search-results/search-results-report.tpl.html'
    };

    return directive;
  }

})();
