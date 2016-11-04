(function () {
  'use strict';

  angular
    .module('GSS')
    .factory('GSSService', GSSService);

  function GSSService($http, UrlConfig) {

    var url = UrlConfig.getGssUrl() + '/services';
    var serviceId;

    return {
      getServices: function () {
        return $http.get(url).then(function (response) {
          return response.data;
        });
      },
      getServiceId: function () {
        return serviceId;
      },
      setServiceId: function (_serviceId) {
        serviceId = _serviceId;
      }
    };
  }
}());
