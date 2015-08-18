(function () {
  'use strict';

  angular
    .module('Huron')
    .factory('CallerId', CallerId);

  /* @ngInject */
  function CallerId(Authinfo, CallRouterService) {

    var service = {
      listCompanyNumbers: listCompanyNumbers
    };
    return service;
    //////////////////////

    function listCompanyNumbers() {
      return CallRouterService.query({
        customerId: Authinfo.getOrgId()
      }).$promise;
    }

  }
})();
