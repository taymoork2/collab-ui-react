(function () {
  'use strict';

  // This service should obsolete ClusterService during 2016

  angular
    .module('Hercules')
    .factory('FusionClusterService', FusionClusterService);

  /* @ngInject */
  function FusionClusterService($http, UrlConfig, Authinfo, FusionClusterStatesService, FusionUtils, $translate) {
    var service = {
      preregisterCluster: preregisterCluster,
      addPreregisteredClusterToAllowList: addPreregisteredClusterToAllowList,
      provisionConnector: provisionConnector,
      deprovisionConnector: deprovisionConnector,
      getAllProvisionedConnectorTypes: getAllProvisionedConnectorTypes,
      getAll: getAll,
      getAllNonMediaClusters: getAllNonMediaClusters,
      get: get,
      buildSidepanelConnectorList: buildSidepanelConnectorList,
      setUpgradeSchedule: setUpgradeSchedule,
      postponeUpgradeSchedule: postponeUpgradeSchedule,
      deleteMoratoria: deleteMoratoria,
      setClusterName: setClusterName,
      deregisterCluster: deregisterCluster,
      getReleaseNotes: getReleaseNotes,
      getAggregatedStatusForService: getAggregatedStatusForService,
      processClustersToAggregateStatusForService: processClustersToAggregateStatusForService,
      serviceIsSetUp: serviceIsSetUp,
      processClustersToSeeIfServiceIsSetup: processClustersToSeeIfServiceIsSetup,
      formatTimeAndDate: formatTimeAndDate,
      labelForTime: labelForTime,
      labelForDay: labelForDay
    };

    return service;

    ////////////////

    function get(clusterId) {
      return $http
        .get(UrlConfig.getHerculesUrlV2() + '/organizations/' + Authinfo.getOrgId() + '/clusters/' + clusterId + '?fields=@wide')
        .then(extractDataFromResponse);
    }

    function getAll() {
      return $http
        .get(UrlConfig.getHerculesUrlV2() + '/organizations/' + Authinfo.getOrgId() + '?fields=@wide')
        .then(extractClustersFromResponse)
        .then(addServicesStatuses)
        .then(sort);
    }

    function getAllNonMediaClusters() {
      return $http
        .get(UrlConfig.getHerculesUrlV2() + '/organizations/' + Authinfo.getOrgId() + '?fields=@wide')
        .then(extractClustersFromResponse)
        .then(removeMediaClusters)
        .then(addServicesStatuses)
        .then(sort);
    }

    function setUpgradeSchedule(id, params) {
      var orgId = Authinfo.getOrgId();
      return $http.patch(UrlConfig.getHerculesUrlV2() + '/organizations/' + orgId + '/clusters/' + id + '/upgradeSchedule', params);
    }

    function postponeUpgradeSchedule(id, upgradeWindow) {
      var orgId = Authinfo.getOrgId();
      return $http.post(UrlConfig.getHerculesUrlV2() + '/organizations/' + orgId + '/clusters/' + id + '/upgradeSchedule/moratoria', {
        timeWindow: upgradeWindow
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
      return extractData(response).clusters;
    }

    function extractDataFromResponse(res) {
      return res.data;
    }

    function removeMediaClusters(clusters) {
      return _.filter(clusters, function (cluster) {
        return cluster.targetType !== 'mf_mgmt';
      });
      /*var clustersWithOutMedia = [];
      _.forEach(clusters, function (cluster) {
        if (cluster.targetType !== 'mf_mgmt') {
          clustersWithOutMedia.push(cluster);
        }
      });
      return clustersWithOutMedia;*/
    }

    function addServicesStatuses(clusters) {
      return _.map(clusters, function (cluster) {
        if (cluster.targetType === 'c_mgmt') {
          var mgmtConnectors = _.filter(cluster.connectors, 'connectorType', 'c_mgmt');
          var ucmcConnectors = _.filter(cluster.connectors, 'connectorType', 'c_ucmc');
          var calConnectors = _.filter(cluster.connectors, 'connectorType', 'c_cal');
          cluster.servicesStatuses = [{
            serviceId: 'squared-fusion-mgmt',
            state: FusionClusterStatesService.getMergedStateSeverity(mgmtConnectors),
            total: mgmtConnectors.length
          }, {
            serviceId: 'squared-fusion-uc',
            state: FusionClusterStatesService.getMergedStateSeverity(ucmcConnectors),
            total: ucmcConnectors.length
          }, {
            serviceId: 'squared-fusion-cal',
            state: FusionClusterStatesService.getMergedStateSeverity(calConnectors),
            total: calConnectors.length
          }];
        } else if (cluster.targetType === 'mf_mgmt') {
          var mediaConnectors = _.filter(cluster.connectors, 'connectorType', 'mf_mgmt');
          cluster.servicesStatuses = [{
            serviceId: 'squared-fusion-media',
            state: FusionClusterStatesService.getMergedStateSeverity(mediaConnectors),
            total: mediaConnectors.length
          }];
        }
        return cluster;
      });
    }

    function sort(clusters) {
      // Could be anything but at least make it consistent between 2 page refresh
      return _.sortByAll(clusters, ['type', 'name']);
    }

    function preregisterCluster(name, releaseChannel, managementConnectorType) {
      var url = UrlConfig.getHerculesUrlV2() + '/organizations/' + Authinfo.getOrgId() + '/clusters';
      return $http.post(url, {
        name: name,
        releaseChannel: releaseChannel,
        targetType: managementConnectorType
      })
        .then(extractDataFromResponse);
    }

    function addPreregisteredClusterToAllowList(hostname, ttlInSeconds, clusterId) {
      var url = UrlConfig.getHerculesUrl() + '/organizations/' + Authinfo.getOrgId() + '/allowedRedirectTargets';
      return $http.post(url, {
        hostname: hostname,
        ttlInSeconds: ttlInSeconds,
        clusterId: clusterId
      });
    }

    function provisionConnector(clusterId, connectorType) {
      var url = UrlConfig.getHerculesUrlV2() + '/organizations/' + Authinfo.getOrgId() + '/clusters/' + clusterId +
        '/provisioning/actions/add/invoke?connectorType=' + connectorType;
      return $http.post(url)
        .then(extractDataFromResponse);
    }

    function deprovisionConnector(clusterId, connectorType) {
      var url = UrlConfig.getHerculesUrlV2() + '/organizations/' + Authinfo.getOrgId() + '/clusters/' + clusterId +
        '/provisioning/actions/remove/invoke?connectorType=' + connectorType;
      return $http.post(url)
        .then(extractDataFromResponse);
    }

    function getAllProvisionedConnectorTypes(clusterId) {
      return get(clusterId)
        .then(function (data) {
          return _.map(data.provisioning, 'connectorType');
        });
    }

    function buildSidepanelConnectorList(cluster, connectorTypeToKeep) {
      var sidepanelConnectorList = {};
      sidepanelConnectorList.hosts = [];
      sidepanelConnectorList.servicesStatuses = cluster.servicesStatuses;
      sidepanelConnectorList.name = cluster.name;
      sidepanelConnectorList.id = cluster.id;

      /* Find and populate hostnames only, and make sure that they are only there once */
      _.forEach(cluster.connectors, function (connector) {
        sidepanelConnectorList.hosts.push({
          hostname: connector.hostname,
          connectors: []
        });
      });
      sidepanelConnectorList.hosts = _.uniq(sidepanelConnectorList.hosts, function (host) {
        return host.hostname;
      });

      /* Find and add all c_mgmt connectors, plus the connectors we're really interested in  */
      _.forEach(cluster.connectors, function (connector) {
        if (connector.connectorType === 'c_mgmt' || connector.connectorType === connectorTypeToKeep) {
          var host = _.find(sidepanelConnectorList.hosts, function (host) {
            return host.hostname === connector.hostname;
          });
          var index = _.indexOf(sidepanelConnectorList.hosts, host);
          if (index !== -1) {
            sidepanelConnectorList.hosts[index].connectors.push(connector);
          }
        }
      });
      return sidepanelConnectorList;
    }

    function setClusterName(clusterId, newClusterName) {
      var url = UrlConfig.getHerculesUrlV2() + '/organizations/' + Authinfo.getOrgId() + '/clusters/' + clusterId;
      return $http.patch(url, {
        name: newClusterName
      })
        .then(extractDataFromResponse);
    }

    function deregisterCluster(clusterId) {
      var url = UrlConfig.getHerculesUrlV2() + '/organizations/' + Authinfo.getOrgId() + '/actions/deregisterCluster/invoke?clusterId=' + clusterId;
      return $http.post(url)
        .then(extractDataFromResponse);
    }

    function getReleaseNotes(releaseChannel, connectorType) {
      var url = UrlConfig.getHerculesUrlV2() + '/organizations/' + Authinfo.getOrgId() + '/channels/' + releaseChannel + '/packages/' + connectorType + '?fields=@wide';
      return $http.get(url)
        .then(extractDataFromResponse)
        .then(function (data) {
          return data.releaseNotes;
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
      var allServicesStatuses = _.map(clusterList, 'servicesStatuses');
      var statuses = _.map(allServicesStatuses, function (services) {
        var matchingService = _.find(services, function (service) {
          return service.serviceId === serviceId;
        });
        if (matchingService && matchingService.state) {
          return matchingService.state.name;
        } else {
          return 'unknown';
        }
      });

      // if no data or invalid data, assume that something is wrong
      if (statuses.length === 0) {
        return 'outage';
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

      if (!Authinfo.isEntitled(serviceId)) {
        return false;
      }

      var target_connector = FusionUtils.serviceId2ConnectorType(serviceId);

      if (target_connector === '') {
        return false; // Cannot recognize service, default to *not* enabled
      }

      var installedConnectors = _.map(clusterList, 'connectors');
      return _.some(installedConnectors, function (cluster) {
        return _.some(cluster, function (connector) {
          return connector.connectorType === target_connector;
        });
      });
    }

    function formatTimeAndDate(upgradeSchedule) {
      var time = labelForTime(upgradeSchedule.scheduleTime);
      var day;
      if (upgradeSchedule.scheduleDays.length === 7) {
        day = $translate.instant('weekDays.everyDay', {
          day: $translate.instant('weekDays.day')
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
        day: $translate.instant('weekDays.' + day)
      });
    }

  }
})();
