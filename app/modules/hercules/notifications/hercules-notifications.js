(function () {
  'use strict';

  function HerculesNotificationsController(NotificationService, $state, $scope, $modal) {
    this.notificationsLength = function () {
      return NotificationService.getNotificationLength();
    };
    this.notifications = NotificationService.getNotifications();
    this.showNotifications = false;
    this.typeDisplayName = function (type) {
      switch (type) {
      case NotificationService.types.ALERT:
        return 'ALERT';
      case NotificationService.types.NEW:
        return 'NEW';
      default:
        return 'TO-DO';
      }
    };
    this.amountBubbleType = function () {
      return _.some(this.notifications, {
        type: NotificationService.types.ALERT
      }) ? NotificationService.types.ALERT : NotificationService.types.TODO;
    };

    this.navigateToDirSyncSetup = function () {
      $state.go('setupwizardmodal', {
        currentTab: 'addUsers'
      });
    };

    this.navigateToUsers = function () {
      $state.go('users.list');
    };

    this.navigateToCallSettings = function () {
      $state.go('call-service.about');
    };

    this.showUserErrorsDialog = function (serviceId) {
      $scope.selectedServiceId = serviceId;
      $scope.modal = $modal.open({
        scope: $scope,
        controller: 'UserStatusesController',
        templateUrl: 'modules/hercules/dashboard-info-panel/user-errors.html'
      });
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
