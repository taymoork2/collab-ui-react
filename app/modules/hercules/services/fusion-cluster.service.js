(function () {
  'use strict';

  // This service should obsolete ClusterService during 2016

  angular
    .module('Hercules')
    .factory('FusionClusterService', FusionClusterService);

  /* @ngInject */
  function FusionClusterService($http, $q, $translate, Authinfo, HybridServicesClusterStatesService, HybridServicesUtils, UrlConfig, USSService, Notification) {
    var service = {
      preregisterCluster: preregisterCluster,
      addPreregisteredClusterToAllowList: addPreregisteredClusterToAllowList,
      getPreregisteredClusterAllowList: getPreregisteredClusterAllowList,
      provisionConnector: provisionConnector,
      deprovisionConnector: deprovisionConnector,
      getAll: getAll,
      get: get,
      buildSidepanelConnectorList: buildSidepanelConnectorList,
      setUpgradeSchedule: setUpgradeSchedule,
      postponeUpgradeSchedule: postponeUpgradeSchedule,
      deleteMoratoria: deleteMoratoria,
      setClusterName: setClusterName,
      setReleaseChannel: setReleaseChannel,
      deregisterCluster: deregisterCluster,
      getReleaseNotes: getReleaseNotes,
      getAggregatedStatusForService: getAggregatedStatusForService,
      processClustersToAggregateStatusForService: processClustersToAggregateStatusForService,
      serviceIsSetUp: serviceIsSetUp,
      processClustersToSeeIfServiceIsSetup: processClustersToSeeIfServiceIsSetup,
      formatTimeAndDate: formatTimeAndDate,
      labelForTime: labelForTime,
      labelForDay: labelForDay,
      getStatusForService: getStatusForService,
      getResourceGroups: getResourceGroups,
      getClustersForResourceGroup: getClustersForResourceGroup,
      getUnassignedClusters: getUnassignedClusters,
      setClusterAllowListInfoForExpressway: setClusterAllowListInfoForExpressway,
      getAlarms: getAlarms,
      getOrgSettings: getOrgSettings,
      setOrgSettings: setOrgSettings,
      getConnector: getConnector,
      getHost: getHost,
      updateHost: updateHost,
    };

    return service;

    ////////////////

    function get(clusterId, orgId) {
      return $http
        .get(UrlConfig.getHerculesUrlV2() + '/organizations/' + (orgId || Authinfo.getOrgId()) + '/clusters/' + clusterId + '?fields=@wide')
        .then(extractData);
    }

    function getAll(orgId) {
      return $http
        .get(UrlConfig.getHerculesUrlV2() + '/organizations/' + (orgId || Authinfo.getOrgId()) + '?fields=@wide')
        .then(extractClustersFromResponse)
        .then(filterUnknownClusters)
        .then(addServicesStatuses)
        .then(sort);
    }

    function getResourceGroups() {
      return $http
        .get(UrlConfig.getHerculesUrlV2() + '/organizations/' + Authinfo.getOrgId() + '?fields=@wide')
        .then(extractData)
        .then(function addServicesStatusesToClusters(org) {
          org.clusters = addServicesStatuses(org.clusters);
          return org;
        })
        .then(function addInfoToEmptyExpresswayClusters(org) {
          return setClusterAllowListInfoForExpressway(org.clusters)
            .then(function (clusters) {
              org.clusters = clusters;
              return org;
            });
        })
        .then(function formatData(org) {
          var resourceGroups = _.sortBy(org.resourceGroups, 'name');
          return {
            groups: _.map(resourceGroups, function (resourceGroup) {
              return {
                id: resourceGroup.id,
                name: resourceGroup.name,
                releaseChannel: resourceGroup.releaseChannel,
                clusters: sort(getClustersForResourceGroup(resourceGroup.id, org.clusters)),
              };
            }),
            unassigned: sort(getUnassignedClusters(org.clusters)),
          };
        })
        .then(addUserCount);
    }

    function getClustersForResourceGroup(id, clusters) {
      return _.filter(clusters, function (cluster) {
        return cluster.resourceGroupId === id;
      });
    }

    function getUnassignedClusters(clusters) {
      return _.filter(clusters, function (cluster) {
        return cluster.resourceGroupId === undefined;
      });
    }

    function setUpgradeSchedule(id, params) {
      var orgId = Authinfo.getOrgId();
      return $http.patch(UrlConfig.getHerculesUrlV2() + '/organizations/' + orgId + '/clusters/' + id + '/upgradeSchedule', params);
    }

    function postponeUpgradeSchedule(id, upgradeWindow) {
      var orgId = Authinfo.getOrgId();
      return $http.post(UrlConfig.getHerculesUrlV2() + '/organizations/' + orgId + '/clusters/' + id + '/upgradeSchedule/moratoria', {
        timeWindow: upgradeWindow,
      });
    }

    function deleteMoratoria(clusterId, moratoriaId) {
      var orgId = Authinfo.getOrgId();
      return $http.delete(UrlConfig.getHerculesUrlV2() + '/organizations/' + orgId + '/clusters/' + clusterId + '/upgradeSchedule/moratoria/' + moratoriaId);
    }

    function extractData(response) {
      return response.data;
    }

    function extractClustersFromResponse(response) {
      return _.get(extractData(response), 'clusters', []);
    }

    function addServicesStatuses(clusters) {
      return _.map(clusters, function (cluster) {
        if (cluster.targetType === 'c_mgmt') {
          var mgmtConnectors = _.filter(cluster.connectors, { connectorType: 'c_mgmt' });
          var ucmcConnectors = _.filter(cluster.connectors, { connectorType: 'c_ucmc' });
          var calConnectors = _.filter(cluster.connectors, { connectorType: 'c_cal' });
          cluster.servicesStatuses = [{
            serviceId: 'squared-fusion-mgmt',
            state: HybridServicesClusterStatesService.getMergedStateSeverity(mgmtConnectors),
            total: mgmtConnectors.length,
          }, {
            serviceId: 'squared-fusion-uc',
            state: HybridServicesClusterStatesService.getMergedStateSeverity(ucmcConnectors),
            total: ucmcConnectors.length,
          }, {
            serviceId: 'squared-fusion-cal',
            state: HybridServicesClusterStatesService.getMergedStateSeverity(calConnectors),
            total: calConnectors.length,
          }];
        } else if (cluster.targetType === 'mf_mgmt') {
          var mediaConnectors = _.filter(cluster.connectors, { connectorType: 'mf_mgmt' });
          cluster.servicesStatuses = [{
            serviceId: 'squared-fusion-media',
            state: HybridServicesClusterStatesService.getMergedStateSeverity(mediaConnectors),
            total: mediaConnectors.length,
          }];
        } else if (cluster.targetType === 'hds_app') {
          var hdsConnectors = _.filter(cluster.connectors, { connectorType: 'hds_app' });
          cluster.servicesStatuses = [{
            serviceId: 'spark-hybrid-datasecurity',
            state: HybridServicesClusterStatesService.getMergedStateSeverity(hdsConnectors),
            total: hdsConnectors.length,
          }];
        } else if (cluster.targetType === 'cs_mgmt') {
          var hybridContextConnectors = _.filter(cluster.connectors, { connectorType: 'cs_mgmt' });
          cluster.servicesStatuses = [{
            serviceId: 'contact-center-context',
            state: HybridServicesClusterStatesService.getMergedStateSeverity(hybridContextConnectors),
            total: hybridContextConnectors.length,
          }];
        } else if (cluster.targetType === 'ucm_mgmt') {
          var ucmConnectors = _.filter(cluster.connectors, { connectorType: 'ucm_mgmt' });
          cluster.servicesStatuses = [{
            serviceId: 'squared-fusion-khaos',
            state: HybridServicesClusterStatesService.getMergedStateSeverity(ucmConnectors),
            total: ucmConnectors.length,
          }];
        }
        return cluster;
      });
    }

    function sort(clusters) {
      // Could be anything but at least make it consistent between 2 page refresh
      return _.sortBy(clusters, ['targetType', 'name']);
    }

    function preregisterCluster(name, releaseChannel, managementConnectorType) {
      var url = UrlConfig.getHerculesUrlV2() + '/organizations/' + Authinfo.getOrgId() + '/clusters';
      return $http.post(url, {
        name: name,
        releaseChannel: releaseChannel,
        targetType: managementConnectorType,
      })
        .then(extractData);
    }

    function addPreregisteredClusterToAllowList(hostname, ttlInSeconds, clusterId) {
      var url = UrlConfig.getHerculesUrl() + '/organizations/' + Authinfo.getOrgId() + '/allowedRedirectTargets';
      return $http.post(url, {
        hostname: hostname,
        ttlInSeconds: ttlInSeconds,
        clusterId: clusterId,
      });
    }

    function getPreregisteredClusterAllowList() {
      var url = UrlConfig.getHerculesUrl() + '/organizations/' + Authinfo.getOrgId() + '/allowedRedirectTargets';
      return $http.get(url).then(extractData);
    }

    function provisionConnector(clusterId, connectorType) {
      var url = UrlConfig.getHerculesUrlV2() + '/organizations/' + Authinfo.getOrgId() + '/clusters/' + clusterId +
        '/provisioning/actions/add/invoke?connectorType=' + connectorType;
      return $http.post(url)
        .then(extractData);
    }

    function deprovisionConnector(clusterId, connectorType) {
      var url = UrlConfig.getHerculesUrlV2() + '/organizations/' + Authinfo.getOrgId() + '/clusters/' + clusterId +
        '/provisioning/actions/remove/invoke?connectorType=' + connectorType;
      return $http.post(url)
        .then(extractData);
    }

    function buildSidepanelConnectorList(cluster, connectorTypeToKeep) {
      // Find and populate hostnames only, and make sure that they are only there once
      var nodes = _.chain(cluster.connectors)
        .map(function (connector) {
          return {
            hostname: connector.hostname,
            connectors: [],
          };
        })
        .uniqBy(function (host) {
          return host.hostname;
        })
        .value();

      // Find and add all c_mgmt connectors (always displayed no matter the current service pages we are looking at)
      // plus the connectors we're really interested in
      _.forEach(cluster.connectors, function (connector) {
        if (connector.connectorType === 'c_mgmt' || connector.connectorType === connectorTypeToKeep || connector.connectorType === 'cs_context' || connector.connectorType === 'cs_mgmt') {
          var node = _.find(nodes, function (node) {
            return node.hostname === connector.hostname;
          });
          node.connectors.push(connector);
        }
      });
      return nodes;
    }

    function setClusterName(clusterId, newClusterName) {
      var url = UrlConfig.getHerculesUrlV2() + '/organizations/' + Authinfo.getOrgId() + '/clusters/' + clusterId;
      return $http.patch(url, {
        name: newClusterName,
      })
        .then(extractData);
    }

    function setReleaseChannel(clusterId, releaseChannel) {
      var url = UrlConfig.getHerculesUrlV2() + '/organizations/' + Authinfo.getOrgId() + '/clusters/' + clusterId;
      return $http.patch(url, { releaseChannel: releaseChannel })
        .then(extractData);
    }

    function deregisterCluster(clusterId) {
      var url = UrlConfig.getHerculesUrlV2() + '/organizations/' + Authinfo.getOrgId() + '/actions/deregisterCluster/invoke?clusterId=' + clusterId;
      return $http.post(url)
        .then(extractData);
    }

    function getReleaseNotes(releaseChannel, connectorType) {
      var url = UrlConfig.getHerculesUrlV2() + '/organizations/' + Authinfo.getOrgId() + '/channels/' + releaseChannel + '/packages/' + connectorType + '?fields=@wide';
      return $http.get(url)
        .then(extractData)
        .then(function (data) {
          return _.get(data, 'releaseNotes', '');
        });
    }

    function getAggregatedStatusForService(serviceId) {
      return getAll()
        .then(function (clusters) {
          return clusters.filter(function (cluster) {
            return cluster.targetType === 'c_mgmt';
          });
        })
        .then(function (clusters) {
          return processClustersToAggregateStatusForService(serviceId, clusters);
        });
    }

    function processClustersToAggregateStatusForService(serviceId, clusterList) {
      // get the aggregated statuses per cluster, and transform them into a flat array that
      // represents the state of each cluster for only that service, e.g. ['stopped', 'running']
      var statuses = _.chain(clusterList)
        .map('servicesStatuses')
        .flatten()
        .filter({ serviceId: serviceId })
        .map(function (service) {
          return service.state ? service.state.name : 'unknown';
        })
        .value();

      if (statuses.length === 0 || _.every(statuses, function (value) {
        return value === 'not_installed';
      })) {
        return 'setupNotComplete';
      }

      // For Hybrid Media we have to handle upgrading scenario differently than expressway
      if (serviceId === 'squared-fusion-media') {
        if (_.every(statuses, function (value) {
          return (value === 'upgrading');
        })) {
          return 'outage';
        }

        if (_.find(statuses, function (value) {
          return (value === 'upgrading');
        })) {
          return 'impaired';
        }
      }

      // We have an outage if all clusters have their connectors in these states or combinations of them:
      if (_.every(statuses, function (value) {
        return (value === 'unknown' || value === 'stopped' || value === 'disabled' || value === 'offline' || value === 'not_configured' || value === 'not_operational');
      })) {
        return 'outage';
      }

      // Service is degraded if one or more clusters have their connectors in one of these states:
      if (_.find(statuses, function (value) {
        return (value === 'has_alarms' || value === 'stopped' || value === 'not_operational' || value === 'disabled' || value === 'offline');
      })) {
        return 'impaired';
      }

      // fallback: if no connectors are running, return at least 'degraded'
      if (!_.includes(statuses, 'running')) {
        return 'impaired';
      }

      // if no other rule applies, assume we're operational!
      return 'operational';

    }

    function serviceIsSetUp(serviceId) {
      return getAll()
        .then(function (clusterList) {
          return processClustersToSeeIfServiceIsSetup(serviceId, clusterList);
        });
    }

    function processClustersToSeeIfServiceIsSetup(serviceId, clusterList) {
      var connectorType = HybridServicesUtils.serviceId2ConnectorType(serviceId);
      if (connectorType === '') {
        return false; // Cannot recognize service, default to *not* enabled
      }

      if (serviceId === 'squared-fusion-media') {
        return _.some(clusterList, { targetType: 'mf_mgmt' });
      } else if (serviceId === 'contact-center-context') {
        return _.some(clusterList, { targetType: 'cs_mgmt' });
      } else if (serviceId === 'spark-hybrid-datasecurity') {
        return _.some(clusterList, { targetType: 'hds_app' });
      } else {
        return _.chain(clusterList)
          .map('provisioning')
          .flatten()
          .some({ connectorType: connectorType })
          .value();
      }
    }

    function formatTimeAndDate(upgradeSchedule) {
      var time = labelForTime(upgradeSchedule.scheduleTime);
      var day;
      if (upgradeSchedule.scheduleDays.length === 7) {
        day = $translate.instant('weekDays.everyDay', {
          day: $translate.instant('weekDays.day'),
        });
      } else {
        day = labelForDay(upgradeSchedule.scheduleDays[0]);
      }
      return time + ' ' + day;
    }

    function labelForTime(time) {
      var currentLanguage = $translate.use();
      if (currentLanguage === 'en_US') {
        return moment(time, 'HH:mm').format('hh:mm A');
      } else {
        return time;
      }
    }

    function labelForDay(day) {
      return $translate.instant('weekDays.everyDay', {
        day: $translate.instant('weekDays.' + day),
      });
    }

    function getStatusForService(serviceId, clusterList) {
      var serviceStatus = {
        serviceId: serviceId,
        setup: processClustersToSeeIfServiceIsSetup(serviceId, clusterList),
        status: processClustersToAggregateStatusForService(serviceId, clusterList),
      };
      serviceStatus.statusCss = HybridServicesClusterStatesService.getStatusIndicatorCSSClass(serviceStatus.status);
      return serviceStatus;
    }

    function addUserCount(response) {
      if (response.groups.length === 0) {
        return response;
      }
      return USSService.getUserPropsSummary()
        .then(function (summary) {
          return {
            groups: _.map(response.groups, function (group) {
              var countForGroup = _.find(summary.userCountByResourceGroup, function (count) {
                return count.resourceGroupId === group.id;
              });
              group.numberOfUsers = countForGroup ? countForGroup.numberOfUsers : 0;
              return group;
            }),
            unassigned: response.unassigned,
            clusters: response.clusters,
          };
        }).catch(function () {
          return {
            groups: _.map(response.groups, function (group) {
              group.numberOfUsers = '?';
              return group;
            }),
            unassigned: response.unassigned,
            clusters: response.clusters,
          };
        });
    }

    function setClusterAllowListInfoForExpressway(clusters) {
      var emptyExpresswayClusters = _.chain(clusters)
        .filter(function (cluster) {
          return cluster.targetType === 'c_mgmt' && _.size(cluster.connectors) === 0;
        })
        .map(function (cluster) {
          cluster.isEmptyExpresswayCluster = true;
          return cluster;
        })
        .value();
      if (_.size(emptyExpresswayClusters) === 0) {
        return $q.resolve(clusters);
      }
      return getPreregisteredClusterAllowList()
        .then(function (allowList) {
          return _.map(clusters, function (cluster) {
            if (cluster.isEmptyExpresswayCluster) {
              cluster.allowedRedirectTarget = _.find(allowList, { clusterId: cluster.id });
              if (cluster.aggregates && !cluster.allowedRedirectTarget) {
                cluster.aggregates.state = 'registrationTimeout';
              }
            }
            return cluster;
          });
        })
        .catch(function (error) {
          Notification.errorWithTrackingId(error, 'hercules.genericFailure');
        });
    }

    function filterUnknownClusters(clusters) {
      return _.filter(clusters, function (cluster) {
        return cluster.targetType !== 'unknown';
      });
    }

    function getAlarms(serviceId, orgId) {
      var url = UrlConfig.getHerculesUrlV2() + '/organizations/' + (orgId || Authinfo.getOrgId()) + '/alarms?serviceId=' + serviceId + '&sourceType=cloud';
      return $http.get(url).then(extractAndTranslateAlarms);
    }

    function extractAndTranslateAlarms(res) {
      var alarms = res.data.items;
      return _.chain(alarms)
        .sortBy(getAlarmSortOrder)
        .map(function (alarm) {
          var translateReplacements = convertToTranslateReplacements(alarm.replacementValues);
          alarm.title = translateWithFallback(alarm.key + '.title', alarm.title, translateReplacements);
          alarm.description = translateWithFallback(alarm.key + '.description', alarm.description, translateReplacements);
          return alarm;
        })
        .value();
    }

    function translateWithFallback(alarmKey, fallback, translateReplacements) {
      var translationKey = 'hercules.serviceAlarms.' + alarmKey;
      var translation = $translate.instant(translationKey, translateReplacements);
      return translation === translationKey ? fallback : translation;
    }

    function convertToTranslateReplacements(alarmReplacementValues) {
      return _.reduce(alarmReplacementValues, function (translateReplacements, replacementValue) {
        translateReplacements[replacementValue.key] = replacementValue.type === 'timestamp' ? HybridServicesUtils.getLocalTimestamp(replacementValue.value) : replacementValue.value;
        return translateReplacements;
      }, {});
    }

    function getAlarmSortOrder(alarm) {
      switch (alarm.severity) {
        case 'critical':
          return -1;
        case 'error':
          return 0;
        case 'warning':
          return 1;
        default:
          return 2;
      }
    }

    function getOrgSettings(orgId) {
      var url = UrlConfig.getHerculesUrlV2() + '/organizations/' + (orgId || Authinfo.getOrgId()) + '/settings';
      return $http.get(url).then(extractData);
    }

    function setOrgSettings(params, orgId) {
      var url = UrlConfig.getHerculesUrlV2() + '/organizations/' + (orgId || Authinfo.getOrgId()) + '/settings';
      return $http.patch(url, params).then(extractData);
    }

    function getConnector(connectorId, orgId) {
      if (connectorId.search(/@calendar-cloud-connector/i) !== -1) {
        return $q.reject({ 'data': { 'statusText': 'NotFound', 'status': 404, 'errors': [{ 'message': 'calendar-cloud-connector is not a valid connectorId' }] } });
      } else {
        var url = UrlConfig.getHerculesUrlV2() + '/organizations/' + (orgId || Authinfo.getOrgId()) + '/connectors/' + connectorId;
        return $http.get(url).then(extractData);
      }
    }

    function getHost(serial, orgId) {
      var url = UrlConfig.getHerculesUrlV2() + '/organizations/' + (orgId || Authinfo.getOrgId()) + '/hosts/' + serial;
      return $http.get(url).then(extractData);
    }

    function updateHost(serial, params, orgId) {
      var url = UrlConfig.getHerculesUrlV2() + '/organizations/' + (orgId || Authinfo.getOrgId()) + '/hosts/' + serial;
      return $http.patch(url, params).then(extractData);
    }
  }
})();
