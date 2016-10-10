(function () {
  'use strict';

  /* global Clipboard */

  angular
    .module('Squared')
    .directive('sqClipboard', sqClipboard);

  /* @ngInject */
  function sqClipboard(Notification, $window) {
    return {
      restrict: 'A',
      scope: {
        sqClipboard: '&'
      },
      link: function (scope, element) {
        if (!$window.document.queryCommandSupported('copy')) {
          element.remove();
          return;
        }
        var clipBoard = new Clipboard(element[0], {
          text: function () {
            return scope.sqClipboard();
          }
        });
        clipBoard.on('success', function () {
          Notification.success(
            'devicesClipboard.success',
            undefined,
            'devicesClipboard.successTitle'
          );
        });
        clipBoard.on('error', function () {
          Notification.success(
            'devicesClipboard.error',
            undefined,
            'devicesClipboard.errorTitle'
          );
        });
        scope.$on('$destroy', function () {
          clipBoard.destroy();
        });
      }
    };
  }

}());
