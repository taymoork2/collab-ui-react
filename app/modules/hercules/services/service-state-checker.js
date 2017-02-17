(function () {
  'use strict';

  angular
    .module('Hercules')
    .service('ServiceStateChecker', ServiceStateChecker);

  /*@ngInject*/
  function ServiceStateChecker($q, $translate, Authinfo, ClusterService, DomainManagementService, FeatureToggleService, FusionClusterService, FusionUtils, NotificationService, Orgservice, ServiceDescriptor, USSService, Notification) {
    var vm = this;
    vm.isSipUriAcknowledged = false;
    vm.hasSipUriDomainConfigured = false;
    vm.hasVerifiedDomains = false;
    var allExpresswayServices = ['squared-fusion-uc', 'squared-fusion-ec', 'squared-fusion-cal', 'squared-fusion-mgmt'];
    var servicesWithUserAssignments = ['squared-fusion-uc', 'squared-fusion-ec', 'squared-fusion-cal', 'squared-fusion-gcal'];

    function checkState(serviceId) {
      if (checkIfFusePerformed()) {
        checkDomainVerified(serviceId);
        checkUserStatuses(serviceId);
        checkCallServiceConnect(serviceId);
        checkUnassignedClusterReleaseChannels();
      } else {
        removeAllServiceAndUserNotifications();
      }
      checkServiceAlarms(serviceId);
    }

    function checkDomainVerified(serviceId) {
      if (serviceId !== 'squared-fusion-uc' && serviceId !== 'squared-fusion-ec') {
        return;
      }
      if (vm.hasVerifiedDomains) {
        return;
      }
      DomainManagementService.getVerifiedDomains()
        .then(function (domainList) {
          if (domainList.length === 0) {
            NotificationService.addNotification(
              NotificationService.types.TODO,
              'noDomains',
              1,
              'modules/hercules/notifications/no-domains.html', [serviceId]
            );
          } else {
            NotificationService.removeNotification('noDomains');
            vm.hasVerifiedDomains = true;
          }
        });
    }

    function removeAllServiceAndUserNotifications() {
      NotificationService.removeNotification('squared-fusion-uc:noUsersActivated');
      NotificationService.removeNotification('squared-fusion-ec:noUsersActivated');
      NotificationService.removeNotification('squared-fusion-cal:noUsersActivated');
      NotificationService.removeNotification('squared-fusion-uc:userErrors');
      NotificationService.removeNotification('squared-fusion-ec:userErrors');
      NotificationService.removeNotification('squared-fusion-cal:userErrors');
      NotificationService.removeNotification('sipDomainNotConfigured');
      NotificationService.removeNotification('sipUriDomainEnterpriseNotConfigured');
      NotificationService.removeNotification('callServiceConnectAvailable');
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

    function setSipUriNotificationAcknowledgedAndRemoveNotification() {
      NotificationService.removeNotification('sipUriDomainEnterpriseNotConfigured');
      vm.isSipUriAcknowledged = true;
    }

    function addNotification(notificationId, serviceId, notification) {
      NotificationService.addNotification(
        NotificationService.types.TODO,
        notificationId,
        4,
        notification, [serviceId]);
    }

    function checkUserStatuses(serviceId) {
      if (!_.includes(servicesWithUserAssignments, serviceId)) {
        return;
      }
      var summaryForService = _.find(USSService.getStatusesSummary(), {
        serviceId: serviceId
      });
      var noUsersActivatedId = serviceId + ':noUsersActivated';
      var needsUserActivation = summaryForService && summaryForService.activated === 0 && summaryForService.error === 0 && summaryForService.notActivated === 0;
      if (needsUserActivation) {
        switch (serviceId) {
          case "squared-fusion-cal":
            addNotification(noUsersActivatedId, serviceId, 'modules/hercules/notifications/no_users_activated_for_calendar.html');
            break;
          case "squared-fusion-uc":
            ServiceDescriptor.isServiceEnabled('squared-fusion-ec').then(function (enabled) {
              if (enabled) {
                addNotification(noUsersActivatedId, serviceId, 'modules/hercules/notifications/no_users_activated_for_call_connect.html');
              } else {
                addNotification(noUsersActivatedId, serviceId, 'modules/hercules/notifications/no_users_activated_for_call_aware.html');
              }
            });
            break;
          default:
            break;
        }
      } else {
        NotificationService.removeNotification(noUsersActivatedId);
        var userErrorsId = serviceId + ':userErrors';
        if (serviceId === 'squared-fusion-uc') {
          // Call Service has two sub-services, need special handling
          var awareStatus = summaryForService;
          var connectStatus = _.find(USSService.getStatusesSummary(), {
            serviceId: 'squared-fusion-ec'
          });
          if ((awareStatus && awareStatus.error > 0) || (connectStatus && connectStatus.error > 0)) {
            var data = [];
            if (awareStatus.error > 0) {
              data.push(awareStatus);
            }
            if (connectStatus && connectStatus.error > 0) {
              data.push(connectStatus);
            }
            NotificationService.addNotification(
              NotificationService.types.ALERT,
              userErrorsId,
              4,
              'modules/hercules/notifications/call-user-errors.html', ['squared-fusion-uc'], data);
          } else {
            NotificationService.removeNotification(userErrorsId);
          }
        } else {
          // if we are not in the Call Service page, we must be in the Calendar Service page
          if (summaryForService && summaryForService.error > 0) {
            NotificationService.addNotification(
              NotificationService.types.ALERT,
              userErrorsId,
              4,
              'modules/hercules/notifications/calendar-user-errors.html', ['squared-fusion-cal'], summaryForService);
          } else {
            NotificationService.removeNotification(userErrorsId);
          }

        }
      }
    }

    function handleAtlasSipUriDomainEnterpriseNotification(serviceId) {
      if (!vm.isSipUriAcknowledged) {
        FeatureToggleService.supports(FeatureToggleService.features.atlasSipUriDomainEnterprise)
          .then(function (support) {
            if (support) {
              if (vm.hasSipUriDomainConfigured) {
                return;
              }
              Orgservice.getOrg(function (data, status) {
                if (status === 200) {
                  if (data && data.orgSettings && data.orgSettings.sipCloudDomain) {
                    NotificationService.removeNotification('sipUriDomainEnterpriseNotConfigured');
                    vm.hasSipUriDomainConfigured = true;
                  } else {
                    addNotification('sipUriDomainEnterpriseNotConfigured', [serviceId], 'modules/hercules/notifications/sip_uri_domain_enterprise_not_set.html');
                  }
                }
              });
            } else {
              NotificationService.removeNotification('sipUriDomainEnterpriseNotConfigured');
            }
          });
      }
    }

    function checkCallServiceConnect(serviceId) {
      if (serviceId !== 'squared-fusion-uc') {
        return;
      }
      ServiceDescriptor.getServices().then(function (items) {
        var callServiceConnect = _.find(items || {}, {
          id: 'squared-fusion-ec'
        });
        if (callServiceConnect && callServiceConnect.enabled) {
          // we need to clear the notification after admin has setup enabled
          NotificationService.removeNotification('callServiceConnectAvailable');
          handleAtlasSipUriDomainEnterpriseNotification(serviceId);
          USSService.getOrg(Authinfo.getOrgId()).then(function (org) {
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
      }).catch(function (error) {
        Notification.errorWithTrackingId(error, 'hercules.error.failedToDisableConnect');
      });
    }

    function checkUnassignedClusterReleaseChannels() {
      var defaultReleaseChannelPromise = FusionClusterService.getOrgSettings()
        .then(function (data) {
          return data.expresswayClusterReleaseChannel;
        });
      FeatureToggleService.supports(FeatureToggleService.features.atlasF237ResourceGroup)
        .then(function (support) {
          return support ? defaultReleaseChannelPromise : $q.reject();
        })
        .then(function (defaultReleaseChannel) {
          var clusters = ClusterService.getClustersByConnectorType('c_mgmt');
          var anomalies = _.filter(clusters, function (cluster) {
            return !cluster.resourceGroupId && cluster.releaseChannel !== defaultReleaseChannel;
          });
          if (anomalies.length > 0) {
            _.forEach(anomalies, function (cluster) {
              var serviceIds = _.chain(cluster.provisioning)
                .map(function (p) {
                  return FusionUtils.connectorType2ServicesId(p.connectorType);
                })
                .flatten()
                .uniq()
                .value();
              NotificationService.addNotification(
                NotificationService.types.ALERT,
                'defaultReleaseChannel' + cluster.id,
                5,
                'modules/hercules/notifications/release_channel.html',
                serviceIds,
                {
                  clusterId: cluster.id,
                  clusterName: cluster.name,
                  currentReleaseChannel: $translate.instant('hercules.fusion.add-resource-group.release-channel.' + cluster.releaseChannel),
                  defaultReleaseChannel: $translate.instant('hercules.fusion.add-resource-group.release-channel.' + cluster.defaultReleaseChannel),
                }
              );
            });
          }
        });
    }

    // Do not show these alarms as the checkUserStatuses() notifications already covers the fact that your have users in the error state
    vm.alarmsKeysToIgnore = ['uss.thresholdAlarmTriggered', 'uss.groupThresholdAlarmTriggered'];
    vm.serviceAlarmPrefix = 'serviceAlarm_';
    function checkServiceAlarms(serviceId) {
      FusionClusterService.getAlarms(serviceId)
        .then(function (alarms) {
          var alarmsWeCareAbout = _.filter(alarms, function (alarm) {
            return !_.includes(vm.alarmsKeysToIgnore, alarm.key);
          });

          // Find the notifications raised for previous alarms
          var existingServiceAlarmIds = _.chain(NotificationService.getNotifications())
            .filter(function (notification) {
              return _.startsWith(notification.id, vm.serviceAlarmPrefix);
            })
            .map(function (notification) {
              return notification.id;
            })
            .value();

          // Raise notifications for the current alarms
          _.forEach(alarmsWeCareAbout, function (alarm) {
            var notificationId = vm.serviceAlarmPrefix + alarm.key + '_' + alarm.alarmId;
            NotificationService.addNotification(
              alarm.severity,
              notificationId,
              alarm.severity === 'error' ? 1 : 4,
              'modules/hercules/notifications/service-alarm.html',
              [serviceId],
              alarm
            );
            _.remove(existingServiceAlarmIds, function (existingId) {
              return existingId === notificationId;
            });
          });

          // Remove the notifications for alarms that no longer exists
          _.forEach(existingServiceAlarmIds, function (id) {
            NotificationService.removeNotification(id);
          });
        });
    }

    return {
      checkState: checkState,
      checkUserStatuses: checkUserStatuses,
      setSipUriNotificationAcknowledgedAndRemoveNotification: setSipUriNotificationAcknowledgedAndRemoveNotification
    };
  }
}());
