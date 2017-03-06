(function () {
  'use strict';

  angular
    .module('GSS')
    .factory('GSSService', GSSService);

  function GSSService($http, UrlConfig) {

    var url = UrlConfig.getGssUrl() + '/services';
    var serviceId;

    var service = {
      getServices: getServices,
      getServiceId: getServiceId,
      setServiceId: setServiceId,
      addService: addService,
      deleteService: deleteService,
      modifyService: modifyService,
    };

    return service;

    function extractData(response) {
      return response.data;
    }

    function getServices() {
      return $http.get(url)
        .then(extractData);
    }

    function getServiceId() {
      return serviceId;
    }

    function setServiceId(_serviceId) {
      serviceId = _serviceId;
    }

    function addService(serviceName, description) {
      return $http.post(url, {
        serviceName: serviceName,
        description: description,
      }).then(extractData);
    }

    function deleteService(serviceId) {
      var deleteUrl = url + '/' + serviceId;

      return $http.delete(deleteUrl)
        .then(extractData);
    }

    function modifyService(serviceId, serviceName, description) {
      var modifyUrl = url + '/' + serviceId;

      return $http.put(modifyUrl, {
        serviceName: serviceName,
        description: description,
      }).then(extractData);
    }
  }
}());
