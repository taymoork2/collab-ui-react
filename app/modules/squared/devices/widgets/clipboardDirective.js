(function () {
  'use strict';

  angular
    .module('Squared')
    .directive('sqClipboard', function ($timeout, Notification) {
      return {
        restrict: 'A',
        scope: {
          sqClipboard: '&'
        },
        link: function ($scope, $element, $attr) {
          var clipBoard = new Clipboard($element[0], {
            text: function (trigger) {
              return $scope.sqClipboard();
            }
          });

          clipBoard.on('success', function () {
            Notification.success('Copied to Clipboard');
          });
          clipBoard.on('error', function () {
            Notification.error('Copy failed');
          });
        }
      };
    });

}());
