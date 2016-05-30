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
  }
})();
