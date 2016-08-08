(function () {
  'use strict';

  /* @ngInject */
  function MediaClusterServiceV2($http, CsdmPoller, CsdmCacheUpdater, CsdmHubFactory, UrlConfig, Authinfo, MediaConfigServiceV2) {
    var clusterCache = {
      mf_mgmt: {}
    };

    function extractDataFromResponse(res) {
      return res.data;
    }

    function extractClustersFromResponse(response) {
      return extractDataFromResponse(response).clusters;
    }

    var fetch = function () {
      return $http
        .get(UrlConfig.getHerculesUrlV2() + '/organizations/' + Authinfo.getOrgId() + '?fields=@wide')
        .then(extractClustersFromResponse)
        .then(function (clusters) {
          // start modeling the response to match how the UI uses it
          var onlyMfMgmt = _.filter(clusters, 'targetType', 'mf_mgmt');
          return {
            mf_mgmt: onlyMfMgmt
          };
        })
        .then(function (clusters) {
          var result = {
            mf_mgmt: addAggregatedData('mf_mgmt', clusters.mf_mgmt)
          };
          return result;
        })
        .then(function (clusters) {
          var result = {
            mf_mgmt: _.indexBy(clusters.mf_mgmt, 'id')
          };
          return result;
        })
        .then(function (clusters) {
          CsdmCacheUpdater.update(clusterCache.mf_mgmt, clusters.mf_mgmt);
          return clusterCache;
        });
    };

    function overrideStateIfAlarms(connector) {
      if (connector.alarms.length > 0) {
        connector.state = 'has_alarms';
      }
      return connector;
    }

    function getRunningStateSeverity(state) {
      // we give a severity and a weight to all possible states
      // this has to be synced with the server generating the API consumed
      // by the general overview page (state of Call connectors, etc.)
      var label, value;
      switch (state) {
        case 'running':
          label = 'ok';
          value = 0;
          break;
        case 'not_installed':
          label = 'neutral';
          value = 1;
          break;
        case 'disabled':
        case 'downloading':
        case 'installing':
        case 'not_configured':
        case 'uninstalling':
        case 'registered':
        case 'initializing':
          label = 'warning';
          value = 2;
          break;
        case 'has_alarms':
        case 'offline':
        case 'stopped':
        case 'not_operational':
        case 'unknown':
        default:
          label = 'error';
          value = 3;
      }

      return {
        label: label,
        value: value
      };
    }

    function getMostSevereRunningState(previous, connector) {
      var stateSeverity = getRunningStateSeverity(connector.state);
      if (stateSeverity.value > previous.stateSeverityValue) {
        return {
          state: connector.state,
          stateSeverity: stateSeverity.label,
          stateSeverityValue: stateSeverity.value
        };
      } else {
        return previous;
      }
    }

    function mergeAllAlarms(connectors) {
      return _.reduce(connectors, function (acc, connector) {
        return acc.concat(connector.alarms);
      }, []);
    }

    function getUpgradeState(connectors) {
      var allAreUpgraded = _.every(connectors, 'upgradeState', 'upgraded');
      return allAreUpgraded ? 'upgraded' : 'upgrading';
    }

    function mergeRunningState(connectors) {
      if (connectors.length == 0) {
        return {
          state: 'no_hosts'
        };
      }
      return _.chain(connectors)
        .map(overrideStateIfAlarms)
        .reduce(getMostSevereRunningState, {
          stateSeverityValue: -1
        })
        // .get('state')
        .value();
    }

    function buildAggregates(type, cluster) {
      var connectors = cluster.connectors;
      var provisioning = _.find(cluster.provisioning, 'connectorType', type);
      var upgradeAvailable = provisioning && _.some(cluster.connectors, function (connector) {
        return connector.runningVersion !== provisioning.availableVersion;
      });
      var hosts = _.chain(connectors)
        .pluck('hostname')
        .uniq()
        .value();
      return {
        alarms: mergeAllAlarms(connectors),
        state: mergeRunningState(connectors).state,
        upgradeState: getUpgradeState(connectors),
        provisioning: provisioning,
        upgradeAvailable: upgradeAvailable,
        upgradePossible: upgradeAvailable && !_.any(cluster.connectors, 'state', 'not_configured'),
        hosts: _.map(hosts, function (host) {
          // 1 host = 1 connector (for a given type)
          var connector = _.find(connectors, 'hostname', host);
          return {
            alarms: connector.alarms,
            hostname: host,
            state: connector.state,
            upgradeState: connector.upgradeState
          };
        })
      };
    }

    function addAggregatedData(type, clusters) {
      // We add aggregated data like alarms, states and versions to the cluster
      return _.map(clusters, function (cluster) {
        cluster.aggregates = buildAggregates(type, cluster);
        return cluster;
      });
    }

    var getClusters = function () {
      return clusterCache['mf_mgmt'];
    };

    var getOrganization = function (callback) {
      var url = UrlConfig.getAdminServiceUrl() + 'organizations/' + Authinfo.getOrgId();

      $http.get(url)
        .success(function (data, status) {
          data = data || {};
          data.success = true;
          callback(data, status);
        })
        .error(function (data, status) {
          if (!data || !(data instanceof Object)) {
            data = {};
          }
          data.success = false;
          data.status = status;
          callback(data, status);
        });

      //return $http.get(url).then(extractDataFromResponse);
    };

    var getClustersV2 = function () {
      var url = MediaConfigServiceV2.getV2Url() + '/organizations/' + Authinfo.getOrgId() + '?fields=@wide';

      return $http.get(url).then(extractDataFromResponse);
    };

    var createClusterV2 = function (clusterName, releaseChannel) {
      var payLoad = {
        "name": clusterName,
        "releaseChannel": releaseChannel,
        "targetType": "mf_mgmt"
      };

      var url = MediaConfigServiceV2.getV2Url() + '/organizations/' + Authinfo.getOrgId() + '/clusters';
      return $http
        .post(url, payLoad);
    };

    var addRedirectTarget = function (hostName, clusterId) {
      var payLoad = {
        "hostname": hostName,
        "clusterId": clusterId,
        ttlInSeconds: 60 * 60
      };

      var url = MediaConfigServiceV2.getUrl() + '/organizations/' + Authinfo.getOrgId() + '/allowedRedirectTargets';
      return $http
        .post(url, payLoad);
    };

    function get(clusterId) {
      return $http
        .get(UrlConfig.getHerculesUrlV2() + '/organizations/' + Authinfo.getOrgId() + '/clusters/' + clusterId + '?fields=@wide')
        .then(extractDataFromResponse);
    }

    function getAll() {
      return $http
        .get(UrlConfig.getHerculesUrlV2() + '/organizations/' + Authinfo.getOrgId() + '?fields=@wide')
        .then(extractClustersFromResponse)
        // .then(onlyKeepFusedClusters)
        //.then(addServicesStatuses)
        .then(sort);
    }

    function sort(clusters) {
      // Could be anything but at least make it consistent between 2 page refresh
      return _.sortBy(clusters, 'type');
    }

    function deleteV2Cluster(clusterId) {
      var url = UrlConfig.getHerculesUrlV2() + '/organizations/' + Authinfo.getOrgId() + '/clusters/' + clusterId;
      return $http.delete(url);
    }

    function updateV2Cluster(clusterId, clusterName, releaseChannel) {
      var payLoad = {
        "name": clusterName,
        "releaseChannel": releaseChannel
      };

      var url = UrlConfig.getHerculesUrlV2() + '/organizations/' + Authinfo.getOrgId() + '/clusters/' + clusterId;
      return $http
        .patch(url, payLoad);
    }

    function moveV2Host(connectorId, fromCluster, toCluster) {
      //var url = UrlConfig.getHerculesUrlV2() + '/organizations/' + Authinfo.getOrgId() + '/actions/moveNodeByManagementConnectorId/invoke';
      var url = UrlConfig.getHerculesUrlV2() + '/organizations/' + Authinfo.getOrgId() + '/actions/moveNodeByManagementConnectorId/invoke?managementConnectorId=' + connectorId + '&fromClusterId=' + fromCluster + '&toClusterId=' + toCluster;
      return $http
        .post(url);
    }

    function defuseV2Connector(connectorId) {
      var url = UrlConfig.getHerculesUrlV2() + '/organizations/' + Authinfo.getOrgId() + '/actions/deregister/invoke?managementConnectorId=' + connectorId;
      return $http.post(url);
    }

    function getClustersByConnectorType(type) {
      return _.values(clusterCache[type]);
    }

    var hub = CsdmHubFactory.create();
    CsdmPoller.create(fetch, hub);

    return {
      fetch: fetch,
      getClusters: getClusters,
      subscribe: hub.on,
      getOrganization: getOrganization,
      getClustersV2: getClustersV2,
      createClusterV2: createClusterV2,
      addRedirectTarget: addRedirectTarget,
      get: get,
      getAll: getAll,
      deleteV2Cluster: deleteV2Cluster,
      updateV2Cluster: updateV2Cluster,
      defuseV2Connector: defuseV2Connector,
      moveV2Host: moveV2Host,
      getClustersByConnectorType: getClustersByConnectorType,
      getRunningStateSeverity: getRunningStateSeverity,
      mergeAllAlarms: mergeAllAlarms,
      getMostSevereRunningState: getMostSevereRunningState,
      buildAggregates: buildAggregates
    };
  }

  angular
    .module('Mediafusion')
    .service('MediaClusterServiceV2', MediaClusterServiceV2);

}());
