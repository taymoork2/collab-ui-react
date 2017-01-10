(function () {
  'use strict';

  angular
    .module('Ediscovery')
    .directive('searchResultsGenerate', searchResultsGenerate);

  function searchResultsGenerate() {
    var directive = {
      restrict: 'E',
      templateUrl: 'modules/ediscovery/search-results/search-results-generate.tpl.html'
    };

    return directive;
  }

})();
