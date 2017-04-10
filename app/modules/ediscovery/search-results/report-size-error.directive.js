(function () {
  'use strict';

  angular
    .module('Ediscovery')
    .directive('reportSizeError', reportSizeError);

  function reportSizeError() {
    var directive = {
      restrict: 'E',
      templateUrl: 'modules/ediscovery/search-results/report-size-error.tpl.html',
    };

    return directive;
  }

})();
