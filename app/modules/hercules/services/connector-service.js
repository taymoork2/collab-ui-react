(function () {
  'use strict';

  /* @ngInject */
  function ConnectorService($q, $http, $location, CsdmCacheUpdater, ConnectorMock, ConverterService, ConfigService, XhrNotificationService) {
    var lastClusterResponse = [];
    var clusterCache = {};

    function extractDataFromResponse(res) {
      return res.data;
    }

    var fetch = function () {
      if ($location.absUrl().match(/hercules-backend=mock/)) {
        var data = ConverterService.convertClusters(ConnectorMock.mockData());
        var defer = $q.defer();
        defer.resolve(data);
        return defer.promise;
      }

      if ($location.absUrl().match(/hercules-backend=nodata/)) {
        var defer2 = $q.defer();
        defer2.resolve([]);
        return defer2.promise;
      }

      return $http
        .get(ConfigService.getUrl() + '/clusters')
        .then(extractDataFromResponse)
        .then(ConverterService.convertClusters)
        .then(_.partial(CsdmCacheUpdater.update, clusterCache));
    };

    var getClusters = function () {
      return clusterCache;
    };

    var upgradeSoftware = function (clusterId, serviceType) {
      var url = ConfigService.getUrl() + '/clusters/' + clusterId + '/services/' + serviceType + '/upgrade';
      return $http
        .post(url, '{}')
        .then(extractDataFromResponse);
    };

    var deleteHost = function (clusterId, serial) {
      var url = ConfigService.getUrl() + '/clusters/' + clusterId + '/hosts/' + serial;
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
      var url = ConfigService.getUrl() + '/connectors/' + connectorId;
      return $http.get(url).then(extractDataFromResponse);
    };

    return {
      fetch: fetch,
      deleteHost: deleteHost,
      getClusters: getClusters,
      getConnector: getConnector,
      upgradeSoftware: upgradeSoftware
    };
  }

  /* @ngInject */
  function ClusterPoller(CsdmPoller, ConnectorService) {
    return CsdmPoller.create(ConnectorService.fetch);
  }

  angular
    .module('Hercules')
    .service('ClusterPoller', ClusterPoller)
    .service('ConnectorService', ConnectorService);

}());
