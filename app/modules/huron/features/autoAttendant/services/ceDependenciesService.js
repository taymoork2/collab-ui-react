(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .factory('CeDependenciesService', CeDependenciesService);

  /* @ngInject */
  function CeDependenciesService($resource, HuronConfig) {
    return $resource(HuronConfig.getCesUrl() + '/customers/:customerId/dependencies', {
      customerId: '@customerId'
    });
  }
})();
