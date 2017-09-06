(function () {
  'use strict';

  module.exports = searchResultsGenerate;

  function searchResultsGenerate() {
    var directive = {
      restrict: 'E',
      template: require('modules/ediscovery/search-results/search-results-generate.tpl.html'),
    };

    return directive;
  }
})();
