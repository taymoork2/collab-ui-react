(function () {
  'use strict';

  /* @ngInject */
  function ComponentsService($log, UrlConfig, $http) {

    var componentsUrl = _.template(UrlConfig.getStatusUrl() + '/services/${ serviceId }/components');
    var groupCompnentsUrl = _.template(UrlConfig.getStatusUrl() + '/services/${ serviceId }/components/groups');
    var delComponentUrl = _.template(UrlConfig.getStatusUrl() + '/components/${ componentId }');

    function getComponents(serviceId) {
      return $http.get(componentsUrl({
        serviceId: serviceId
      })).then(function (response) {
        return response.data;
      });
    }

    function getGroupComponents(serviceId) {
      return $http.get(groupCompnentsUrl({
        serviceId: serviceId
      })).then(function (response) {
        $log.debug(response.data);
        return response.data;
      });
    }

    function addComponent(serviceId, component) {
      $log.debug('serviceId ' + serviceId, ' component ', component);
      return $http.post(componentsUrl({
        serviceId: serviceId
      }), component);
    }

    function delComponent(component) {
      return $http.delete(delComponentUrl({
        componentId: component.componentId
      }));
    }

    return {
      getComponents: getComponents,
      getGroupComponents: getGroupComponents,
      addComponent: addComponent,
      delComponent: delComponent
    };
  }

  angular
    .module('Status')
    .service('ComponentsService', ComponentsService);

}());
