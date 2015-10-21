(function () {
  'use strict';

  angular
    .module('Squared')
    .directive('sqClipboard', function ($timeout, Notification) {
      return {
        restrict: 'EA',
        template: '<a class="clipboard-button" href auto-hide-on-no-flash="true" clip-copy="getTextToCopy()" clip-click="doSomething()"><i class="fa fa-clipboard"></i></a>',
        link: function ($scope, $element, $attr) {
          $scope.getTextToCopy = function () {
            return $attr.clipCopy;
          };
          $scope.doSomething = function () {
            Notification.notify('Copied to Clipboard', 'success');
          };
        }
      };
    });

}());
