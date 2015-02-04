(function () {
  'use strict';

  angular
    .module('Huron')
    .directive('ucCallerId', ucCallerId);

  function ucCallerId() {
    var directive = {
      restrict: 'EA',
      scope: false,
      templateUrl: 'modules/huron/callerId/callerId.tpl.html'
    };

    return directive;
  };

})();
