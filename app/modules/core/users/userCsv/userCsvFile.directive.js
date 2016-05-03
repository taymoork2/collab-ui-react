(function () {
  'use strict';

  angular.module('Core')
    .directive('crUserCsvFile', function () {
      return {
        restrict: 'E',
        templateUrl: 'modules/core/users/userCsv/userCsvFile.tpl.html'
      };
    });
})();
