(function () {
  'use strict';

  angular
    .module('Sunlight')
    .directive('focusOn', /* @ngInject */ function ($timeout) {
      return {
        restrict: 'A',
        link: function (scope, element, attrs) {
          $timeout(function () {
            element[0].focus();
          });
        }
      };
    });
})();
