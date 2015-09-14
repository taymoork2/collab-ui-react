(function () {
  'use strict';

  angular
    .module('Huron')
    .factory('HuronCustomer', HuronCustomer);

  /* @ngInject */
  function HuronCustomer(Authinfo, CustomerCommonService) {
    var domainRegex = /[^A-Za-z0-9\-]/g;

    var customerPayload = {
      'uuid': null,
      'name': null,
      'servicePackage': 'DEMO_STANDARD',
      'voicemail': {
        'pilotNumber': ''
      }
    };

    return {
      create: function (uuid, name, email) {
        var customer = angular.copy(customerPayload);
        customer.uuid = uuid;
        customer.name = name;

        // Set customer.voicemail.pilotNumber to customer's uuid, so that it is unique.
        // The pilot number will be set in service setup.
        customer.voicemail.pilotNumber = uuid;
        return CustomerCommonService.save({}, customer).$promise;
      },

      get: function () {
        return CustomerCommonService.get({
          customerId: Authinfo.getOrgId()
        }).$promise;
      },

      put: function (name) {
        var customer = angular.copy(customerPayload);
        customer.uuid = undefined;
        customer.name = name;
        customer.voicemail = undefined;

        return CustomerCommonService.update({
          customerId: Authinfo.getOrgId()
        }, customer).$promise;
      }
    };
  }
})();
