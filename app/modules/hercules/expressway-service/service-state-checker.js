(function () {
  'use strict';

  /*@ngInject*/
  function ServiceStateChecker(NotificationService, ClusterService, USSService2, ServiceDescriptor, Authinfo, FeatureToggleService) {

    var allExpresswayServices = ['squared-fusion-uc', 'squared-fusion-cal', 'squared-fusion-mgmt'];

    function checkState(connectorType, serviceId) {
      if (checkIfFusePerformed()) {
        if (checkIfConnectorsConfigured(connectorType)) {
          checkUserStatuses(serviceId);
          checkCallServiceConnect(serviceId);
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

    function addNotification(noUsersActivatedId, serviceId, notification) {
      NotificationService.addNotification(
        NotificationService.types.TODO,
        noUsersActivatedId,
        4,
        notification, [serviceId]);
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
        switch (serviceId) {
        case "squared-fusion-cal":
          addNotification(noUsersActivatedId, serviceId, 'modules/hercules/notifications/no_users_activated_for_calendar.html');
          break;
        case "squared-fusion-uc":
          ServiceDescriptor.isServiceEnabled("squared-fusion-ec", function (error, enabled) {
            if (!error) {
              if (enabled) {
                addNotification(noUsersActivatedId, serviceId, 'modules/hercules/notifications/no_users_activated_for_call_connect.html');
              } else {
                addNotification(noUsersActivatedId, serviceId, 'modules/hercules/notifications/no_users_activated_for_call_aware.html');
              }
            }
          });
          break;
        default:
          break;
        }
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

    function handleAtlasSipUriDomainEnterpriseNotification(serviceId) {
      FeatureToggleService.supports(FeatureToggleService.features.atlasSipUriDomainEnterprise)
        .then(function (support) {
          if (support) {
            USSService2.getOrg(Authinfo.getOrgId()).then(function (org) {
              if (!org || !org.orgSettings || !org.orgSettings.sipCloudDomain) {
                NotificationService.addNotification(
                  NotificationService.types.TODO,
                  'sipUriDomainEnterpriseNotConfigured',
                  5,
                  'modules/hercules/notifications/sip_uri_domain_enterprise_not_set.html', [serviceId]);
              } else {
                NotificationService.removeNotification('sipUriDomainEnterpriseNotConfigured');
              }
            });
          }
        })
        .else(function () {
          NotificationService.removeNotification('sipUriDomainEnterpriseNotConfigured');
        })
        .catch(function () {});
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
            handleAtlasSipUriDomainEnterpriseNotification(serviceId);
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
          return connector.state !== 'not_configured' && connector.state !== 'not_installed';
        })
        .value();
    }

    return {
      checkState: checkState
    };
  }

  angular
    .module('Hercules')
    .service('ServiceStateChecker', ServiceStateChecker);

}());
