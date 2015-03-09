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

    function link(scope) {
      scope.getTitle = function () {
        switch (scope.type) {
        case 'danger':
          return 'notifications.error';
        default:
          return 'notifications.success';
        }
      };
    }
  }
})();
