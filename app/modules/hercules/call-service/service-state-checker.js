(function () {
  'use strict';

  /*@ngInject*/
  function ServiceStateChecker(NotificationService, ClusterService, DirSyncService, USSService2) {
    var fuseNotPerformed = false;
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
      checkIfFuseNotPerformed();
      if (!fuseNotPerformed) {
        // Show the following notification only if fuse iis performed
        checkIfConnectorsConfigured(connectorType);
        checkIfDirSyncNotEnabled();
        checkUserStatuses();
      }
    }

    function checkIfFuseNotPerformed() {
      var clusters = ClusterService.getClusters();
      if (_.size(clusters) === 0) {
        NotificationService.addNotification(
          NotificationService.types.TODO,
          'fuseNotPerformed',
          1,
          'modules/hercules/notifications/fuse-not-performed.html', {});
        fuseNotPerformed = true;
      } else {
        NotificationService.removeNotification('fuseNotPerformed');
        fuseNotPerformed = false;
      }
    }

    function checkIfConnectorsConfigured(connectorType) {
      var clusters = ClusterService.getClusters();
      var anyConnectorsNotConfigured = _.some(clusters, function (cluster) {
        return !cluster.isConnectorConfigured(connectorType);
      });
      if (anyConnectorsNotConfigured) {
        NotificationService.addNotification(
          NotificationService.types.TODO,
          'configureConnectors',
          2,
          'modules/hercules/notifications/configure_connectors.html', {});
      } else {
        NotificationService.removeNotification('configureConnectors');
      }
    }

    function checkIfDirSyncNotEnabled() {
      if (Date.now() - lastDirSyncCheck < 60000) {
        return;
      } else {
        lastDirSyncCheck = Date.now();
      }
      DirSyncService.getDirSyncDomain(function (data) {
        var dirSyncEnabled = data.success && data.serviceMode == 'ENABLED';
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
          /*if (summaryForService && summaryForService.error > 0) {
            // TODO raise user errors notification
          }*/
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
