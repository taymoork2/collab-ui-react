(function () {
  'use strict';

  angular
    .module('Hercules')
    .service('ServiceStateChecker', ServiceStateChecker);

  /*@ngInject*/
  function ServiceStateChecker($rootScope, NotificationService, ClusterService, USSService2, ServiceDescriptor, Authinfo, ScheduleUpgradeService) {

    var allExpresswayServices = ['squared-fusion-uc', 'squared-fusion-cal', 'squared-fusion-mgmt'];

    function checkState(connectorType, serviceId) {
      if (checkIfFusePerformed()) {
        if (checkIfConnectorsConfigured(connectorType)) {
          checkUserStatuses(serviceId);
          checkCallServiceConnect(serviceId);
          if (checkIfSomeConnectorsOk(connectorType)) {
            checkScheduleUpgradeAcknowledged(connectorType, serviceId);
          }
        }
      }
    }

    function checkIfFusePerformed() {
      var clusters = ClusterService.getClustersByConnectorType('c_mgmt');
      if (_.size(clusters) === 0) {
        NotificationService.addNotification(
          NotificationService.types.TODO,
          'fuseNotPerformed',
          1,
          'modules/hercules/notifications/fuse-not-performed.html', allExpresswayServices);
        return false;
      } else {
        NotificationService.removeNotification('fuseNotPerformed');
        return true;
      }
    }

    function checkIfConnectorsConfigured(connectorType) {
      var clusters = ClusterService.getClustersByConnectorType(connectorType);
      var areAllConnectorsConfigured = _.all(clusters, function (cluster) {
        return allConnectorsConfigured(cluster, connectorType);
      });
      if (!areAllConnectorsConfigured) {
        NotificationService.addNotification(
          NotificationService.types.TODO,
          'configureConnectors',
          2,
          'modules/hercules/notifications/configure_connectors.html', allExpresswayServices);
        return false;
      } else {
        NotificationService.removeNotification('configureConnectors');
        return true;
      }
    }

    function checkUserStatuses(serviceId) {
      if (serviceId === 'squared-fusion-mgmt') {
        return;
      }
      var summaryForService = _.find(USSService2.getStatusesSummary(), {
        serviceId: serviceId
      });
      var noUsersActivatedId = serviceId + ':noUsersActivated';
      var needsUserActivation = !summaryForService || (summaryForService.activated === 0 && summaryForService.error === 0 && summaryForService.notActivated ===
        0);
      if (needsUserActivation) {
        NotificationService.addNotification(
          NotificationService.types.TODO,
          noUsersActivatedId,
          4,
          'modules/hercules/notifications/no_users_activated.html', [serviceId]);
      } else {
        NotificationService.removeNotification(noUsersActivatedId);
        var userErrorsId = serviceId + ':userErrors';
        if (summaryForService && summaryForService.error > 0) {
          NotificationService.addNotification(
            NotificationService.types.ALERT,
            userErrorsId,
            4,
            'modules/hercules/notifications/user-errors.html', [serviceId], summaryForService);
        } else {
          NotificationService.removeNotification(userErrorsId);
        }
      }
    }

    function checkCallServiceConnect(serviceId) {
      if (serviceId !== 'squared-fusion-uc') {
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
                  'modules/hercules/notifications/sip_domain_not_configured.html', [serviceId]);
              } else {
                NotificationService.removeNotification('sipDomainNotConfigured');
              }
            });
          } else {
            NotificationService.removeNotification('sipDomainNotConfigured');
            if (callServiceConnect && !callServiceConnect.enabled && !callServiceConnect.acknowledged) {
              NotificationService.addNotification(
                NotificationService.types.NEW,
                'callServiceConnectAvailable',
                5,
                'modules/hercules/notifications/connect_available.html', [serviceId]);
            } else {
              NotificationService.removeNotification('callServiceConnectAvailable');
            }
          }
        }
      });
    }

    function allConnectorsConfigured(cluster, connectorType) {
      return _.chain(cluster.connectors)
        .filter(function (connector) {
          return connector.connectorType === connectorType;
        })
        .all(function (connector) {
          return connector.runningState !== 'not_configured';
        })
        .value();
    }

    function checkIfSomeConnectorsOk(connectorType) {
      var clusters = ClusterService.getClustersByConnectorType(connectorType);
      return _.chain(clusters)
        .some(function (cluster) {
          return _.chain(cluster.connectors)
            .filter(function (connector) {
              return connector.connectorType === connectorType;
            })
            .some(function (connector) {
              return ClusterService.getRunningStateSeverity(connector.state).label === 'ok';
            })
            .value();
        })
        .value();
    }

    function checkScheduleUpgradeAcknowledged(connectorType, serviceId) {
      ScheduleUpgradeService.get(Authinfo.getOrgId(), connectorType)
        .then(function (data) {
          if (!data.isAdminAcknowledged) {
            NotificationService.addNotification(
              NotificationService.types.TODO,
              'acknowledgeScheduleUpgrade',
              2,
              'modules/hercules/notifications/schedule-upgrade.html', [serviceId],
              null
            );
          }
        });
    }

    // TODO: add an event listener to remove the schedule-upgrade notification
    $rootScope.$on('ACK_SCHEDULE_UPGRADE', function () {
      NotificationService.removeNotification('acknowledgeScheduleUpgrade');
    });

    return {
      checkState: checkState
    };
  }
}());
