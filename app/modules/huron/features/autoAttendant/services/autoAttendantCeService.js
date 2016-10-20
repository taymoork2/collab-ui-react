(function () {
  'use strict';

  angular
    .module('uc.autoattendant')
    .factory('AutoAttendantCeService', AutoAttendantCeService);

  /* @ngInject */
  function AutoAttendantCeService(CeService, Authinfo, AANumberAssignmentService) {

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
      var aCeId = getCeId(ceUrl);
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
      var aCeId = getCeId(ceUrl);
      return CeService.update({
        customerId: Authinfo.getOrgId(),
        ceId: aCeId
      },
        ceDefinition
      ).$promise;
    }

    function deleteCe(ceUrl) {
      var aCeId = getCeId(ceUrl);
      return CeService.delete({
        customerId: Authinfo.getOrgId(),
        ceId: aCeId
      }).$promise.then(
        function () {
          // on successful delete of AA, delete the AA mapping in CMI
          return AANumberAssignmentService.deleteAANumberAssignments(Authinfo.getOrgId(), aCeId);
        });
    }

    /**
     * TODO: This method is for POC delete with ceURL
     * and can be removed when POC code is removed
     */
    function getCeId(ceUrl) {
      var aCeId;
      if (ceUrl.substring(0, 4) === "http") {
        aCeId = ceUrl.substr(ceUrl.lastIndexOf('/') + 1);
      } else {
        aCeId = ceUrl;
      }
      return aCeId;
    }
  }
})();
