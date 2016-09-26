(function () {
  'use strict';

  /* @ngInject */
  function DcomponentService(UrlConfig, $http) {

    var componentsUrl = _.template(UrlConfig.getStatusUrl() + '/services/${ serviceId }/components');
    var modifyComponentUrl = _.template(UrlConfig.getStatusUrl() + '/components/${ componentId }');
    function getComponents(serviceId) {
      return $http.get(componentsUrl({
        serviceId: serviceId
      })).then(function (response) {
        return response.data;
      });
    }

    function modifyComponent(component) {
      return $http.put(modifyComponentUrl({
        componentId: component.componentId
      }), component);
    }

    return {
      getComponents: getComponents,
      modifyComponent: modifyComponent
    };
  }

  angular
    .module('Status')
    .service('DcomponentService', DcomponentService);

}());
