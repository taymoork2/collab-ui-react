(function () {
  'use strict';

  angular.module('Huron')
    .directive('hrExternalNumberList', hrExternalNumberList);

  /* @ngInject */
  function hrExternalNumberList() {
    var directive = {
      restrict: 'E',
      templateUrl: 'modules/huron/externalNumbers/externalNumberList.tpl.html',
      scope: {
        numbers: '=',
        countTranslateKey: '@',
        externalNumbers: '=',
        tooltipText: '@',
        tooltipClass: '@',
        quantity: '='
      }
    };

    return directive;
  }

})();
