(function () {
  'use strict';

  module.exports = searchResultsComplete;

  function searchResultsComplete() {
    var directive = {
      restrict: 'E',
      template: require('modules/ediscovery/search-results/search-results-complete.tpl.html'),
    };
    return directive;
  }
})();
