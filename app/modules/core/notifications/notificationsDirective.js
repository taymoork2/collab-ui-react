(function () {
  'use strict';

  angular.module('Core')
    .directive('crNotifications', crNotifications);

  function crNotifications() {
    var directive = {
      restrict: 'AE',
      controller: 'NotificationsCtrl',
      controllerAs: 'notifications',
      templateUrl: 'modules/core/notifications/notifications.tpl.html'
    };

    return directive;
  }
})();
