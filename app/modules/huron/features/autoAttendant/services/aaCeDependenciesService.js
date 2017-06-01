(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .factory('AACeDependenciesService', AACeDependenciesService);

  /* @ngInject */
  function AACeDependenciesService(CeDependenciesService, Authinfo) {

    var service = {
      readCeDependencies: readCeDependencies,
    };

    return service;

    /////////////////////

    function readCeDependencies() {
      return CeDependenciesService.get({
        customerId: Authinfo.getOrgId(),
      }).$promise;
    }
  }
})();
