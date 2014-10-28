'use strict';

angular.module('Huron')

.directive('directoryNumberInfo', [
  function () {
    return {
      controller: 'DirectoryNumberInfoCtrl',
      restrict: 'EA',
      scope: false,
      templateUrl: 'modules/huron/directoryNumber/directoryNumber.tpl.html'
    };
  }
]);