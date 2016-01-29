(function () {
  'use strict';

  angular
    .module('Hercules')
    .service('ClusterService', ClusterService);

  /* @ngInject */
  function ClusterService($http, CsdmPoller, CsdmCacheUpdater, CsdmHubFactory, ConfigService, Authinfo) {
    var clusterCache = {};
    var hub = CsdmHubFactory.create();
    var poller = CsdmPoller.create(fetch, hub);

    var service = {
      deleteCluster: deleteCluster,
      deleteHost: deleteHost,
      fetch: fetch,
      getClustersByConnectorType: getClustersByConnectorType,
      getClustersById: getClustersById,
      getConnector: getConnector,
      subscribe: hub.on,
      upgradeSoftware: upgradeSoftware
    };

    return service;

    ////////////////

    function extractDataFromResponse(res) {
      return res.data;
    }

    function overrideStateIfAlarms(connector) {
      if (connector.alarms.length > 0) {
        connector.state = 'has_alarms';
      }
      return connector;
    }

    function getMostSevereRunningState(result, connector) {
      // we give a severity and a weight to all possible states
      // this has to be synced with the server generating the API consumed
      // by the general overview page (state of Call connectors, etc.)
      var stateSeverity;
      var stateSeverityValue;
      switch (connector.state) {
      case 'running':
        stateSeverity = 'ok';
        stateSeverityValue = 0;
        break;
      case 'not_installed':
        stateSeverity = 'neutral';
        stateSeverityValue = 1;
        break;
      case 'disabled':
      case 'downloading':
      case 'installing':
      case 'not_configured':
      case 'uninstalling':
      case 'registered':
        stateSeverity = 'warning';
        stateSeverityValue = 2;
        break;
      case 'has_alarms':
      case 'offline':
      case 'stopped':
      case 'unknown':
      default:
        stateSeverity = 'error';
        stateSeverityValue = 3;
      }

      if (stateSeverityValue > result.stateSeverityValue) {
        return {
          state: connector.state,
          stateSeverity: stateSeverity,
          stateSeverityValue: stateSeverityValue
        };
      } else {
        return result;
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

    function getRunningState(connectors) {
      return _.chain(connectors)
        .map(overrideStateIfAlarms)
        .reduce(getMostSevereRunningState, {
          stateSeverityValue: -1
        })
        .value();
    }

    function buildAggregates(type, connectors) {
      var filteredConnectorsByType = _.filter(connectors, 'connectorType', type);
      var hostsWithThisType = _.chain(filteredConnectorsByType)
        .pluck('hostname')
        .uniq()
        .value();
      var runningState = getRunningState(filteredConnectorsByType);
      var result = {
        alarms: mergeAllAlarms(filteredConnectorsByType),
        runningState: runningState.state,
        runningStateSeverity: runningState.stateSeverity,
        upgradeState: getUpgradeState(filteredConnectorsByType),
        hosts: _.map(hostsWithThisType, function (host) {
          // 1 host = 1 connector (for a given type)
          var connector = _.filter(filteredConnectorsByType, 'hostname', host)[0];
          // re-use getRunningState to get running state severity among other things
          var runningStateForHost = getRunningState([connector]);
          return {
            hostname: host,
            alarms: connector.alarms,
            runningState: runningStateForHost.state,
            runningStateSeverity: runningStateForHost.stateSeverity,
            upgradeState: connector.upgradeState
          };
        })
      };
      return result;
    }

    function addAggregatedData(clusters) {
      // We add aggregated data like alarms, states and versions to the cluster
      // per connector type and per host + connector type
      return _.map(clusters, function (cluster) {
        var connectors = cluster.connectors;
        var connectorTypes = _.chain(connectors)
          .pluck('connectorType')
          .uniq()
          .value();
        cluster.aggregates = _.reduce(connectorTypes, function (acc, type) {
          acc[type] = buildAggregates(type, connectors);
          return acc;
        }, {});
        return cluster;
      });
    }

    function addRunningStateToConnectors(clusters) {
      // We add runningState and runningStateSeverity to connectors like we
      // did at a upper level when using addAggregatedData
      return _.map(clusters, function (cluster) {
        var connectors = _.map(cluster.connectors, function (connector) {
          var runningState = getRunningState([connector]);
          connector.runningState = connector.state;
          delete connector.state;
          connector.runningStateSeverity = runningState.stateSeverity;
          return connector;
        });
        cluster.connectors = connectors;
        return cluster;
      });
    }

    function fetch() {
      return $http
        .get(ConfigService.getUrl() + '/organizations/' + Authinfo.getOrgId() + '?fields=@wide')
        .then(extractDataFromResponse)
        .then(function (response) {
          return addAggregatedData(response.clusters);
        })
        .then(function (clusters) {
          // todo extract as a service function
          return addRunningStateToConnectors(clusters);
        })
        .then(function (clusters) {
          return _.indexBy(clusters, 'id');
        })
        .then(_.partial(CsdmCacheUpdater.update, clusterCache));
    }

    function getClustersById(id) {
      return clusterCache[id];
    }

    function getClustersByConnectorType(connectorType) {
      return _.filter(clusterCache, function (cluster) {
        return _.some(cluster.connectors, function (connector) {
          return connector.connectorType === connectorType;
        });
      });
    }

    function upgradeSoftware(clusterId, serviceType) {
      var url = ConfigService.getUrl() + '/organizations/' + Authinfo.getOrgId() + '/clusters/' + clusterId + '/services/' + serviceType + '/upgrade';
      return $http.post(url, '{}')
        .then(extractDataFromResponse)
        .then(function (data) {
          poller.forceAction();
          return data;
        });
    }

    function deleteCluster(clusterId) {
      var url = ConfigService.getUrl() + '/organizations/' + Authinfo.getOrgId() + '/clusters/' + clusterId;
      return $http.delete(url)
        .then(function (data) {
          if (clusterCache[clusterId]) {
            delete clusterCache[clusterId];
          }
          poller.forceAction();
          return data;
        });
    }

    function deleteHost(clusterId, serial) {
      var url = ConfigService.getUrl() + '/organizations/' + Authinfo.getOrgId() + '/clusters/' + clusterId + '/hosts/' + serial;
      return $http.delete(url)
        .then(function (data) {
          var cluster = clusterCache[clusterId];
          if (cluster) {
            _.remove(cluster.connectors, {
              hostSerial: serial
            });
            if (cluster.hosts.length === 0) {
              delete clusterCache[clusterId];
            }
          }
          poller.forceAction();
          return data;
        });
    }

    function getConnector(connectorId) {
      var url = ConfigService.getUrl() + '/organizations/' + Authinfo.getOrgId() + '/connectors/' + connectorId;
      return $http.get(url).then(extractDataFromResponse);
    }
  }
}());
