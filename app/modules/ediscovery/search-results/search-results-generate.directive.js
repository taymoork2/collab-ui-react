(function () {
  'use strict';

  module.exports = searchResultsGenerate;

  function searchResultsGenerate() {
    var directive = {
      restrict: 'E',
      templateUrl: 'modules/ediscovery/search-results/search-results-generate.tpl.html',
    };

    return directive;
  }
})();
