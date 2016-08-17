(function () {
  'use strict';

  angular
    .module('Core')
    .service('CustomerSubscriptionsService', CustomerSubscriptionsService);

  /* @ngInject */
  function CustomerSubscriptionsService($q, Auth) {

    //var customerAccountUrl = Auth.getCustomerAccount();

    var service = {
      getSubscriptions: getSubscriptions
    };

    return service;

    function getSubscriptions(customerOrgId) {
      if (!customerOrgId || customerOrgId === '') {
        return $q.reject('A Customer Organization Id must be passed');
      }
      return Auth.getCustomerAccount(customerOrgId);
    }

  }

})();
