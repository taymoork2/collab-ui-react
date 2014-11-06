'use strict';

angular.module('Huron')

.directive('hnDirectoryNumber', [
  function () {
    return {
      restrict: 'EA',
      scope: false,
      templateUrl: 'modules/huron/directoryNumber/directoryNumber.tpl.html'
    };
  }
]);
