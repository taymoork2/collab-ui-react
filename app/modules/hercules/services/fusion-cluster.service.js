(function () {
  'use strict';

  // This service should obsolete ClusterService during 2016

  angular
    .module('Hercules')
    .factory('FusionClusterService', FusionClusterService);

  /* @ngInject */
  function FusionClusterService($http, UrlConfig, Authinfo, FusionClusterStatesService) {
    var service = {
      preregisterCluster: preregisterCluster,
      addPreregisteredClusterToAllowList: addPreregisteredClusterToAllowList,
      provisionConnector: provisionConnector,
      deprovisionConnector: deprovisionConnector,
      getAllProvisionedConnectorTypes: getAllProvisionedConnectorTypes,
      getAll: getAll,
      get: get,
      buildSidepanelConnectorList: buildSidepanelConnectorList,
      getUpgradeSchedule: getUpgradeSchedule,
      setUpgradeSchedule: setUpgradeSchedule,
      postponeUpgradeSchedule: postponeUpgradeSchedule,
      deleteMoratoria: deleteMoratoria,
      setClusterName: setClusterName,
      deregisterCluster: deregisterCluster,
      getReleaseNotes: getReleaseNotes
    };

    return service;

    ////////////////

    // TODO: maybe cache data for the cluster list and
    // poll new data every 30 seconds

    function get(clusterId) {
      return $http
        .get(UrlConfig.getHerculesUrlV2() + '/organizations/' + Authinfo.getOrgId() + '/clusters/' + clusterId + '?fields=@wide')
        .then(extractDataFromResponse);
    }

    function getAll() {
      return $http
        .get(UrlConfig.getHerculesUrlV2() + '/organizations/' + Authinfo.getOrgId() + '?fields=@wide')
        .then(extractClustersFromResponse)
        .then(onlyKeepFusedClusters)
        .then(addServicesStatuses)
        .then(sort);
    }

    function getUpgradeSchedule(id) {
      var orgId = Authinfo.getOrgId();
      return $http.get(UrlConfig.getHerculesUrlV2() + '/organizations/' + orgId + '/clusters/' + id + '/upgradeSchedule')
        .then(extractData)
        .then(function (upgradeSchedule) {
          return $http.get(UrlConfig.getHerculesUrlV2() + '/organizations/' + orgId + '/clusters/' + id + '/upgradeSchedule/moratoria')
            .then(extractData)
            .then(function (moratoria) {
              upgradeSchedule.moratoria = moratoria;
              return upgradeSchedule;
            });
        })
        .then(function (upgradeSchedule) {
          return $http.get(UrlConfig.getHerculesUrlV2() + '/organizations/' + orgId + '/clusters/' + id + '/upgradeSchedule/nextUpgradeWindow')
            .then(extractData)
            .then(function (nextUpgradeWindow) {
              upgradeSchedule.nextUpgradeWindow = nextUpgradeWindow;
              return upgradeSchedule;
            });
        });
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

    function onlyKeepFusedClusters(clusters) {
      return _.filter(clusters, function (cluster) {
        return cluster.state ? cluster.state === 'fused' : true;
      });
    }

    function extractDataFromResponse(res) {
      return res.data;
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
          "name": name,
          "releaseChannel": releaseChannel,
          "targetType": managementConnectorType
        }).then(extractDataFromResponse)
        .then(function (data) {
          return data.id;
        });
    }

    function addPreregisteredClusterToAllowList(hostname, ttlInSeconds, clusterId) {
      var url = UrlConfig.getHerculesUrl() + '/organizations/' + Authinfo.getOrgId() + '/allowedRedirectTargets';
      return $http.post(url, {
        "hostname": hostname,
        "ttlInSeconds": ttlInSeconds,
        "clusterId": clusterId
      });
    }

    function provisionConnector(clusterId, connectorType) {
      var url = UrlConfig.getHerculesUrlV2() + "/organizations/" + Authinfo.getOrgId() + "/clusters/" + clusterId +
        "/provisioning/actions/add/invoke?connectorType=" + connectorType;
      return $http.post(url);
    }

    function deprovisionConnector(clusterId, connectorType) {
      var url = UrlConfig.getHerculesUrlV2() + "/organizations/" + Authinfo.getOrgId() + "/clusters/" + clusterId +
        "/provisioning/actions/remove/invoke?connectorType=" + connectorType;
      return $http.post(url);
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
      });
    }

    function deregisterCluster(clusterId) {
      var url = UrlConfig.getHerculesUrlV2() + '/organizations/' + Authinfo.getOrgId() + '/actions/deregisterCluster/invoke?clusterId=' + clusterId;
      return $http.post(url);
    }

    function getReleaseNotes(releaseChannel, connectorType) {
      var url = UrlConfig.getHerculesUrlV2() + '/organizations/' + Authinfo.getOrgId() + '/channels/' + releaseChannel + '/packages/' + connectorType + '?fields=@wide';
      return $http.get(url)
        .then(extractDataFromResponse)
        .then(function (data) {
          return data.releaseNotes;
        });
    }

  }
})();
