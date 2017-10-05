(function () {
  'use strict';

  angular
    .module('Core')
    .directive('ccAverageCsat', ccAverageCsat);

  function ccAverageCsat() {
    var directive = {
      restrict: 'EA',
      scope: false,
      template: require('modules/sunlight/reports/averageCsat.tpl.html'),
    };

    return directive;
  }
})();
