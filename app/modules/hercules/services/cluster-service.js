(function () {
  'use strict';

  angular
    .module('Hercules')
    .service('ClusterService', ClusterService);

  /* @ngInject */
  function ClusterService($http, CsdmPoller, CsdmCacheUpdater, CsdmHubFactory, ConfigService, Authinfo) {
    var clusterCache = {};

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

    function replaceByFakeClusters(clusters) {
      return [{
        "id": "cluster_A",
        "name": "1 of each cluster",
        "releaseChannel": "GA",
        "url": "…",
        "provisioning": [{
          "url": "…",
          "connectorType": "c_mgmt",
          "provisionedVersion": "1.0-1.0",
          "availableVersion": "2.0-1.0"
        }, {
          "url": "…",
          "connectorType": "c_ucmc",
          "provisionedVersion": "1.0-1.0",
          "availableVersion": "1.0-1.0"
        }, {
          "url": "…",
          "connectorType": "c_cal",
          "provisionedVersion": "1.0-1.0",
          "availableVersion": "1.0-1.0"
        }],
        "connectors": [{
          "alarms": [],
          "connectorType": "c_cal",
          "hostname": "host0.example.com",
          "hostSerial": "DEADBEEF",
          "id": "c_cal@0",
          "packageUrl": "http://localhost:9393/hercules/api/v2/channels/GA/packages/c_cal",
          "runningVersion": "1.0",
          "state": "running",
          "upgradeState": "upgrading",
          "url": "…"
        }, {
          "alarms": [],
          "connectorType": "c_mgmt",
          "hostname": "host0.example.com",
          "hostSerial": "DEADBEEF",
          "id": "c_mgmt@0",
          "packageUrl": "http://localhost:9393/hercules/api/v2/channels/GA/packages/c_mgmt",
          "runningVersion": "1.0",
          "state": "running",
          "upgradeState": "upgraded",
          "url": "…"
        }, {
          "alarms": [],
          "connectorType": "c_ucmc",
          "hostname": "host0.example.com",
          "hostSerial": "DEADBEEF",
          "id": "c_ucmc@0",
          "packageUrl": "http://localhost:9393/hercules/api/v2/channels/GA/packages/c_ucmc",
          "runningVersion": "1.0",
          "state": "running",
          "upgradeState": "upgraded",
          "url": "…"
        }]
      }, {
        "id": 'cluster_B',
        "name": "Only mgmt cluster",
        "releaseChannel": "GA",
        "url": "…",
        "provisioning": [{
          "url": "…",
          "connectorType": "c_mgmt",
          "provisionedVersion": "1.0-1.0",
          "availableVersion": "1.0-1.0"
        }],
        "connectors": [{
          "alarms": [],
          "connectorType": "c_mgmt",
          "hostname": "host0.example.com",
          "hostSerial": "DEADBEEF",
          "id": "c_mgmt@0",
          "packageUrl": "http://localhost:9393/hercules/api/v2/channels/GA/packages/c_mgmt",
          "runningVersion": "1.0",
          "state": "running",
          "upgradeState": callCount === 1 ? "upgrading" : "upgraded",
          "url": "…"
        }, {
          "alarms": [],
          "connectorType": "c_mgmt",
          "hostname": "host1.example.com",
          "hostSerial": "DEADBEEF",
          "id": "c_mgmt@1",
          "packageUrl": "http://localhost:9393/hercules/api/v2/channels/GA/packages/c_mgmt",
          "runningVersion": "1.0",
          "state": "running",
          "upgradeState": callCount === 1 ? "pending" : (callCount === 2 ? "upgrading" : "upgraded"),
          "url": "…"
        }, {
          "alarms": [],
          "connectorType": "c_mgmt",
          "hostname": "host42.example.com",
          "hostSerial": "DEADBEEF",
          "id": "c_mgmt@1",
          "packageUrl": "http://localhost:9393/hercules/api/v2/channels/GA/packages/c_mgmt",
          "runningVersion": "1.0",
          "state": "running",
          "upgradeState": callCount < 3 ? "pending" : (callCount === 3 ? "upgrading" : "upgraded"),
          "url": "…"
        }]
      }, {
        "id": 'cluster_C',
        "name": "Many calendar hosts cluster",
        "releaseChannel": "GA",
        "url": "…",
        "provisioning": [{
          "url": "…",
          "connectorType": "c_mgmt",
          "provisionedVersion": "1.0-1.0",
          "availableVersion": "1.0-1.0"
        }, {
          "url": "…",
          "connectorType": "c_ucmc",
          "provisionedVersion": "1.0-1.0",
          "availableVersion": "1.0-1.0"
        }, {
          "url": "…",
          "connectorType": "c_cal",
          "provisionedVersion": "1.0-1.0",
          "availableVersion": "1.0-1.0"
        }],
        "connectors": [{
          "alarms": [{
            "id": "789",
            "firstReported": "2016-01-11T15:38:06.670Z",
            "lastReported": "2016-01-21T15:38:06.670Z",
            "severity": "warning",
            "title": "Lorem ipsum",
            "description": "Lorem ipsum dolor sit amet"
          }],
          "connectorType": "c_mgmt",
          "hostname": "host0.example.com",
          "hostSerial": "DEADBEEF",
          "id": "c_mgmt@0",
          "packageUrl": "http://localhost:9393/hercules/api/v2/channels/GA/packages/c_mgmt",
          "runningVersion": "1.0",
          "state": "running",
          "upgradeState": "upgraded",
          "url": "…"
        }, {
          "alarms": [],
          "connectorType": "c_cal",
          "hostname": "host0.example.com",
          "hostSerial": "DEADBEEF",
          "id": "c_cal@0",
          "packageUrl": "http://localhost:9393/hercules/api/v2/channels/GA/packages/c_cal",
          "runningVersion": "1.0",
          "state": "running",
          "upgradeState": "upgraded",
          "url": "…"
        }, {
          "alarms": [],
          "connectorType": "c_ucmc",
          "hostname": "host0.example.com",
          "hostSerial": "DEADBEEF",
          "id": "c_ucmc@0",
          "packageUrl": "http://localhost:9393/hercules/api/v2/channels/GA/packages/c_ucmc",
          "runningVersion": "1.0",
          "state": "running",
          "upgradeState": "upgraded",
          "url": "…"
        }, {
          "alarms": [],
          "connectorType": "c_mgmt",
          "hostname": "host1.example.com",
          "hostSerial": "DEADBEEF",
          "id": "c_mgmt@1",
          "packageUrl": "http://localhost:9393/hercules/api/v2/channels/GA/packages/c_mgmt",
          "runningVersion": "1.0",
          "state": "running",
          "upgradeState": "upgraded",
          "url": "…"
        }, {
          "alarms": [],
          "connectorType": "c_cal",
          "hostname": "host1.example.com",
          "hostSerial": "DEADBEEF",
          "id": "c_cal@1",
          "packageUrl": "http://localhost:9393/hercules/api/v2/channels/GA/packages/c_cal",
          "runningVersion": "1.0",
          "state": "running",
          "upgradeState": "upgraded",
          "url": "…"
        }, {
          "alarms": [{
            "id": "789",
            "firstReported": "2016-01-11T15:38:06.670Z",
            "lastReported": "2016-01-21T15:38:06.670Z",
            "severity": "warning",
            "title": "Lorem ipsum",
            "description": "Lorem ipsum dolor sit amet"
          }],
          "connectorType": "c_ucmc",
          "hostname": "host1.example.com",
          "hostSerial": "DEADBEEF",
          "id": "c_ucmc@1",
          "packageUrl": "http://localhost:9393/hercules/api/v2/channels/GA/packages/c_ucmc",
          "runningVersion": "1.0",
          "state": "running",
          "upgradeState": "upgraded",
          "url": "…"
        }]
      }, {
        "id": 'cluster_D',
        "name": "Who are you?",
        "releaseChannel": "GA",
        "url": "…",
        "provisioning": [{
          "url": "…",
          "connectorType": "c_mgmt",
          "provisionedVersion": "1.0-1.0",
          "availableVersion": "1.0-1.0"
        }, {
          "url": "…",
          "connectorType": "c_cal",
          "provisionedVersion": "1.0-1.0",
          "availableVersion": "1.0-1.0"
        }],
        "connectors": [{
          "alarms": [],
          "connectorType": "c_mgmt",
          "hostname": "host0.example.com",
          "hostSerial": "DEADBEEF",
          "id": "c_mgmt@0",
          "packageUrl": "http://localhost:9393/hercules/api/v2/channels/GA/packages/c_mgmt",
          "runningVersion": "1.0",
          "state": "not_configured",
          "upgradeState": "upgraded",
          "url": "…"
        }, {
          "alarms": [],
          "connectorType": "c_cal",
          "hostname": "host0.example.com",
          "hostSerial": "DEADBEEF",
          "id": "c_cal@0",
          "packageUrl": "http://localhost:9393/hercules/api/v2/channels/GA/packages/c_cal",
          "runningVersion": "1.0",
          "state": "running",
          "upgradeState": "upgraded",
          "url": "…"
        }]
      }];
    }

    var callCount = 0;
    var fetch = function () {
      callCount++;
      return $http
        .get(ConfigService.getUrl() + '/organizations/' + Authinfo.getOrgId())
        .then(extractDataFromResponse)
        .then(function () {
          return replaceByFakeClusters();
        })
        .then(function (clusters) {
          return addAggregatedData(clusters);
        })
        .then(function (clusters) {
          return addRunningStateToConnectors(clusters);
        })
        .then(function (clusters) {
          return _.indexBy(clusters, 'id');
        })
        .then(_.partial(CsdmCacheUpdater.update, clusterCache));
    };

    var getClustersById = function (id) {
      return clusterCache[id];
    };

    var getClustersByConnectorType = function (connectorType) {
      return _.filter(clusterCache, function (cluster) {
        return _.some(cluster.connectors, function (connector) {
          return connector.connectorType === connectorType;
        });
      });
    };

    var upgradeSoftware = function (clusterId, serviceType) {
      var url = ConfigService.getUrl() + '/organizations/' + Authinfo.getOrgId() + '/clusters/' + clusterId + '/services/' + serviceType + '/upgrade';
      return $http.post(url, '{}')
        .then(extractDataFromResponse)
        .then(function () {
          poller.forceAction();
        });
    };

    var deleteCluster = function (clusterId) {
      var url = ConfigService.getUrl() + '/organizations/' + Authinfo.getOrgId() + '/clusters/' + clusterId;
      return $http.delete(url)
        .then(function () {
          if (clusterCache[clusterId]) {
            delete clusterCache[clusterId];
          }
          poller.forceAction();
        });
    };

    var deleteHost = function (clusterId, serial) {
      var url = ConfigService.getUrl() + '/organizations/' + Authinfo.getOrgId() + '/clusters/' + clusterId + '/hosts/' + serial;
      return $http.delete(url)
        .then(function () {
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
        });
    };

    var getConnector = function (connectorId) {
      var url = ConfigService.getUrl() + '/organizations/' + Authinfo.getOrgId() + '/connectors/' + connectorId;
      return $http.get(url).then(extractDataFromResponse);
    };

    var hub = CsdmHubFactory.create();
    var poller = CsdmPoller.create(fetch, hub, {
      delay: 3000
    });

    return {
      fetch: fetch,
      deleteHost: deleteHost,
      getClustersById: getClustersById,
      getClustersByConnectorType: getClustersByConnectorType,
      getConnector: getConnector,
      upgradeSoftware: upgradeSoftware,
      deleteCluster: deleteCluster,
      subscribe: hub.on
    };
  }
}());
