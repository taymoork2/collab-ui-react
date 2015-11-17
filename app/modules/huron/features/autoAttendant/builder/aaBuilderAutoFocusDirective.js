'use strict';

angular
  .module('uc.autoattendant')
  .directive('aaBuilderAutofocus', ['$timeout', function ($timeout) {
    return {
      restrict: 'A',
      link: function ($scope, $element) {
        $timeout(function () {
          $element[0].focus();
        });
      }
    };
  }]);
