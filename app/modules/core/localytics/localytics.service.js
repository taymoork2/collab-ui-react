/* global ll */

(function () {
  'use strict';

  angular
    .module('Core')
    .service('Localytics', Localytics);

  /* @ngInject */
  function Localytics(Config) {
    var SET_CUSTOM_DIMENSION = 'setCustomDimension';
    var ORG_CUSTOM_DIMENSION = 1;
    var SET_CUSTOMER_ID = 'setCustomerId';
    var TAG_SCREEN = 'tagScreen';
    var TAG_EVENT = 'tagEvent';

    var service = {
      setOrgId: setOrgId,
      setUserId: setUserId,
      tagEvent: tagEvent,
      tagScreen: tagScreen
    };

    return service;

    /**
     * Only save localytics data in production environment
     */
    function invokeLocalytics() {
      if (Config.isProd()) {
        ll.apply(ll, _.toArray(arguments));
      }
    }

    /**
     * Localytics maps to custom dimension Org
     * @param {string} uuid Uuid of the authenticated org
     */
    function setOrgId(uuid) {
      invokeLocalytics(SET_CUSTOM_DIMENSION, ORG_CUSTOM_DIMENSION, uuid);
    }

    /**
     * Localytics customer represents the logged in user
     * @param {string} uuid Uuid of the authenticated user
     */
    function setUserId(uuid) {
      invokeLocalytics(SET_CUSTOMER_ID, uuid);
    }

    /**
     * Tag the screen for user flows
     * @param {string} state Name of the state
     */
    function tagScreen(state) {
      invokeLocalytics(TAG_SCREEN, state);
    }

    /**
     * Tag a custom event
     * @param {string} eventName Name of the custom event
     * @param {{string|object}} attributes Data object to be stored with the event
     */
    function tagEvent(eventName, attributes) {
      console.log('tagEvent');
      console.log(eventName);
      console.log(attributes);
      invokeLocalytics(TAG_EVENT, eventName, attributes);
    }
  }
})();
