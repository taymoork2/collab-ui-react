// TODO: convert this file to TypeScript

(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .factory('DoRestService', DoRestService);

  /* @ngInject */
  function DoRestService(CeDoRestService, Authinfo) {
    var service = {
      readDoRest: readDoRest,
      createDoRest: createDoRest,
      updateDoRest: updateDoRest,
      deleteDoRest: deleteDoRest,
    };

    return service;
    /////////////////////

    function readDoRest(configId) {
      return CeDoRestService.get({
        customerId: Authinfo.getOrgId(),
        configId: configId,
      }).$promise;
    }

    function createDoRest(doRestDefinition) {
      return CeDoRestService.save({
        customerId: Authinfo.getOrgId(),
      },
      doRestDefinition
      ).$promise;
    }

    function updateDoRest(configId, doRestDefinition) {
      return CeDoRestService.update({
        customerId: Authinfo.getOrgId(),
        configId: configId,
      },
      doRestDefinition
      ).$promise;
    }

    function deleteDoRest(configId) {
      return CeDoRestService.delete({
        customerId: Authinfo.getOrgId(),
        configId: configId,
      }).$promise;
    }
  }
})();
