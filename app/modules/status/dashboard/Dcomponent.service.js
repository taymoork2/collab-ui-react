(function () {
  'use strict';

  /* @ngInject */
  function DcomponentService(UrlConfig, $resource) {

    var componentsUrl = UrlConfig.getStatusUrl() + '/services/:serviceId/components';
    var modifyComponentUrl = UrlConfig.getStatusUrl() + '/components/:componentId';
    function getComponents(serviceId) {
      return $resource(componentsUrl).query({
        serviceId: serviceId
      }).$promise.then(function (response) {
        return response;
      });
    }

    function modifyComponent(component) {
      return $resource(modifyComponentUrl, {}, { 'put': { method: 'PUT' } }).put({
        componentId: component.componentId
      }, component).$promise.then(function (response) {
        return response;
      });
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
