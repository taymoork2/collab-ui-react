(function () {
  'use strict';

  angular.module('Core')
    .directive('crNotification', crNotification);

  function crNotification() {
    var directive = {
      restrict: 'AE',
      templateUrl: 'modules/core/notifications/notification.tpl.html',
      scope: {
        'close': '=',
        'index': '=',
        'type': '='
      },
      link: link,
      transclude: true
    };

    return directive;

    function link(scope, element, attributes) {
      scope.getTitle = function () {
        switch (scope.type) {
        case 'danger':
          return 'notifications.error';
          break;
        default:
          return 'notifications.success';
        }
      }
    }
  }
})();
