(function () {
  'use strict';

  angular
    .module('GSS')
    .factory('GSSService', GSSService);

  function GSSService($http, UrlConfig) {
    var url = UrlConfig.getGssUrl();
    var servicesUrl = url + '/services';
    var serviceId;

    var service = {
      getServices: getServices,
      getServiceId: getServiceId,
      setServiceId: setServiceId,
      addService: addService,
      deleteService: deleteService,
      modifyService: modifyService,
      syncCheck: syncCheck,
      syncUp: syncUp,
    };

    return service;

    function extractData(response) {
      return response.data;
    }

    function getServices() {
      return $http.get(servicesUrl)
        .then(extractData);
    }

    function getServiceId() {
      return serviceId;
    }

    function setServiceId(_serviceId) {
      serviceId = _serviceId;
    }

    function addService(serviceName, description) {
      return $http.post(servicesUrl, {
        serviceName: serviceName,
        description: description,
      }).then(extractData);
    }

    function deleteService(serviceId) {
      var deleteUrl = servicesUrl + '/' + serviceId;

      return $http.delete(deleteUrl)
        .then(extractData);
    }

    function modifyService(serviceId, serviceName, description) {
      var modifyUrl = servicesUrl + '/' + serviceId;

      return $http.put(modifyUrl, {
        serviceName: serviceName,
        description: description,
      }).then(extractData);
    }

    function syncCheck() {
      var compareVersionUrl = url + '/compareVersion';

      return $http.get(compareVersionUrl)
        .then(extractData);
    }

    function syncUp() {
      var syncUpUrl = url + '/syncUpFromAWS';
      return $http.post(syncUpUrl)
        .then(extractData);
    }
  }
}());
