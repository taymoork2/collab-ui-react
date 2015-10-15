(function () {
  'use strict';

  function HerculesNotificationsController(NotificationService, $state) {
    this.notificationsLength = function () {
      return NotificationService.getNotificationLength();
    };
    this.notifications = NotificationService.getNotifications();
    this.showNotifications = false;
    this.typeDisplayName = function (type) {
      return type == NotificationService.types.ALERT ? 'Alert' : 'To-do';
    };
    this.amountBubbleType = _.some(this.notifications, {
      type: NotificationService.types.ALERT
    }) ? NotificationService.types.ALERT : NotificationService.types.TODO;

    this.navigateToDirSyncSetup = function () {
      $state.go('setupwizardmodal', {
        currentTab: 'addUsers'
      });
    };

    this.navigateToUsers = function () {
      $state.go('users.list');
    };
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
