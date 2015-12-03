'use strict';

/* global $ */

angular.module('Core')
  .directive('gridscrollbar', ['$timeout',
    function ($timeout) {
      return {
        restrict: 'A',
        link: function () {
          $timeout(function () {
            $('.ngViewport').niceScroll({
              cursoropacitymax: 0.5,
              cursorwidth: 10,
              horizrailenabled: false,
              scrollspeed: 120,
            });
          });
        }
      };
    }
  ]);
