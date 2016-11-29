(function () {
  'use strict';

  angular
    .module('Ediscovery')
    .directive('searchResultsGenerate', searchResultsGenerate);

  //TODO: expand the template so only the template calls showLicenses
  function searchResultsGenerate() {
    var directive = {
      restrict: 'E',
      templateUrl: 'modules/ediscovery/search-results/search-results-generate.tpl.html'
    };

    return directive;
  }

})();
