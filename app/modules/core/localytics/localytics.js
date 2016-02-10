/* global ll */

(function () {
  'use strict';

  angular
    .module('Core')
    .service('Localytics', Localytics);

  function Localytics() {
    var service = {
      push: push
    };

    return service;

    function push(eventName, attributes) {
      ll('tagEvent', eventName, attributes);
    }
  }

})();
