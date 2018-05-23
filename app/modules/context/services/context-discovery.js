(function () {
  'use strict';

  module.exports = contextDiscovery;

  /* @ngInject */
  function contextDiscovery($http, $q, UrlConfig) {
    var _discoveryPromise = null;
    var _contextDiscoveryUrl = UrlConfig.getContextDiscoveryServiceUrl();

    var discovery = {
      getEndpointForService: getEndpointForService,
    };

    return discovery;

    function getEndpointForService(serviceName) {
      if (!serviceName) {
        return $q.reject('No service name specified.');
      }
      return discoverAndGetServiceLocation(serviceName);
    }

    function discoverAndGetServiceLocation(serviceName) {
      return getApplications()
        .then(function (respData) {
          var serviceEndpoint = _.find(respData, { service: serviceName });
          if (serviceEndpoint) {
            return serviceEndpoint.endpoints[0].location;
          } else {
            return $q.reject('Context Service Dictionary endpoint not found.');
          }
        });
    }

    function getApplications() {
      if (!_discoveryPromise) {
        _discoveryPromise = $http.get(_contextDiscoveryUrl)
          .then(function (response) {
            return response.data;
          });
      }
      return _discoveryPromise;
    }
  }
})();
