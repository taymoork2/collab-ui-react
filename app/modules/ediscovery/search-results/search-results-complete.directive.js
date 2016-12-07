(function () {
  'use strict';

  angular
    .module('Ediscovery')
    .directive('searchResultsComplete', searchResultsComplete);

  //TODO: expand the template so only the template calls showLicenses
  function searchResultsComplete() {
    var directive = {
      restrict: 'E',
      templateUrl: 'modules/ediscovery/search-results/search-results-complete.tpl.html'
    };

    return directive;
  }

})();
