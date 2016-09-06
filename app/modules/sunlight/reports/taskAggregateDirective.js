(function () {
  'use strict';

  angular
    .module('Core')
    .directive('ccTaskAggregate', ccTaskAggregate);

  function ccTaskAggregate() {
    var directive = {
      restrict: 'EA',
      scope: false,
      templateUrl: 'modules/sunlight/reports/taskAggregate.tpl.html'
    };

    return directive;
  }

})();
