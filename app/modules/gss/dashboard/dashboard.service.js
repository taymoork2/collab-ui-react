(function () {
  'use strict';

  angular.module('GSS')
    .service('DashboardService', DashboardService);

  /* @ngInject */
  function DashboardService($http, GSSIframeService) {
    var service = {
      getComponents: getComponents,
      modifyComponent: modifyComponent,
      getIncidents: getIncidents,
    };

    return service;

    function getComponents(serviceId) {
      var url = GSSIframeService.getGssUrl() + '/services/' + serviceId + '/components';

      return $http.get(url)
        .then(function (response) {
          return response.data;
        });
    }

    function modifyComponent(component) {
      var url = GSSIframeService.getGssUrl() + '/components/' + component.componentId;

      return $http.put(url, component);
    }

    function getIncidents(serviceId) {
      var url = GSSIframeService.getGssUrl() + '/services/' + serviceId + '/incidents';

      return $http.get(url)
        .then(function (response) {
          return response.data;
        });
    }
  }
}());
