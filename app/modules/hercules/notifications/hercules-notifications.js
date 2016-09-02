(function () {
  'use strict';

  angular
    .module('Hercules')
    .directive('herculesNotifications', herculesNotificationsDirective);

  /* @ngInject */
  function HerculesNotificationsController(NotificationService, $state, $scope, $modal, ServiceDescriptor, ServiceStateChecker, USSService) {
    var vm = this;
    vm.notificationsLength = function () {
      return NotificationService.getNotificationLength();
    };
    vm.filteredNotifications = function () {
      return _.filter(NotificationService.getNotifications(), function (notification) {
        return _.includes(notification.tags, vm.filterTag);
      });
    };
    vm.showNotifications = false;
    vm.typeDisplayName = function (type) {
      switch (type) {
        case NotificationService.types.ALERT:
          return 'ALERT';
        case NotificationService.types.NEW:
          return 'NEW';
        default:
          return 'TO-DO';
      }
    };

    vm.handleClick = function () {
      vm.showNotifications = !vm.showNotifications;
    };

    vm.amountBubbleType = function () {
      return _.some(vm.filteredNotifications(), {
        type: NotificationService.types.ALERT
      }) ? NotificationService.types.ALERT : NotificationService.types.TODO;
    };

    vm.navigateToUsers = function () {
      $state.go('users.list');
    };

    vm.navigateToCallSettings = function () {
      $state.go('call-service.settings');
    };

    vm.navigateToCurrentServiceSettings = function () {
      vm.showNotifications = false;
      $state.go($state.current.name.split('.')[0] + '.settings');
    };

    vm.showUserErrorsDialog = function (servicesId) {
      $scope.modal = $modal.open({
        controller: 'ExportUserStatusesController',
        controllerAs: 'exportUserStatusesCtrl',
        templateUrl: 'modules/hercules/user-statuses/export-user-statuses.html',
        type: 'small',
        resolve: {
          servicesId: function () {
            return servicesId;
          },
          userStatusSummary: function () {
            return USSService.extractSummaryForAService(servicesId);
          }
        }
      });
    };

    vm.dismissNewServiceNotification = function (notificationId, serviceId) {
      ServiceDescriptor.acknowledgeService(serviceId);
      NotificationService.removeNotification(notificationId);
    };

    vm.openAddResourceModal = function () {
      $modal.open({
        controller: 'RedirectTargetController',
        controllerAs: 'redirectTarget',
        templateUrl: 'modules/hercules/redirect-target/redirect-target-dialog.html',
        type: 'small'
      });
    };

    vm.showEnterpriseSettings = function () {
      $state.go('setupwizardmodal', {
        currentTab: 'enterpriseSettings'
      });
    };

    vm.setSipUriNotificationAcknowledged = function () {
      ServiceStateChecker.setSipUriNotificationAcknowledgedAndRemoveNotification();
    };

  }

  function herculesNotificationsDirective() {
    return {
      restrict: 'E',
      replace: true,
      controller: HerculesNotificationsController,
      controllerAs: 'notificationController',
      bindToController: true,
      scope: {
        filterTag: '='
      },
      templateUrl: 'modules/hercules/notifications/hercules-notifications.html'
    };
  }

})();
