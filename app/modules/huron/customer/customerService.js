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
      'domain': null,
      'servicePackage': 'VOICE_ONLY',
      'admin': {
        'lastName': null,
        'userName': null
      },
      "voice": {
        "callManagerGroup": "Default"
      }
    };

    var factory = {
      create: create
    };

    return factory;

    function create(uuid, name, email) {
      var customer = angular.copy(customerPayload);
      customer.uuid = uuid;
      customer.name = name;
      customer.domain = name.replace(domainRegex, '') + ".com";
      customer.admin.userName = email;
      var emailSplit = email.split('@');
      customer.admin.lastName = emailSplit[0];

      return CustomerCommonService.save({}, customer).$promise;
    }
  }
})();
