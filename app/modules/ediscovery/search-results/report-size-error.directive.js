(function () {
  'use strict';

  module.exports = reportSizeError;

  function reportSizeError() {
    var directive = {
      restrict: 'E',
      template: require('modules/ediscovery/search-results/report-size-error.tpl.html'),
    };

    return directive;
  }
})();
