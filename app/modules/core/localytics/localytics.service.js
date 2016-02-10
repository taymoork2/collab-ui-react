/* global ll */

(function () {
  'use strict';

  angular
    .module('Core')
    .service('Localytics', Localytics);

  function Localytics() {
    var service = {
      customDimension: customDimension,
      push: push
    };

    return service;

    function customDimension(eventName, attributes) {
      ll('setCustomDimension', eventName, attributes);
    }

    function push(eventName, attributes) {
      ll('tagEvent', eventName, attributes);
    }
  }

})();
