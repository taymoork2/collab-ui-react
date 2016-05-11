(function () {
  'use strict';

  angular.module('Core')
    .directive('crUserCsvResults', function () {
      return {
        restrict: 'E',
        templateUrl: 'modules/core/users/userCsv/userCsvResults.tpl.html'
      };
    });
})();
