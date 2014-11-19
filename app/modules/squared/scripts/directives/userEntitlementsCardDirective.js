'use strict';

angular.module('Squared')

.directive('sqUserEntitlementsCard', [

  function () {
    return {
      restrict: 'AE',
      transclude: true,
      replace: true,
      templateUrl: 'modules/squared/scripts/directives/views/userEntitlementsCard.tpl.html'
    };
  }
]);
