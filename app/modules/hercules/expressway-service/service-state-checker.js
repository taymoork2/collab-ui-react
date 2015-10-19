(function () {
  'use strict';

  /*@ngInject*/
  function ServiceStateChecker(NotificationService, ClusterService, DirSyncService, USSService2, ServiceDescriptor, Authinfo) {

    var dirSyncEnabled;

    function checkState(connectorType, serviceId) {
      if (checkIfFusePerformed()) {
        if (checkIfConnectorsConfigured(connectorType)) {
          checkIfDirSyncEnabled();
          checkUserStatuses(serviceId);
          checkCallServiceConnect(serviceId);
        }
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
        return false;
      } else {
        NotificationService.removeNotification('fuseNotPerformed');
        return true;
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
        return false;
      } else {
        NotificationService.removeNotification('configureConnectors');
        return true;
      }
    }

    function checkIfDirSyncEnabled() {
      if (dirSyncEnabled) {
        return;
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

    function checkUserStatuses(serviceId) {
      var summaryForService = _.find(USSService2.getStatusesSummary(), {
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
            NotificationService.types.ALERT,
            'userErrors',
            4,
            'modules/hercules/notifications/user-errors.html', summaryForService);
        } else {
          NotificationService.removeNotification('userErrors');
        }
      }
    }

    function checkCallServiceConnect(serviceId) {
      if (serviceId != "squared-fusion-uc") {
        return;
      }
      ServiceDescriptor.services(function (error, services) {
        if (!error) {
          var callServiceConnect = _.find(services || {}, {
            id: 'squared-fusion-ec'
          });
          if (callServiceConnect && callServiceConnect.enabled) {
            USSService2.getOrg(Authinfo.getOrgId()).then(function (org) {
              if (!org || !org.sipDomain || org.sipDomain === '') {
                NotificationService.addNotification(
                  NotificationService.types.TODO,
                  'sipDomainNotConfigured',
                  5,
                  'modules/hercules/notifications/sip_domain_not_configured.html', {});
              } else {
                NotificationService.removeNotification('sipDomainNotConfigured');
              }
            });
          } else {
            NotificationService.removeNotification('sipDomainNotConfigured');
          }
        }
      });
    }

    return {
      checkState: checkState
    };
  }

  angular
    .module('Hercules')
    .service('ServiceStateChecker', ServiceStateChecker);

}());
