(function () {
  'use strict';

  // This service should obsolete ClusterService during 2016

  angular
    .module('Hercules')
    .factory('FusionClusterService', FusionClusterService);

  /* @ngInject */
  function FusionClusterService($http, $q, Authinfo, HybridServicesClusterStatesService, HybridServicesExtrasService, HybridServicesUtilsService, UrlConfig, USSService, Notification) {
    var service = {
      preregisterCluster: preregisterCluster,
      provisionConnector: provisionConnector,
      deprovisionConnector: deprovisionConnector,
      getAll: getAll,
      get: get,
      setUpgradeSchedule: setUpgradeSchedule,
      postponeUpgradeSchedule: postponeUpgradeSchedule,
      deleteMoratoria: deleteMoratoria,
      deregisterCluster: deregisterCluster,
      deregisterEcpNode: deregisterEcpNode,
      getAggregatedStatusForService: getAggregatedStatusForService,
      processClustersToAggregateStatusForService: processClustersToAggregateStatusForService,
      serviceIsSetUp: serviceIsSetUp,
      processClustersToSeeIfServiceIsSetup: processClustersToSeeIfServiceIsSetup,
      getStatusForService: getStatusForService,
      getResourceGroups: getResourceGroups,
      getClustersForResourceGroup: getClustersForResourceGroup,
      getUnassignedClusters: getUnassignedClusters,
      setClusterAllowListInfoForExpressway: setClusterAllowListInfoForExpressway,
      getConnector: getConnector,
      getHost: getHost,
      updateHost: updateHost,
    };

    return service;

    ////////////////

    function get(clusterId, orgId) {
      return $http
        .get(UrlConfig.getHerculesUrlV2() + '/organizations/' + (orgId || Authinfo.getOrgId()) + '/clusters/' + clusterId + '?fields=@wide')
        .then(extractData)
        .then(function (cluster) {
          var clusters = addExtendedStateToConnectors([cluster]);
          return clusters[0];
        })
        .then(function (cluster) {
          var clusters = addServicesStatuses([cluster]);
          return clusters[0];
        });
    }

    function getAll(orgId) {
      return $http
        .get(UrlConfig.getHerculesUrlV2() + '/organizations/' + (orgId || Authinfo.getOrgId()) + '?fields=@wide')
        .then(extractClustersFromResponse)
        .then(filterUnknownClusters)
        .then(addExtendedStateToConnectors)
        .then(addServicesStatuses)
        .then(sort);
    }

    function getResourceGroups() {
      return $http
        .get(UrlConfig.getHerculesUrlV2() + '/organizations/' + Authinfo.getOrgId() + '?fields=@wide')
        .then(extractData)
        .then(function addServicesStatusesToClusters(org) {
          org.clusters = addExtendedStateToConnectors(org.clusters);
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

    function addExtendedStateToConnectors(clusters) {
      return _.map(clusters, function (cluster) {
        cluster.connectors = _.map(cluster.connectors, function (connector) {
          var extendedState = '';
          if (connector.alarms.length === 0) {
            extendedState = connector.state;
          } else {
            extendedState = _.some(connector.alarms, function (alarm) {
              return alarm.severity === 'critical' || alarm.severity === 'error';
            }) ? 'has_error_alarms' : 'has_warning_alarms';
          }
          return _.extend({}, connector, {
            state: extendedState, // hack the node view
            extendedState: extendedState,
          });
        });
        return cluster;
      });
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

    function deregisterCluster(clusterId) {
      var url = UrlConfig.getHerculesUrlV2() + '/organizations/' + Authinfo.getOrgId() + '/actions/deregisterCluster/invoke?clusterId=' + clusterId;
      return $http.post(url)
        .then(extractData);
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
      var connectorType = HybridServicesUtilsService.serviceId2ConnectorType(serviceId);
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
      return HybridServicesExtrasService.getPreregisteredClusterAllowList()
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

    function deregisterEcpNode(connectorId) {
      var url = UrlConfig.getHerculesUrlV2() + '/organizations/' + Authinfo.getOrgId() + '/actions/deregister/invoke?managementConnectorId=' + connectorId;
      return $http.post(url)
        .then(extractData);
    }

  }
})();
