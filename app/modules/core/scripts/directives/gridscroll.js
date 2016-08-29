(function () {
  'use strict';

  angular.module('Core')
    .directive('gridscrollbar', gridscrollbar);

  /* @ngInject */
  function gridscrollbar($timeout) {
    return {
      restrict: 'A',
      link: function () {
        $timeout(function () {
          $('.ui-grid-viewport').niceScroll({
            cursoropacitymax: 0.5,
            cursorwidth: 10,
            horizrailenabled: false,
            scrollspeed: 120,
            autohidemode: false
          });
        });
      }
    };
  }
})();
