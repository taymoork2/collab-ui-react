(function () {
  'use strict';

  /* @ngInject */
  function ComponentsService($log, UrlConfig, $resource) {

    var componentsUrl = UrlConfig.getStatusUrl() + '/services/:serviceId/components';
    var groupCompnentsUrl = UrlConfig.getStatusUrl() + '/services/:serviceId/components/groups';
    var delComponentUrl = UrlConfig.getStatusUrl() + '/components/:componentId';
    var modifyComponentUrl = UrlConfig.getStatusUrl() + '/components/:componentId';
    function getComponents(serviceId) {
      return $resource(componentsUrl).query({
        serviceId: serviceId
      }).$promise.then(function (response) {
        return response;
      });
    }

    function getGroupComponents(serviceId) {
      return $resource(groupCompnentsUrl).query({
        serviceId: serviceId
      }).$promise.then(function (response) {
        $log.debug(response);
        return response;
      });
    }

    function addComponent(serviceId, component) {
      $log.debug('serviceId ' + serviceId, ' component ', component);
      return $resource(componentsUrl).save({
        serviceId: serviceId
      }, component).$promise.then(function (response) {
        return response;
      });
    }

    function delComponent(component) {
      return $resource(delComponentUrl).delete({
        componentId: component.componentId
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
      getGroupComponents: getGroupComponents,
      addComponent: addComponent,
      delComponent: delComponent,
      modifyComponent: modifyComponent
    };
  }

  angular
    .module('Status')
    .service('ComponentsService', ComponentsService);

}());
