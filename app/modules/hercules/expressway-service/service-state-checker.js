(function () {
  'use strict';

  /*@ngInject*/
  function ServiceStateChecker(NotificationService, ClusterService, DirSyncService, USSService2) {
    var fusePerformed = false;
    var dirSyncEnabled = false;
    var connectorType;
    var serviceId;

    var lastDirSyncCheck = 0;
    var lastUserStatusCheck = 0;

    function init(conType, servId) {
      connectorType = conType;
      serviceId = servId;
      ClusterService.subscribe(refresh, {
        //scope: $scope
      });
    }

    function refresh() {
      checkIfFusePerformed();
      if (fusePerformed) {
        checkIfConnectorsConfigured(connectorType);
        checkIfDirSyncEnabled();
        checkUserStatuses();
      }
    }

    function checkIfFusePerformed() {
      var clusters = ClusterService.getClusters();
      if (_.size(clusters) === 0) {
        NotificationService.addNotification(
          NotificationService.types.TODO,
          'fuseNotPerformed',
          1,
          'modules/hercules/notifications/fuse-not-performed.html', {});
        fusePerformed = false;
      } else {
        NotificationService.removeNotification('fuseNotPerformed');
        fusePerformed = true;
      }
    }

    function checkIfConnectorsConfigured(connectorType) {
      var clusters = ClusterService.getClusters();
      var noConnectorsConfigured = _.all(clusters, function (cluster) {
        return !cluster.isConnectorConfigured(connectorType);
      });
      if (noConnectorsConfigured) {
        NotificationService.addNotification(
          NotificationService.types.TODO,
          'configureConnectors',
          2,
          'modules/hercules/notifications/configure_connectors.html', {});
      } else {
        NotificationService.removeNotification('configureConnectors');
      }
    }

    function checkIfDirSyncEnabled() {
      if (dirSyncEnabled || Date.now() - lastDirSyncCheck < 60000) {
        return;
      } else {
        lastDirSyncCheck = Date.now();
      }
      DirSyncService.getDirSyncDomain(function (data) {
        dirSyncEnabled = data.success && data.serviceMode == 'ENABLED';
        if (!dirSyncEnabled) {
          NotificationService.addNotification(
            NotificationService.types.TODO,
            'dirSyncNotEnabled',
            3,
            'modules/hercules/notifications/dirsync-not-enabled.html', {});
        } else {
          NotificationService.removeNotification('dirSyncNotEnabled');
        }
      });
    }

    function checkUserStatuses() {
      if (Date.now() - lastUserStatusCheck < 30000) {
        return;
      } else {
        lastUserStatusCheck = Date.now();
      }
      USSService2.getStatusesSummary().then(function (res) {
        var summaryForService = _.find(res || {}, {
          serviceId: serviceId
        });
        var needsUserActivation = !summaryForService || (summaryForService.activated === 0 && summaryForService.error === 0 && summaryForService.notActivated === 0);
        if (needsUserActivation) {
          NotificationService.addNotification(
            NotificationService.types.TODO,
            'noUsersActivated',
            4,
            'modules/hercules/notifications/no_users_activated.html', {});
        } else {
          NotificationService.removeNotification('noUsersActivated');
          if (summaryForService && summaryForService.error > 0) {
            NotificationService.addNotification(
              NotificationService.types.TODO,
              'userErrors',
              4,
              'modules/hercules/notifications/user-errors.html', summaryForService);
          } else {
            NotificationService.removeNotification('userErrors');
          }
        }
      });
    }

    return {
      init: init,
      refresh: refresh
    };
  }

  angular
    .module('Hercules')
    .service('ServiceStateChecker', ServiceStateChecker);

}());
