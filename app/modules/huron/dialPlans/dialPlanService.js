(function () {
  'use strict';

  angular
    .module('Huron')
    .factory('DialPlanService', DialPlanService);

  /* @ngInject */
  function DialPlanService($q, Authinfo, ClusterCommonCmiService, CustomerVoiceCmiService, DialPlanCmiService, DialPlanDetailsCmiService) {

    var service = {
      getVoiceClusters: getVoiceClusters,
      getCustomerVoice: getCustomerVoice,
      getDialPlans: getDialPlans,
      getCustomerDialPlanDetails: getCustomerDialPlanDetails
    };

    return service;

    // get a list of voice clusters in the deployment
    function getVoiceClusters() {
      var queryString = {
        'type': 'APPLICATION_VOICE'
      };
      return ClusterCommonCmiService.query(queryString).$promise;
    }

    // get the customer's voice service profile
    function getCustomerVoice(customerId) {
      var queryString = {
        customerId: customerId || Authinfo.getOrgId()
      };
      return CustomerVoiceCmiService.get(queryString).$promise;
    }

    // get a list of dial plans from the voice cluster the customer is on
    function getDialPlans() {
      return getVoiceClusters().then(function (response) {
        var queryString = {
          clusterId: undefined
        };
        queryString.clusterId = response[0].uuid; // this must be revisited once a customer's actual cluster can be identified
        return DialPlanCmiService.query(queryString).$promise;
      });
    }

    // get dial plan details corresponding to the customer's dial plan
    function getCustomerDialPlanDetails(customerId) {
      return $q.all([getVoiceClusters(), getDialPlans(), getCustomerVoice(customerId)]).then(function (responses) {
        // wait until all promises in $q are resolved, then...
        var voiceClusters = responses[0];
        var clusterDialPlans = responses[1];
        var customerVoice = responses[2];

        if (customerVoice.dialPlan === null) {
          // if customer's dialPlan attribute is defined but null, assume the customer is on the 
          // North American Dial Plan. Look up uuid for NANP and insert it into customer dialPlan.
          var northAmericanDialPlan = _.find(clusterDialPlans, {
            'name': 'NANP'
          });
          customerVoice.dialPlan = {
            uuid: northAmericanDialPlan.uuid
          };
        }

        var queryString = {
          clusterId: undefined,
          'dialplan': undefined
        };
        queryString.clusterId = voiceClusters[0].uuid; // this must be revisited once a customer's actual cluster can be identified
        queryString.dialplan = customerVoice.dialPlan.uuid;

        return DialPlanDetailsCmiService.query(queryString).$promise
          .then(function (response) {

            // Manually build the missing dialPlanDetails for North America
            // TODO: Remove this section when dialPlanDetails for North America becomes available in UPDM.
            // When this section is removed, didAdd.spec.js must be updated to not expect a 404 for NADP.
            // Ask Ken Nakano (kennakan) for any questions.
            if (response.length < 1) {
              var northAmericanDialPlanData = {
                countryCode: "+1",
                extensionGenerated: "false",
                steeringDigitRequired: "true",
                supportSiteCode: "true",
                supportSiteSteeringDigit: "true"
              };
              return northAmericanDialPlanData;
            }
            // end of Manually build the missing dialPlanDetails for North America

            return response[0];
          });
      });
    }
  }
})();
