(function () {
  'use strict';

  angular.module('GSS')
    .service('DashboardService', DashboardService);

  /* @ngInject */
  function DashboardService($http, UrlConfig) {
    var service = {
      getComponents: getComponents,
      modifyComponent: modifyComponent,
      getIncidents: getIncidents
    };

    var baseUrl = UrlConfig.getGssUrl();

    return service;

    function getComponents(serviceId) {
      var url = baseUrl + '/services/' + serviceId + '/components';

      return $http.get(url)
        .then(function (response) {
          return response.data;
        });
    }

    function modifyComponent(component) {
      var url = baseUrl + '/components/' + component.componentId;

      return $http.put(url, component);
    }

    function getIncidents(serviceId) {
      var url = baseUrl + '/services/' + serviceId + '/incidents';

      return $http.get(url)
        .then(function (response) {
          return response.data;
        });
    }
  }
}());
