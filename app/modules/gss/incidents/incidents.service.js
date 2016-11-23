(function () {
  'use strict';

  angular
    .module('GSS')
    .factory('IncidentsService', IncidentsService);

  /* @ngInject */
  function IncidentsService($http, UrlConfig) {
    var baseUrl = UrlConfig.getGssUrl();

    var service = {
      getIncidents: getIncidents,
      createIncident: createIncident,
      deleteIncident: deleteIncident
    };

    return service;

    function extractData(response) {
      return response.data;
    }

    function getIncidents(serviceId) {
      var url = baseUrl + '/services/' + serviceId + '/incidents';
      return $http.get(url).then(extractData);
    }

    function createIncident(serviceId, incident) {
      var url = baseUrl + '/services/' + serviceId + '/incidents';
      return $http.post(url, incident).then(extractData);
    }

    function deleteIncident(incidentId) {
      var url = baseUrl + '/incidents/' + incidentId;
      return $http.delete(url).then(extractData);
    }
  }
}());
