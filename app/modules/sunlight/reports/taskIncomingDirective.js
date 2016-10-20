(function () {
  'use strict';

  angular
    .module('Core')
    .directive('ccTaskIncoming', ccTaskIncoming);

  function ccTaskIncoming() {
    var directive = {
      restrict: 'EA',
      scope: false,
      templateUrl: 'modules/sunlight/reports/taskIncoming.tpl.html'
    };

    return directive;
  }

})();
