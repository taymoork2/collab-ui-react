(function () {
  'use strict';

  /* @ngInject */
  function ConnectorService($q, $http, $location, ConnectorMock, ConverterService, ConfigService, XhrNotificationService) {
    var lastClusterResponse = [];

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
        .then(ConverterService.convertClusters);
    };

    var upgradeSoftware = function (clusterId, serviceType) {
      var url = ConfigService.getUrl() + '/clusters/' + clusterId + '/services/' + serviceType + '/upgrade';
      return $http
        .post(url, '{}')
        .then(extractDataFromResponse);
    };

    var deleteHost = function (clusterId, serial) {
      var url = ConfigService.getUrl() + '/clusters/' + clusterId + '/hosts/' + serial;
      return $http.delete(url);
    };

    var getConnector = function (connectorId) {
      var url = ConfigService.getUrl() + '/connectors/' + connectorId;
      return $http.get(url).then(extractDataFromResponse);
    };

    return {
      fetch: fetch,
      deleteHost: deleteHost,
      upgradeSoftware: upgradeSoftware,
      getConnector: getConnector
    };
  }

  angular
    .module('Hercules')
    .service('ConnectorService', ConnectorService);

}());
