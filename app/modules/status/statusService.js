(function () {
  'use strict';

  /* @ngInject */
  function StatusService($log, $http, UrlConfig) {

    var url = UrlConfig.getStatusUrl() + '/services';
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
        $log.debug('set serviceId to ', _serviceId);
        serviceId = _serviceId;
      },
      addService: function (serviceName, description) {
        return $http.post(url, {
          serviceName: serviceName,
          description: description
        });
      },
      deleteService: function (serviceId) {
        var deleteUrl = url + "/" + serviceId;
        return $http.delete(deleteUrl).then(function (response) {
          return response.data;
        });
      },
      modifyService: function (serviceId, serviceName, description) {
        var modifyUrl = url + "/" + serviceId;
        return $http.put(modifyUrl, {
          serviceName: serviceName,
          description: description
        }).then(function (response) {
          return response.data;
        });
      }
    };
  }

  angular
    .module('Status')
    .factory('statusService', StatusService);

}());
