(function () {
  'use strict';

  angular
    .module('Huron')
    .directive('ucSpeedDials', ucSpeedDials);

  function ucSpeedDials() {
    var directive = {
      controller: 'SpeedDialsCtrl',
      controllerAs: 'speedDials',
      restrict: 'EA',
      scope: false,
      templateUrl: 'modules/huron/speedDials/speedDials.tpl.html'
    };

    return directive;
  }

})();
