(function () {
  'use strict';

  module.exports = reportSizeError;

  function reportSizeError() {
    var directive = {
      restrict: 'E',
      templateUrl: 'modules/ediscovery/search-results/report-size-error.tpl.html',
    };

    return directive;
  }
})();
