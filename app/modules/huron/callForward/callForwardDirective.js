(function () {
  'use strict';

  angular
    .module('Huron')
    .directive('ucCallForward', ucCallForward);

  function ucCallForward() {
    var directive = {
      restrict: 'EA',
      scope: false,
      templateUrl: 'modules/huron/callForward/callForward.tpl.html'
    };

    return directive;
  };

})();
