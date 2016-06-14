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
      getAllConnectorTypesForCluster: getAllConnectorTypesForCluster,
      getAll: getAll,
      findClusterInClusterList: findClusterInClusterList,
      buildSidepanelConnectorList: buildSidepanelConnectorList
    };

    return service;

    ////////////////

    // TODO: maybe cache data for the cluster list and
    // poll new data every 30 seconds

    function getAll() {
      return $http
        .get(UrlConfig.getHerculesUrlV2() + '/organizations/' + Authinfo.getOrgId() + '?fields=@wide')
        .then(extractClustersFromResponse)
        .then(onlyKeepFusedClusters)
        .then(addServicesStatuses)
        .then(sort);
    }

    function extractClustersFromResponse(response) {
      return response.data.clusters;
    }

    function onlyKeepFusedClusters(clusters) {
      return _.filter(clusters, 'state', 'fused');
    }

    function extractDataFromResponse(res) {
      return res.data;
    }

    function addServicesStatuses(clusters) {
      return _.map(clusters, function (cluster) {
        var mediaConnectors = _.filter(cluster.connectors, 'connectorType', 'mf_mgmt');
        var mgmtConnectors = _.filter(cluster.connectors, 'connectorType', 'c_mgmt');
        var ucmcConnectors = _.filter(cluster.connectors, 'connectorType', 'c_ucmc');
        var calConnectors = _.filter(cluster.connectors, 'connectorType', 'c_cal');
        if (mgmtConnectors.length > 0) {
          cluster.type = 'expressway';
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
        } else if (mediaConnectors.length > 0) {
          cluster.type = 'mediafusion';
          cluster.servicesStatuses = [{
            serviceId: 'squared-fusion-media',
            state: FusionClusterStatesService.getMergedStateSeverity(mgmtConnectors),
            total: mediaConnectors.length
          }];
        }
        return cluster;
      });
    }

    function sort(clusters) {
      // Could be anything but at least make it consistent between 2 page refresh
      return _.sortBy(clusters, 'type');
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

    function getAllConnectorTypesForCluster(clusterId) {
      var url = UrlConfig.getHerculesUrlV2() + "/organizations/" + Authinfo.getOrgId() + "/clusters/" + clusterId + "?fields=@wide";
      return $http.get(url)
        .then(function (response) {
          return _.map(response.data.provisioning, 'connectorType');
        });
    }

    function findClusterInClusterList(clusters, clusterId) {
      return _.find(clusters, function (cluster) {
        return cluster.id === clusterId;
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

  }
})();
