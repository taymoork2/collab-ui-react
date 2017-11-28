(function () {
  'use strict';

  // TODO: convert this file to TypeScript

  angular
    .module('uc.autoattendant')
    .factory('RestApiService', RestApiService);

  /* @ngInject */
  function RestApiService(CeTestRestApiConfigsService, Authinfo) {
    var service = {
      testRestApiConfigs: testRestApiConfigs,
    };
    return service;
    /////////////////////
    function testRestApiConfigs(requestBody) {
      return CeTestRestApiConfigsService.save({
        customerId: Authinfo.getOrgId(),
      },
      requestBody
      ).$promise;
    }
  }
})();
