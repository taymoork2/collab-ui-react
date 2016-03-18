/* global ll */

(function () {
  'use strict';

  angular
    .module('Core')
    .service('Localytics', Localytics);

  function Localytics() {
    var service = {
      customDimension: customDimension,
      tagEvent: tagEvent,
      setCustomerId: setCustomerId,
      tagScreen: tagScreen
    };

    return service;

    function customDimension(eventName, attributes) {
      ll('setCustomDimension', eventName, attributes);
    }

    function tagEvent(eventName, attributes) {
      ll('tagEvent', eventName, attributes);
    }

    function setCustomerId(uuid) {
      ll('setCustomerId', uuid);
    }

    function tagScreen(state) {
      ll('tagScreen', state);
    }
  }

})();
