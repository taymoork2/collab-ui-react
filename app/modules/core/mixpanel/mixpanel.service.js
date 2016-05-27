/* global mixpanel */

(function () {
  'use strict';

  angular
    .module('Core')
    .service('Mixpanel', Mixpanel);

  /* @ngInject */
  function Mixpanel(Config, Orgservice) {

    var service = {
      trackEvent: trackEvent
    };

    return service;

    /**
     *	Saves mixpanel data in production
     */
    function trackEvent(eventName, attributes) {
      if (Config.isProd()) {
        mixpanel.track('Prod Org: ' + eventName, _.toArray(attributes));
      } 
      Orgservice.getOrg(function (response) {
        if (response.isTestOrg) {
          mixpanel.track('Test Org: ' + eventName, _.toArray(attributes));
        }
      });
    }
  }

})();
