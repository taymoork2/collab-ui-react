(function () {
  'use strict';

  /* global Clipboard */

  angular
    .module('Squared')
    .directive('sqClipboard', function ($timeout, Notification, $window) {
      return {
        restrict: 'A',
        scope: {
          sqClipboard: '&'
        },
        link: function ($scope, $element, $attr) {
          if (!$window.document.queryCommandSupported('copy')) {
            $element.remove();
            return;
          }
          var clipBoard = new Clipboard($element[0], {
            text: function (trigger) {
              return $scope.sqClipboard();
            }
          });

          clipBoard.on('success', function () {
            Notification.success('Copied to clipboard');
          });
          clipBoard.on('error', function () {
            Notification.error('Copy to clipboard failed');
          });
        }
      };
    });

}());
