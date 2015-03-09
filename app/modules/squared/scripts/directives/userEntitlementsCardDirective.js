'use strict';

angular.module('Squared')
  .directive('sqUserEntitlementsCard', [

    function () {
      return {
        restrict: 'AE',
        templateUrl: 'modules/squared/scripts/directives/views/userEntitlementsCard.tpl.html',
        controller: 'ListUsersCtrl'
      };
    }
  ]);
