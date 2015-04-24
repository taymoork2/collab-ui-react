(function () {
  'use strict';

  angular
    .module('Huron')
    .factory('HuronCustomer', HuronCustomer);

  /* @ngInject */
  function HuronCustomer(CustomerCommonService) {
    var domainRegex = /[^A-Za-z0-9\-]/g;

    var customerPayload = {
      'uuid': null,
      'name': null,
      'servicePackage': 'VOICE_ONLY'
    };

    var factory = {
      create: create
    };

    return factory;

    function create(uuid, name, email) {
      var customer = angular.copy(customerPayload);
      customer.uuid = uuid;
      customer.name = name;

      return CustomerCommonService.save({}, customer).$promise;
    }
  }
})();
