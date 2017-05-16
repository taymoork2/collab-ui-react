(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .factory('CustomVariableService', CustomVariableService);

  /* @ngInject */
  function CustomVariableService(CeCustomVariableService, CeVariableDependeciesService, Authinfo) {

    var service = {
      listCustomVariables: listCustomVariables,
      getVariableDependencies: getVariableDependencies,
    };
    return service;
    /////////////////////
    function listCustomVariables(aCeId) {
      return CeCustomVariableService.query({
        customerId: Authinfo.getOrgId(),
        ceId: aCeId,
      }).$promise;
    }
    function getVariableDependencies(varNameOfInterest) {
      return CeVariableDependeciesService.get({
        customerId: Authinfo.getOrgId(),
        varname: varNameOfInterest,
      }).$promise;
    }
  }
})();
