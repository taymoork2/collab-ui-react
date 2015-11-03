(function () {
  'use strict';

  angular
    .module('Huron')
    .factory('DialPlanService', DialPlanService);

  /* @ngInject */
  function DialPlanService($q, $filter, Authinfo, ClusterCommonCmiService, CustomerVoiceCmiService, DialPlanCmiService, DialPlanDetailsCmiService) {

    var service = {
      getVoiceClusters: getVoiceClusters,
      getCustomerVoice: getCustomerVoice,
      getDialPlans: getDialPlans,
      getCustomerDialPlanDetails: getCustomerDialPlanDetails,
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
    function getCustomerVoice() {
      var queryString = {
        customerId: Authinfo.getOrgId()
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
    function getCustomerDialPlanDetails() {
      return $q.all([getVoiceClusters(), getDialPlans(), getCustomerVoice()]).then(function (responses) {
        // wait until all promises in $q are resolved, then...
        var voiceClusters = responses[0];
        var clusterDialPlans = responses[1];
        var customerVoice = responses[2];

        if (customerVoice.dialPlan === null) {
          // if customer's dialPlan attribute is defined but null, assume the customer is on the 
          // North American Dial Plan. Look up uuid for NANP and insert it into customer dialPlan.
          var northAmericanDialPlan = $filter('filter')(clusterDialPlans, {
            name: "NANP"
          }, true);
          customerVoice.dialPlan = {
            uuid: northAmericanDialPlan[0].uuid
          };
        }

        var queryString = {
          clusterId: undefined,
          dialPlanId: undefined
        };
        queryString.clusterId = voiceClusters[0].uuid; // this must be revisited once a customer's actual cluster can be identified
        queryString.dialPlanId = customerVoice.dialPlan.uuid;

        return DialPlanDetailsCmiService.get(queryString).$promise
          .catch(function (response) {

            // Manually build dialPlanDetails for North America
            // Remove this section when dialPlanDetails for North America becomes available in UPDM.
            // Ask Ken Nakano (kennakan) for any questions.
            if (response.status === 404) {
              return $q(function (resolve) {
                // manually build the North American dialPlanDetails for the customer
                var northAmericanDialPlanData = {
                  countryCode: "+1",
                  extensionGenerated: "false",
                  steeringDigitRequired: "true"
                };
                service.customerDialPlanDetails = northAmericanDialPlanData;
                resolve(northAmericanDialPlanData);
              });
            }
            // end of Manually build dialPlanDetails for North America

            // non-404 error responses will be rejected
            return $q.reject(response);
          });
      });
    }
  }
})();
