(function () {
  'use strict';

  angular
    .module('Ediscovery')
    .directive('searchResultsReport', searchResultsReport);

  //TODO: expand the template so only the template calls showLicenses
  function searchResultsReport() {
    var directive = {
      restrict: 'E',
      templateUrl: 'modules/ediscovery/search-results/search-results-report.tpl.html'
    };

    return directive;
  }

})();
