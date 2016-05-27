/* global mixpanel */

(function () {
  'use strict';

  angular
    .module('Core')
    .service('Mixpanel', Mixpanel);

  /* @ngInject */
  function Mixpanel($q, Config, Orgservice) {

    var service = {
      trackEvent: trackEvent,
      getTestOrg: getTestOrg
    };

    var isTestOrgPromise = null;

    return service;

    /**
     *	Saves mixpanel data in production
     */
    function trackEvent(eventName, attributes) {
      if (Config.isE2E()) {
        return;
      }

      if (Config.isProd()) {
        mixpanel.track('Prod Org: ' + eventName, _.toArray(attributes));
      } else {
        getTestOrg().then(function (isTestOrg) {
          if (isTestOrg) {
            mixpanel.track('Test Org: ' + eventName, _.toArray(attributes));
          }
        });
      }

    }

    function getTestOrg() {
      if (!isTestOrgPromise) {
        isTestOrgPromise = $q(function (resolve, reject) {
          Orgservice.getOrg(function (response) {
            resolve(response.isTestOrg);
          });
        });
      }
      return isTestOrgPromise;
    }
  }

})();
