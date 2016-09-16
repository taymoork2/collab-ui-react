(function () {
  'use strict';

  angular
    .module('Huron')
    .factory('DialPlanService', DialPlanService);

  /* @ngInject */
  function DialPlanService(Authinfo, CustomerVoiceCmiService) {

    var service = {
      getCustomerVoice: getCustomerVoice,
      updateCustomerVoice: updateCustomerVoice,
      getCustomerDialPlanDetails: getCustomerDialPlanDetails,
      getCustomerDialPlanCountryCode: getCustomerDialPlanCountryCode
    };

    return service;

    // get the customer's voice service profile
    function getCustomerVoice(customerId) {
      var queryString = {
        customerId: customerId || Authinfo.getOrgId()
      };
      return CustomerVoiceCmiService.get(queryString).$promise;
    }

    function updateCustomerVoice(customerId, payload) {
      return CustomerVoiceCmiService.update({
        customerId: customerId
      }, payload).$promise;
    }

    function getCustomerDialPlanCountryCode(customerId) {
      return getCustomerDialPlanDetails(customerId)
        .then(function (dialPlanDetails) {
          return _.trimLeft(dialPlanDetails.countryCode, '+');
        });
    }

    // get dial plan details corresponding to the customer's dial plan
    function getCustomerDialPlanDetails(customerId) {
      return getCustomerVoice(customerId)
        .then(function (response) {
          if (response.dialPlan === null) {
            // if customer's dialPlan attribute is defined but null, assume the customer is on the
            // North American Dial Plan. Look up uuid for NANP and insert it into customer dialPlan.
            var northAmericanDialPlanData = {
              countryCode: "+1",
              extensionGenerated: "false",
              steeringDigitRequired: "true",
              supportSiteCode: "true",
              supportSiteSteeringDigit: "true"
            };
            return northAmericanDialPlanData;
          } else {
            return response.dialPlanDetails;
          }
        });
    }
  }
})();
