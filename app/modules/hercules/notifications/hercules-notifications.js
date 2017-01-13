(function () {
  'use strict';

  angular
    .module('Hercules')
    .directive('herculesNotifications', herculesNotificationsDirective);

  /* @ngInject */
  function HerculesNotificationsController($q, $modal, $scope, $state, FusionClusterService, Notification, NotificationService, ServiceDescriptor, ServiceStateChecker, USSService) {
    var vm = this;
    vm.showNotifications = false;
    vm.notificationsLength = notificationsLength;
    vm.filteredNotifications = filteredNotifications;
    vm.typeDisplayName = typeDisplayName;
    vm.handleClick = handleClick;
    vm.getNumberCSSClass = getNumberCSSClass;
    vm.getBadgeCSSClass = getBadgeCSSClass;
    vm.navigateToUsers = navigateToUsers;
    vm.fixClusters = fixClusters;
    vm.navigateToCallSettings = navigateToCallSettings;
    vm.locatedinCallSettings = locatedinCallSettings;
    vm.navigateToCurrentServiceSettings = navigateToCurrentServiceSettings;
    vm.showUserErrorsDialog = showUserErrorsDialog;
    vm.dismissNewServiceNotification = dismissNewServiceNotification;
    vm.showEnterpriseSettings = showEnterpriseSettings;
    vm.setSipUriNotificationAcknowledged = setSipUriNotificationAcknowledged;

    function notificationsLength() {
      return NotificationService.getNotificationLength();
    }

    function filteredNotifications() {
      return _.filter(NotificationService.getNotifications(), function (notification) {
        return _.includes(notification.tags, vm.filterTag);
      });
    }

    function typeDisplayName(type) {
      switch (type) {
        case NotificationService.types.ALERT:
          return 'ALERT';
        case NotificationService.types.NEW:
          return 'NEW';
        default:
          return 'TO-DO';
      }
    }

    function handleClick() {
      vm.showNotifications = !vm.showNotifications;
    }

    function getNumberCSSClass() {
      if (vm.filteredNotifications().length === 0) {
        return '';
      } else if (_.some(vm.filteredNotifications(), {
        type: NotificationService.types.ALERT
      })) {
        return 'alert';
      } else {
        return 'todo';
      }
    }

    function getBadgeCSSClass(type) {
      if (type === NotificationService.types.NEW || type === NotificationService.types.TODO) {
        return 'success';
      } else {
        return 'alert';
      }
    }

    function navigateToUsers() {
      $state.go('users.list');
    }

    function fixClusters(options) {
      var promises = _.map(options.clusters, function (cluster) {
        return FusionClusterService.setReleaseChannel(cluster.id, options.channel);
      });
      return $q.all(promises)
        .then(function () {
          NotificationService.removeNotification('defaultReleaseChannel');
        })
        .catch(function (error) {
          Notification.errorWithTrackingId(error, 'hercules.fusion.defaultReleaseChannelModal.error');
        });
    }

    function navigateToCallSettings() {
      $state.go('call-service.settings');
    }

    function locatedinCallSettings() {
      return $state.is('call-service.settings');
    }

    function navigateToCurrentServiceSettings() {
      vm.showNotifications = false;
      $state.go($state.current.name.split('.')[0] + '.settings');
    }

    function showUserErrorsDialog(servicesId) {
      $scope.modal = $modal.open({
        controller: 'ExportUserStatusesController',
        controllerAs: 'exportUserStatusesCtrl',
        templateUrl: 'modules/hercules/service-specific-pages/components/user-status-report/export-user-statuses.html',
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
    }

    function dismissNewServiceNotification(notificationId, serviceId) {
      ServiceDescriptor.acknowledgeService(serviceId);
      NotificationService.removeNotification(notificationId);
    }

    function showEnterpriseSettings() {
      $state.go('setupwizardmodal', {
        currentTab: 'enterpriseSettings'
      });
    }

    function setSipUriNotificationAcknowledged() {
      ServiceStateChecker.setSipUriNotificationAcknowledgedAndRemoveNotification();
    }
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
