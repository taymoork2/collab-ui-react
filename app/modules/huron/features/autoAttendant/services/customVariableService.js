(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .factory('CustomVariableService', CustomVariableService);

  /* @ngInject */
  function CustomVariableService(CeCustomVariableService, Authinfo) {

    var service = {
      listCustomVariables: listCustomVariables,
    };
    return service;
    /////////////////////
    function listCustomVariables(aCeId) {
      return CeCustomVariableService.query({
        customerId: Authinfo.getOrgId(),
        ceId: aCeId,
      }).$promise;
    }
  }
})();
