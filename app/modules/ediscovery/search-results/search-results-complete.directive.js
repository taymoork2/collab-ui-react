(function () {
  'use strict';

  angular
    .module('Ediscovery')
    .directive('searchResultsComplete', searchResultsComplete);

  function searchResultsComplete() {
    var directive = {
      restrict: 'E',
      templateUrl: 'modules/ediscovery/search-results/search-results-complete.tpl.html'
    };

    return directive;
  }

})();
