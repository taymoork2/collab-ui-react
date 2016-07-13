(function () {
  'use strict';

  /* @ngInject */
  function CmiKemService($resource, HuronConfig, Authinfo) {

    return {
      getKEM: getKEM,
      createKEM: createKEM,
      deleteKEM: deleteKEM
    };

    /////////////////////

    function getKEM(sipEndpointId) {
      return $resource(HuronConfig.getCmiUrl() + '/voice/customers/:customerId/sipendpoints/:sipEndpointId/addonmodules', {
        customerId: '@customerId',
        sipEndpointId: '@sipEndpointId'
      }).query({
        customerId: Authinfo.getOrgId(),
        sipEndpointId: sipEndpointId
      }).$promise;
    }

    function createKEM(sipEndpointId, index) {
      var data = {
        index: index
      };
      return $resource(HuronConfig.getCmiUrl() + '/voice/customers/:customerId/sipendpoints/:sipEndpointId/addonmodules', {
        customerId: '@customerId',
        sipEndpointId: '@sipEndpointId'
      }).save({
          customerId: Authinfo.getOrgId(),
          sipEndpointId: sipEndpointId
        },
        data
      ).$promise;
    }

    function deleteKEM(sipEndpointId, addOnModuleId) {
      return $resource(HuronConfig.getCmiUrl() + '/voice/customers/:customerId/sipendpoints/:sipEndpointId/addonmodules/:addOnModuleId', {
        customerId: '@customerId',
        sipEndpointId: '@sipEndpointId',
        addOnModuleId: '@addOnModuleId'
      }).delete({
        customerId: Authinfo.getOrgId(),
        sipEndpointId: sipEndpointId,
        addOnModuleId: addOnModuleId
      }).$promise;
    }
  }

  angular
    .module('Squared')
    .factory('CmiKemService', CmiKemService);
})();
