(function () {
  'use strict';

  function HerculesNotificationsController(NotificationService) {
    this.notificationLength = NotificationService.getNotificationLength();
    //this.notifications = NotificationService.getNotifications();
    this.status = NotificationService.getNotificationStatus();
    this.showNotifications = false;
  }

  function herculesNotificationsDirective() {
    return {
      restrict: 'E',
      replace: true,
      controller: HerculesNotificationsController,
      controllerAs: 'notificationController',
      scope: false,
      templateUrl: 'modules/hercules/notifications/hercules-notifications.html'
    };
  }

  angular
    .module('Hercules')
    .directive('herculesNotifications', herculesNotificationsDirective);
})();
