require('./_user-csv.scss');

(function () {
  'use strict';

  angular.module('Core')
    .directive('crUserCsvFile', function () {
      return {
        restrict: 'E',
        template: require('modules/core/users/userCsv/userCsvFile.tpl.html'),
      };
    });
})();
