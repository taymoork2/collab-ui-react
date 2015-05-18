(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .factory('AutoAttendantCeService', AutoAttendantCeService);

  /* @ngInject */
  function AutoAttendantCeService(CeService, Authinfo) {

    var service = {
      listCes: listCes,
      readCe: readCe,
      createCe: createCe,
      updateCe: updateCe,
      deleteCe: deleteCe
    };

    return service;

    /////////////////////

    function listCes() {
      return CeService.query({
        customerId: Authinfo.getOrgId()
      }).$promise;
    }

    function readCe(ceUrl) {
      var aCeId = ceUrl.substr(ceUrl.lastIndexOf('/') + 1);
      return CeService.get({
        customerId: Authinfo.getOrgId(),
        ceId: aCeId
      }).$promise;
    }

    function createCe(ceDefinition) {
      return CeService.save({
          customerId: Authinfo.getOrgId()
        },
        ceDefinition
      ).$promise;
    }

    function updateCe(ceUrl, ceDefinition) {
      var aCeId = ceUrl.substr(ceUrl.lastIndexOf('/') + 1);
      return CeService.update({
          customerId: Authinfo.getOrgId(),
          ceId: aCeId
        },
        ceDefinition
      ).$promise;
    }

    function deleteCe(ceUrl) {
      var aCeId = ceUrl.substr(ceUrl.lastIndexOf('/') + 1);
      return CeService.delete({
        customerId: Authinfo.getOrgId(),
        ceId: aCeId
      }).$promise;
    }
  }
})();
