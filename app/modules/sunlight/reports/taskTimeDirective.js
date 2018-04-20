(function () {
  'use strict';

  angular
    .module('Core')
    .directive('ccTaskTime', ccTaskTime);

  function ccTaskTime() {
    var directive = {
      restrict: 'EA',
      scope: false,
      template: require('modules/sunlight/reports/taskTime.tpl.html'),
    };

    return directive;
  }
})();
