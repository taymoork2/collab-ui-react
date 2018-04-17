(function () {
  'use strict';

  module.exports = searchResultsReport;

  function searchResultsReport() {
    var directive = {
      restrict: 'E',
      template: require('modules/ediscovery/search-results/search-results-report.tpl.html'),
    };

    return directive;
  }
})();
