(function () {
  'use strict';

  /* @ngInject */
  function ClusterService($q, $http, $location, CsdmPoller, CsdmCacheUpdater, ConnectorMock, ConverterService, ConfigService, Authinfo, CsdmHubFactory) {
    var clusterCache = {};

    function extractDataFromResponse(res) {
      return res.data;
    }

    var fetch = function () {
      if ($location.absUrl().match(/hercules-backend=mock/)) {
        var data = ConverterService.convertClusters(ConnectorMock.mockData());
        var defer = $q.defer();
        defer.resolve(data);
        CsdmCacheUpdater.update(clusterCache, data);
        return defer.promise;
      }

      if ($location.absUrl().match(/hercules-backend=nodata/)) {
        var defer2 = $q.defer();
        defer2.resolve([]);
        return defer2.promise;
      }

      return $http
        .get(ConfigService.getUrl() + '/organizations/' + Authinfo.getOrgId() + '/clusters')
        .then(extractDataFromResponse)
        .then(ConverterService.convertClusters)
        .then(_.partial(CsdmCacheUpdater.update, clusterCache));
    };

    var getClusters = function () {
      return clusterCache;
    };

    var getExpresswayClusters = function () {
      return _.filter(clusterCache, {
        cluster_type: 'c_mgmt'
      });
    };

    var setProperty = function (clusterId, property, value) {
      var url = ConfigService.getUrl() + '/organizations/' + Authinfo.getOrgId() + '/clusters/' + clusterId + '/properties';
      var payload = {};
      payload[property] = value;
      return $http.post(url, payload);
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
      setProperty: setProperty,
      subscribe: hub.on,
      getExpresswayClusters: getExpresswayClusters
    };
  }

  angular
    .module('Hercules')
    .service('ClusterService', ClusterService);

}());
