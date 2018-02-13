(function () {
  'use strict';

  // TODO: refactor - do not use 'ngtemplate-loader' or ng-include directive
  var notificationsNoDomainsTemplatePath = require('ngtemplate-loader?module=Hercules!modules/hercules/notifications/no-domains.html');
  var notificationsFuseNotPerformedTemplatePath = require('ngtemplate-loader?module=Hercules!modules/hercules/notifications/fuse-not-performed.html');
  var notificationsNoUsersActivatedForCalendarTemplatePath = require('ngtemplate-loader?module=Hercules!modules/hercules/notifications/no_users_activated_for_calendar.html');
  var notificationsNoUsersActivatedForCallConnectTemplatePath = require('ngtemplate-loader?module=Hercules!modules/hercules/notifications/no_users_activated_for_call_connect.html');
  var notificationsNoUsersActivatedForCallAwareTemplatePath = require('ngtemplate-loader?module=Hercules!modules/hercules/notifications/no_users_activated_for_call_aware.html');
  var notificationsCallUserErrorsTemplatePath = require('ngtemplate-loader?module=Hercules!modules/hercules/notifications/call-user-errors.html');
  var notificationsHybridMessageUserErrorsTemplatePath = require('ngtemplate-loader?module=Hercules!modules/hercules/notifications/hybrid-message-user-errors.html');
  var notificationsCalendarUserErrorsTemplatePath = require('ngtemplate-loader?module=Hercules!modules/hercules/notifications/calendar-user-errors.html');
  var notificationsSipUriDomainEnterpriseNotSetTemplatePath = require('ngtemplate-loader?module=Hercules!modules/hercules/notifications/sip_uri_domain_enterprise_not_set.html');
  var notificationsSipDomainNotConfiguredTemplatePath = require('ngtemplate-loader?module=Hercules!modules/hercules/notifications/sip_domain_not_configured.html');
  var notificationsConnectAvailableTemplatePath = require('ngtemplate-loader?module=Hercules!modules/hercules/notifications/connect_available.html');
  var notificationsReleaseChannelTemplatePath = require('ngtemplate-loader?module=Hercules!modules/hercules/notifications/release_channel.html');
  var notificationsServiceAlarmTemplatePath = require('ngtemplate-loader?module=Hercules!modules/hercules/notifications/service-alarm.html');

  angular
    .module('Hercules')
    .service('ServiceStateChecker', ServiceStateChecker);

  /*@ngInject*/
  function ServiceStateChecker($q, $translate, Authinfo, DomainManagementService, FmsOrgSettings, HybridServicesClusterService, HybridServicesExtrasService, HybridServicesUtilsService, NotificationService, Orgservice, ServiceDescriptorService, USSService, Notification) {
    var isSipUriAcknowledged = false;
    var hasSipUriDomainConfigured = false;
    var hasVerifiedDomains = false;
    var allExpresswayServices = ['squared-fusion-uc', 'squared-fusion-ec', 'squared-fusion-cal', 'squared-fusion-mgmt'];
    var servicesWithUserAssignments = ['squared-fusion-uc', 'squared-fusion-ec', 'squared-fusion-cal', 'spark-hybrid-impinterop', 'squared-fusion-gcal'];

    function checkState(serviceId) {
      checkIfFusePerformed()
        .then(function (performed) {
          if (performed) {
            checkDomainVerified(serviceId);
            checkUserStatuses(serviceId);
            checkCallServiceConnect(serviceId);
            checkUnassignedClusterReleaseChannels();
          } else {
            removeAllServiceAndUserNotifications();
          }
        });
      checkServiceAlarms(serviceId);
    }

    function checkDomainVerified(serviceId) {
      if (serviceId !== 'squared-fusion-uc' && serviceId !== 'squared-fusion-ec') {
        return;
      }
      if (hasVerifiedDomains) {
        return;
      }
      DomainManagementService.getVerifiedDomains()
        .then(function (domainList) {
          if (domainList.length === 0) {
            NotificationService.addNotification(
              NotificationService.types.TODO,
              'noDomains',
              1,
              notificationsNoDomainsTemplatePath, [serviceId]
            );
          } else {
            NotificationService.removeNotification('noDomains');
            hasVerifiedDomains = true;
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
      return HybridServicesClusterService.getAll().then(function (response) {
        var clusters = _.filter(response, { targetType: 'c_mgmt' });
        if (_.size(clusters) === 0) {
          NotificationService.addNotification(
            NotificationService.types.TODO,
            'fuseNotPerformed',
            1,
            notificationsFuseNotPerformedTemplatePath, allExpresswayServices);
          return false;
        } else {
          NotificationService.removeNotification('fuseNotPerformed');
          return true;
        }
      });
    }

    function setSipUriNotificationAcknowledgedAndRemoveNotification() {
      NotificationService.removeNotification('sipUriDomainEnterpriseNotConfigured');
      isSipUriAcknowledged = true;
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
      var summaryForService = USSService.getStatusesSummary()[serviceId];
      var noUsersActivatedId = serviceId + ':noUsersActivated';
      var needsUserActivation = summaryForService && summaryForService.activated === 0 && summaryForService.error === 0 && summaryForService.notActivated === 0;
      if (needsUserActivation) {
        switch (serviceId) {
          case 'squared-fusion-cal':
            addNotification(noUsersActivatedId, serviceId, notificationsNoUsersActivatedForCalendarTemplatePath);
            break;
          case 'squared-fusion-uc':
            ServiceDescriptorService.isServiceEnabled('squared-fusion-ec').then(function (enabled) {
              if (enabled) {
                addNotification(noUsersActivatedId, serviceId, notificationsNoUsersActivatedForCallConnectTemplatePath);
              } else {
                addNotification(noUsersActivatedId, serviceId, notificationsNoUsersActivatedForCallAwareTemplatePath);
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
            serviceId: 'squared-fusion-ec',
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
              notificationsCallUserErrorsTemplatePath, ['squared-fusion-uc'], data);
          } else {
            NotificationService.removeNotification(userErrorsId);
          }
        } else if (serviceId === 'squared-fusion-cal') {
          if (summaryForService && summaryForService.error > 0) {
            NotificationService.addNotification(
              NotificationService.types.ALERT,
              userErrorsId,
              4,
              notificationsCalendarUserErrorsTemplatePath, ['squared-fusion-cal'], summaryForService);
          } else {
            NotificationService.removeNotification(userErrorsId);
          }
        } else if (serviceId === 'spark-hybrid-impinterop') {
          if (summaryForService && summaryForService.error > 0) {
            NotificationService.addNotification(
              NotificationService.types.ALERT,
              userErrorsId,
              4,
              notificationsHybridMessageUserErrorsTemplatePath, ['spark-hybrid-impinterop'], summaryForService);
          } else {
            NotificationService.removeNotification(userErrorsId);
          }
        }
      }
    }

    function handleAtlasSipUriDomainEnterpriseNotification(serviceId) {
      if (!isSipUriAcknowledged) {
        if (hasSipUriDomainConfigured) {
          return;
        }
        var params = {
          basicInfo: true,
        };
        Orgservice.getOrg(function (data, status) {
          if (status === 200) {
            if (data && data.orgSettings && data.orgSettings.sipCloudDomain) {
              NotificationService.removeNotification('sipUriDomainEnterpriseNotConfigured');
              hasSipUriDomainConfigured = true;
            } else {
              addNotification('sipUriDomainEnterpriseNotConfigured', [serviceId], notificationsSipUriDomainEnterpriseNotSetTemplatePath);
            }
          }
        }, null, params);
      }
    }

    function checkCallServiceConnect(serviceId) {
      if (serviceId !== 'squared-fusion-uc') {
        return;
      }

      ServiceDescriptorService.getServices().then(function (items) {
        var callServiceConnect = _.find(items, {
          id: 'squared-fusion-ec',
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
                notificationsSipDomainNotConfiguredTemplatePath, [serviceId]);
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
              notificationsConnectAvailableTemplatePath, [serviceId]);
          } else {
            NotificationService.removeNotification('callServiceConnectAvailable');
          }
        }
      }).catch(function (error) {
        Notification.errorWithTrackingId(error, 'hercules.errors.couldNotGetServices');
      });
    }

    function checkUnassignedClusterReleaseChannels() {
      $q.all({
        clusters: HybridServicesClusterService.getAll(),
        settings: FmsOrgSettings.get(),
      })
        .then(function (results) {
          var defaultReleaseChannel = results.settings.expresswayClusterReleaseChannel;
          var clusters = _.filter(results.clusters, { targetType: 'c_mgmt' });
          var anomalies = _.filter(clusters, function (cluster) {
            return !cluster.resourceGroupId && cluster.releaseChannel !== defaultReleaseChannel;
          });
          if (anomalies.length > 0) {
            _.forEach(anomalies, function (cluster) {
              var serviceIds = _.chain(cluster.provisioning)
                .map(function (p) {
                  return HybridServicesUtilsService.connectorType2ServicesId(p.connectorType);
                })
                .flatten()
                .uniq()
                .value();
              NotificationService.addNotification(
                NotificationService.types.ALERT,
                'defaultReleaseChannel' + cluster.id,
                5,
                notificationsReleaseChannelTemplatePath,
                serviceIds,
                {
                  clusterId: cluster.id,
                  clusterName: cluster.name,
                  currentReleaseChannel: $translate.instant('hercules.fusion.add-resource-group.release-channel.' + cluster.releaseChannel),
                  defaultReleaseChannel: $translate.instant('hercules.fusion.add-resource-group.release-channel.' + defaultReleaseChannel),
                }
              );
            });
          }
        });
    }

    // Do not show these alarms as the checkUserStatuses() notifications already covers the fact that your have users in the error state
    var alarmsKeysToIgnore = ['uss.thresholdAlarmTriggered', 'uss.groupThresholdAlarmTriggered'];
    var serviceAlarmPrefix = 'serviceAlarm_';
    function checkServiceAlarms(serviceId) {
      HybridServicesExtrasService.getAlarms(serviceId)
        .then(function (alarms) {
          var alarmsWeCareAbout = _.filter(alarms, function (alarm) {
            return !_.includes(alarmsKeysToIgnore, alarm.key);
          });

          // Find the notifications raised for previous alarms
          var existingServiceAlarmIds = _.chain(NotificationService.getNotifications())
            .filter(function (notification) {
              return _.startsWith(notification.id, serviceAlarmPrefix);
            })
            .map(function (notification) {
              return notification.id;
            })
            .value();

          // Raise notifications for the current alarms
          _.forEach(alarmsWeCareAbout, function (alarm) {
            var notificationId = serviceAlarmPrefix + alarm.key + '_' + alarm.alarmId;
            NotificationService.addNotification(
              alarm.severity,
              notificationId,
              alarm.severity === 'error' ? 1 : 4,
              notificationsServiceAlarmTemplatePath,
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
      setSipUriNotificationAcknowledgedAndRemoveNotification: setSipUriNotificationAcknowledgedAndRemoveNotification,
    };
  }
}());
