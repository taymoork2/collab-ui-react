(function () {
  'use strict';

  angular
    .module('Huron')
    .factory('HuronCustomer', HuronCustomer);

  /* @ngInject */
  function HuronCustomer(Authinfo, CustomerCommonService, $q) {

    var customerPayload = {
      'uuid': null,
      'name': null,
      'servicePackage': 'DEMO_STANDARD',
      'voicemail': {
        'pilotNumber': ''
      }
    };

    var service = {
      create: createCustomer,
      get: getCustomer,
      put: putCustomer
    };

    return service;

    function createCustomer(uuid, name, email) {
      var customer = angular.copy(customerPayload);
      customer.uuid = uuid;
      customer.name = name;

      // Set customer.voicemail.pilotNumber to customer's uuid, so that it is unique.
      // The pilot number will be set in service setup.
      customer.voicemail.pilotNumber = uuid;
      return CustomerCommonService.save({}, customer).$promise
        .catch(function (response) {
          // If we have a conflict on create
          if (_.get(response, 'status') === 409) {
            // Query the customer we're trying to create
            return getCustomer(uuid)
              .then(function (getCustomer) {
                // Update the customer if it matches our name
                if (_.get(getCustomer, 'name') === name) {
                  return putCustomer(name, uuid);
                }
              });
          }
          // Otherwise return original error
          return $q.reject(response);
        });
    }

    function getCustomer(uuid) {
      return CustomerCommonService.get({
        customerId: uuid || Authinfo.getOrgId()
      }).$promise;
    }

    function putCustomer(name, uuid) {
      var customer = angular.copy(customerPayload);
      customer.uuid = undefined;
      customer.name = name;
      customer.voicemail = undefined;

      return CustomerCommonService.update({
        customerId: uuid || Authinfo.getOrgId()
      }, customer).$promise;
    }
  }
})();
