'use strict';

angular
  .module('uc.autoattendant')
  .directive('aaBuilderAutofocus', aaBuilderAutofocus);

/* @ngInject */
function aaBuilderAutofocus($timeout) {
  return {
    restrict: 'A',
    link: function ($scope, $element) {
      $timeout(function () {
        $element[0].focus();
      });
    }
  };
}
