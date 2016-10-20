(function () {
  'use strict';

  angular
    .module('Huron')
    .factory('HuronCustomer', HuronCustomer);

  /* @ngInject */
  function HuronCustomer(Authinfo, CustomerCommonService, CustomerVoiceCmiService, PstnSetupService, $q) {

    var customerPayload = {
      'uuid': null,
      'name': null,
      'servicePackage': 'VOICE_ONLY'
    };

    var service = {
      create: createCustomer,
      get: getCustomer,
      put: putCustomer
    };

    return service;

    function createCustomer(uuid, name) {
      var customer = angular.copy(customerPayload);
      customer.uuid = uuid;
      customer.name = name;

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
        })
        // get the carrier name if reseller has a single carrier
        .then(getResellerCarrierName)
        // update the voice customer with carrier if found
        .then(function (carrierName) {
          updateVoiceCustomerCarrier(uuid, carrierName);
        });
    }

    function getResellerCarrierName() {
      return PstnSetupService.listResellerCarriers()
        .then(function (carriers) {
          if (_.isArray(carriers) && _.size(carriers) === 1) {
            return carriers[0].name;
          }
        })
        .catch(function (response) {
          // ignore error if reseller is not found
          if (response.status !== 404) {
            return $q.reject(response);
          }
        });
    }

    function updateVoiceCustomerCarrier(uuid, carrierName) {
      if (carrierName) {
        var payload = {
          carrier: {
            name: carrierName
          }
        };
        return CustomerVoiceCmiService.update({
          customerId: uuid
        }, payload).$promise;
      }
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
