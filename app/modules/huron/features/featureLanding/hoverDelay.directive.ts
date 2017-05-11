/* @ngInject */
function hoverDelay($timeout) {
  return {
    restrict: 'A',
    link: function (scope, elem) {
      let timeoutFn;

      function mouseEnter() {
        timeoutFn = $timeout(function () {
          elem.addClass('hover');
        }, 250);
      }

      function mouseLeave() {
        $timeout(function () {
          if (timeoutFn) {
            $timeout.cancel(timeoutFn);
          }
          elem.removeClass('hover');
        }, 0);
      }

      elem.on('mouseenter', mouseEnter);

      elem.on('mouseleave', mouseLeave);

      scope.$on('$destroy', function() {
        elem.off('mouseenter', mouseEnter);
        elem.off('mouseleave', mouseLeave);
      });
    },
  };
}

export default angular
  .module('hover-delay', [])
  .directive('hoverDelay', hoverDelay)
  .name;
