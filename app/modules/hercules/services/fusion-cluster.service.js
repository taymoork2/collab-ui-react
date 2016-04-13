(function () {
  'use strict';

  // This service should obsolete ClusterService during 2016

  angular
    .module('Hercules')
    .factory('FusionClusterService', FusionClusterService);

  /* @ngInject */
  function FusionClusterService($http, UrlConfig, Authinfo, FusionClusterStatesService) {
    var service = {
      getAll: getAll
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
        .then(addServicesStatuses);
    }

    function extractClustersFromResponse(response) {
      return response.data.clusters;
    }

    function onlyKeepFusedClusters(clusters) {
      return _.filter(clusters, 'state', 'fused');
    }

    function addServicesStatuses(clusters) {
      return _.map(clusters, function (cluster) {
        var mgmtConnectors = _.filter(cluster.connectors, 'connectorType', 'c_mgmt');
        var ucmcConnectors = _.filter(cluster.connectors, 'connectorType', 'c_ucmc');
        var calConnectors = _.filter(cluster.connectors, 'connectorType', 'c_cal');
        cluster.servicesStatuses = [{
          connectorType: 'c_mgmt',
          state: FusionClusterStatesService.getMergedStateSeverity(mgmtConnectors),
          total: mgmtConnectors.length
        }, {
          connectorType: 'c_ucmc',
          state: FusionClusterStatesService.getMergedStateSeverity(ucmcConnectors),
          total: ucmcConnectors.length
        }, {
          connectorType: 'c_cal',
          state: FusionClusterStatesService.getMergedStateSeverity(calConnectors),
          total: calConnectors.length
        }];
        return cluster;
      });
    }
  }
})();
