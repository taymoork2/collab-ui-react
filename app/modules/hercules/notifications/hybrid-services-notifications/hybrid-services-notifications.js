(function () {
  'use strict';

  angular.module('Hercules')
    .component('hybridServicesNotifications', {
      bindings: {
        filterTag: '<',
      },
      controller: HerculesNotificationsController,
      controllerAs: 'notificationController',
      template: require('modules/hercules/notifications/hybrid-services-notifications/hybrid-services-notifications.html'),
    });

  /* @ngInject */
  function HerculesNotificationsController($q, $modal, $scope, $state, $translate, HybridServicesClusterService, Notification, NotificationService, ServiceStateChecker, USSService) {
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
    vm.goToClusterSettings = goToClusterSettings;
    vm.navigateToCallSettings = navigateToCallSettings;
    vm.locatedinCallSettings = locatedinCallSettings;
    vm.navigateToCurrentServiceSettings = navigateToCurrentServiceSettings;
    vm.showUserErrorsDialog = showUserErrorsDialog;
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
      return $translate.instant('hercules.alarms.' + type);
    }

    function handleClick() {
      vm.showNotifications = !vm.showNotifications;
    }

    function getNumberCSSClass() {
      if (vm.filteredNotifications().length === 0) {
        return '';
      } else if (_.some(vm.filteredNotifications(), function (notification) {
        return notification.type === NotificationService.types.ALERT
          || notification.type === NotificationService.types.ERROR
          || notification.type === NotificationService.types.CRITICAL;
      })) {
        return 'alert';
      } else if (_.some(vm.filteredNotifications(), function (notification) {
        return notification.type === NotificationService.types.WARNING;
      })) {
        return 'warning';
      } else {
        return 'success';
      }
    }

    function getBadgeCSSClass(type) {
      switch (type) {
        case NotificationService.types.WARNING:
          return 'warning';
        case NotificationService.types.ALERT:
        case NotificationService.types.ERROR:
        case NotificationService.types.CRITICAL:
          return 'alert';
        default:
          return 'success';
      }
    }

    function navigateToUsers() {
      $state.go('users.list');
    }

    function fixClusters(options) {
      var promises = _.map(options.clusters, function (cluster) {
        return HybridServicesClusterService.setClusterInformation(cluster.id, { releaseChannel: options.channel });
      });
      return $q.all(promises)
        .then(function () {
          NotificationService.removeNotification('defaultReleaseChannel');
        })
        .catch(function (error) {
          Notification.errorWithTrackingId(error, 'hercules.fusion.defaultReleaseChannelModal.error');
        });
    }

    function goToClusterSettings(clusterId) {
      $state.go('expressway-settings', { id: clusterId });
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
        template: require('modules/hercules/service-specific-pages/components/user-status-report/export-user-statuses.html'),
        type: 'small',
        resolve: {
          servicesId: function () {
            return servicesId;
          },
          userStatusSummary: function () {
            return USSService.extractSummaryForAService(servicesId);
          },
        },
      });
    }

    function showEnterpriseSettings() {
      $state.go('setupwizardmodal', {
        currentTab: 'enterpriseSettings',
        currentStep: 'enterpriseSipUrl',
        numberOfSteps: 1,
        onlyShowSingleTab: true,
        showStandardModal: true,
      });
    }

    function setSipUriNotificationAcknowledged() {
      ServiceStateChecker.setSipUriNotificationAcknowledgedAndRemoveNotification();
    }
  }
})();
