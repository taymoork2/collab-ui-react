(function () {
  'use strict';

  module.exports = angular.module('huron.callerId', [
    require('modules/core/auth/auth'),
    require('modules/huron/telephony/cmiServices'),
  ])
    .service('CallerId', CallerId)
    .name;

  /* @ngInject */
  function CallerId(Authinfo, CompanyNumberService) {
    var service = {
      listCompanyNumbers: listCompanyNumbers,
      saveCompanyNumber: saveCompanyNumber,
      updateCompanyNumber: updateCompanyNumber,
      deleteCompanyNumber: deleteCompanyNumber,
    };
    return service;
    //////////////////////

    function listCompanyNumbers() {
      return CompanyNumberService.query({
        customerId: Authinfo.getOrgId(),
      }).$promise;
    }

    function saveCompanyNumber(data) {
      return CompanyNumberService.save({
        customerId: Authinfo.getOrgId(),
      }, {
        name: _.get(data, 'name'),
        pattern: _.get(data, 'pattern'),
        externalCallerIdType: _.get(data, 'externalCallerIdType'),
      }).$promise;
    }

    function updateCompanyNumber(companyNumberId, data) {
      return CompanyNumberService.update({
        customerId: Authinfo.getOrgId(),
        companyNumberId: companyNumberId,
      }, {
        name: _.get(data, 'name'),
        pattern: _.get(data, 'pattern'),
        externalCallerIdType: _.get(data, 'externalCallerIdType'),
        externalNumber: null,
      }).$promise;
    }

    function deleteCompanyNumber(companyNumberId) {
      return CompanyNumberService.delete({
        customerId: Authinfo.getOrgId(),
        companyNumberId: companyNumberId,
      }).$promise;
    }
  }
})();
