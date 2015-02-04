'use strict';
/* global $ */

angular.module('Core')

.directive('gridscrollbar', ['$timeout',
  function ($timeout) {
    return {
      restrict: 'A',
      link: function (scope, elem, attrs) {
        $timeout(function () {
          $('.ngViewport').niceScroll({
            cursoropacitymax: .5,
            cursorwidth: 10,
          });
        });
      }
    };
  }
])

;
