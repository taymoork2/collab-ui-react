(function () {
  'use strict';

  angular
    .module('Huron')
    .directive('ucSharedLineOld', ucSharedLine);

  function ucSharedLine() {
    var directive = {
      restrict: 'EA',
      scope: false,
      templateUrl: 'modules/huron/sharedLine/sharedLine.tpl.html'
    };

    return directive;
  }

})();
