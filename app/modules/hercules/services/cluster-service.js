(function () {
  'use strict';

  angular
    .module('Hercules')
    .service('ClusterService', ClusterService);

  /* @ngInject */
  function ClusterService($q, $http, $location, CsdmPoller, CsdmCacheUpdater, ConnectorMock, ConfigService, Authinfo, CsdmHubFactory) {
    var clusterCache = {};

    function extractDataFromResponse(res) {
      return res.data;
    }

    function overrideStateIfAlarms(connector) {
      // the alarms property is not present if there are no alarms
      // otherwise it's an array
      if (connector.alarms) {
        // we override the state with 'has_alarm'
        connector.state = 'has_alarm';
      }
      return connector;
    }

    function getMostSevereRunningState(result, connector) {
      // we give a severity and a weight to all possible states
      // feel free to update this table of severity
      // there is none official
      var stateSeverity;
      var stateSeverityValue;
      switch (connector.state) {
        case 'running':
          stateSeverity = 'ok';
          stateSeverityValue = 0;
          break;
        case 'disabled':
        case 'downloading':
        case 'installing':
        case 'not_configured':
        case 'not_installed':
        case 'offline':
        case 'stopped':
        case 'uninstalling':
          stateSeverity = 'warning';
          stateSeverityValue = 2;
          break;
        case 'has_alarm':
          stateSeverity = 'error';
          stateSeverityValue = 3;
          break;
        case 'registered':
        case 'unknown':
          stateSeverity = 'unknown';
          stateSeverityValue = 1;
          break;
        default:
          throw new Error('Unexpected connector state: ' + connector.state);
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

    function aggregateStatePerConnectorType(connectors) {
      return _.chain(connectors)
        .groupBy('connectorType')
        .mapValues(function (connectorsWithTheSameType) {
          var reducedRunningState = _.chain(connectorsWithTheSameType)
            .map(overrideStateIfAlarms)
            .reduce(getMostSevereRunningState, {
              stateSeverityValue: -1
            })
            .value();
          var allUpgraded = _.every(connectorsWithTheSameType, {
            upgradeState: 'upgraded'
          });
          return {
            runningState: reducedRunningState.state,
            runningStateSeverity: reducedRunningState.stateSeverity,
            upgradeState: allUpgraded ? 'upgraded' : 'upgrading'
          };
        })
        .value();
    }

    function aggregateStatePerHosts(connectors) {
      var hosts = _.chain(connectors)
        .pluck('hostname')
        .uniq()
        .value();
      return hosts;
    }

    var addAggregatedData = function (clusters) {
      return _.map(clusters, function (cluster) {
        var result = cluster;
        result.aggregated = {
          services: aggregateStatePerConnectorType(cluster.connectors),
          hosts: aggregateStatePerHosts(cluster.connectors)
        };
        return result;
      });
    };

    var replaceByFakeClusters = function (clusters) {
      return [
        {
          "id": "cluster_A",
          "name": "1 of each cluster",
          "connectors": [
            {
              "hostname": "host0.example.com",
              "id": "c_cal@A0",
              "provisionedVersion": "1.0",
              "runningVersion": "1.0",
              "state": "stopped",
              "connectorType": "c_cal",
              "upgradeState": "upgraded"
            },
            {
              "hostname": "host0.example.com",
              "id": "c_mgmt@A1",
              "provisionedVersion": "1.0",
              "runningVersion": "1.0",
              "state": "running",
              "connectorType": "c_mgmt",
              "upgradeState": "upgraded"
            },
            {
              "hostname": "host0.example.com",
              "id": "c_ucmc@A2",
              "provisionedVersion": "1.0",
              "runningVersion": "1.0",
              "state": "running",
              "connectorType": "c_ucmc",
              "upgradeState": "upgrading"
            }
          ]
        },
        {
          "id": _.uniqueId('cluster_'),
          "connectors": [
            {
              "hostname": "host1.example.com",
              "id": "c_mgmt@UC0",
              "provisionedVersion": "1.0",
              "runningVersion": "1.0",
              "state": "not_configured",
              "connectorType": "c_mgmt",
              "upgradeState": "upgraded"
            }
          ],
          "name": "Only mgmt cluster"
        },
        {
          "id": _.uniqueId('cluster_'),
          "connectors": [
            {
              "hostname": "hostA.example.com",
              "id": "c_cal@UCA0",
              "provisionedVersion": "1.0",
              "runningVersion": "1.0",
              "state": "running",
              "connectorType": "c_cal",
              "upgradeState": "upgraded"
            },
            {
              "hostname": "hostA.example.com",
              "id": "c_mgmt@UCA1",
              "provisionedVersion": "1.0",
              "runningVersion": "1.0",
              "state": "running",
              "connectorType": "c_mgmt",
              "upgradeState": "upgraded"
            },
            {
              "hostname": "hostA.example.com",
              "id": "c_ucmc@UCA2",
              "provisionedVersion": "1.0",
              "runningVersion": "1.0",
              "state": "running",
              "connectorType": "c_ucmc",
              "upgradeState": "upgraded"
            },
            {
              "hostname": "hostB.example.com",
              "id": "c_cal@UCB0",
              "provisionedVersion": "1.0",
              "runningVersion": "1.0",
              "state": "stopped",
              "connectorType": "c_cal",
              "upgradeState": "upgraded"
            },
            {
              "hostname": "hostB.example.com",
              "id": "c_mgmt@UCB1",
              "provisionedVersion": "1.0",
              "runningVersion": "1.0",
              "state": "stopped",
              "connectorType": "c_mgmt",
              "upgradeState": "upgraded"
            },
            {
              "alarms": [],
              "hostname": "hostC.example.com",
              "id": "c_cal@UCC0",
              "provisionedVersion": "1.0",
              "runningVersion": "1.0",
              "state": "running",
              "connectorType": "c_cal",
              "upgradeState": "upgraded"
            },
            {
              "alarms": [],
              "hostname": "hostC.example.com",
              "id": "c_mgmt@UCC1",
              "provisionedVersion": "1.0",
              "runningVersion": "1.0",
              "state": "running",
              "connectorType": "c_mgmt",
              "upgradeState": "upgraded"
            }
          ],
          "name": "Many calendar hosts cluster"
        },
        {
          "id": _.uniqueId('cluster_'),
          "connectors": [
            {
              "hostname": "hostD0.example.com",
              "id": "c_ucmc@A1",
              "provisionedVersion": "1.0",
              "runningVersion": "1.0",
              "state": "running",
              "connectorType": "c_ucmc",
              "upgradeState": "upgraded"
            },
            {
              "hostname": "hostD0.example.com",
              "id": "c_mgmt@A2",
              "provisionedVersion": "1.0",
              "runningVersion": "1.0",
              "state": "running",
              "connectorType": "c_mgmt",
              "upgradeState": "upgrading"
            }
          ],
          "name": "Who are you?"
        }
      ];
    };

    var fetch = function () {
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
          return _.indexBy(clusters, 'id');
        })
        .then(_.partial(CsdmCacheUpdater.update, clusterCache));
    };

    var getClusters = function () {
      return clusterCache;
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
      return $http
        .post(url, '{}')
        .then(extractDataFromResponse);
    };

    var deleteCluster = function (clusterId) {
      var url = ConfigService.getUrl() + '/organizations/' + Authinfo.getOrgId() + '/clusters/' + clusterId;
      return $http.delete(url).then(function () {
        if (clusterCache[clusterId]) {
          delete clusterCache[clusterId];
        }
      });
    };

    var deleteHost = function (clusterId, serial) {
      var url = ConfigService.getUrl() + '/organizations/' + Authinfo.getOrgId() + '/clusters/' + clusterId + '/hosts/' + serial;
      return $http.delete(url).then(function () {
        var cluster = clusterCache[clusterId];
        if (cluster && cluster.hosts) {
          _.remove(cluster.hosts, {
            serial: serial
          });
          if (cluster.hosts.length === 0) {
            delete clusterCache[clusterId];
          }
        }
      });
    };

    var getConnector = function (connectorId) {
      var url = ConfigService.getUrl() + '/organizations/' + Authinfo.getOrgId() + '/connectors/' + connectorId;
      return $http.get(url).then(extractDataFromResponse);
    };

    var hub = CsdmHubFactory.create();
    CsdmPoller.create(fetch, hub);

    return {
      fetch: fetch,
      deleteHost: deleteHost,
      getClusters: getClusters,
      getConnector: getConnector,
      upgradeSoftware: upgradeSoftware,
      deleteCluster: deleteCluster,
      subscribe: hub.on,
      getClustersByConnectorType: getClustersByConnectorType
    };
  }
}());
