/* global mixpanel */

(function () {
  'use strict';

  angular
    .module('Core')
    .service('Mixpanel', Mixpanel);

  /* @ngInject */
  function Mixpanel(Config, Orgservice) {

    var service = {
      invokeProdOrg: invokeProdOrg,
      invokeTestOrg: invokeTestOrg
    };

    return service;

    /**
     *	Saves mixpanel data in production
     */
    function invokeProdOrg(eventName, attributes) {
      if (Config.isProd()) {
        mixpanel.track(eventName, _.toArray(attributes));
      }
    }

    /**
     * Saves mixpanel data in test orgs
     */
    function invokeTestOrg(eventName, attributes) {
      Orgservice.getOrg(function (data, status) {
        if (status === 200 && data.isTestOrg) {
          mixpanel.track(eventName, _.toArray(attributes));
        }
      });
    }
  }

})();
