(function () {
  'use strict';

  angular
    .module('Hercules')
    .directive('herculesNotifications', herculesNotificationsDirective);

  /* @ngInject */
  function HerculesNotificationsController(NotificationService, $state, $scope, $modal, $timeout, ServiceDescriptor, ServiceStateChecker, USSService2) {
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

    vm.navigateToDirSyncSetup = function () {
      $state.go('setupwizardmodal', {
        currentTab: 'addUsers'
      });
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

    vm.showUserErrorsDialog = function (serviceId) {
      $scope.modal = $modal.open({
        controller: 'UserErrorsController',
        controllerAs: 'userErrorsCtrl',
        templateUrl: 'modules/hercules/user-statuses/user-errors.html',
        resolve: {
          servicesId: function () {
            return [serviceId];
          },
          userStatusSummary: function () {
            return vm.userStatusSummary;
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

    // shameless copy from expressway-service-controller.js
    function extractSummaryForAService() {
      // Handle special case where we need to get both  squared-fusion-uc and
      // squared-fusion-ec when currentServiceId = squared-fusion-uc
      if (vm.filterTag === 'squared-fusion-cal') {
        vm.userStatusSummary = _.find(USSService2.getStatusesSummary(), {
          serviceId: vm.filterTag
        });
      } else if (vm.filterTag === 'squared-fusion-uc') {
        var emptySummary = {
          activated: 0,
          deactivated: 0,
          error: 0,
          notActivated: 0,
          notEntitled: 0,
          total: 0,
        };
        vm.userStatusSummary = _.chain(USSService2.getStatusesSummary())
          .filter(function (summary) {
            return _.includes(['squared-fusion-uc', 'squared-fusion-ec'], summary.serviceId);
          })
          .reduce(function (acc, summary) {
            return {
              activated: acc.activated + summary.activated,
              deactivated: acc.deactivated + summary.deactivated,
              error: acc.error + summary.error,
              notActivated: acc.notActivated + summary.notActivated,
              notEntitled: acc.notEntitled + summary.notEntitled,
              total: acc.total + summary.total
            };
          }, emptySummary)
          .value();
      }
    }
    extractSummaryForAService();
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
