(function () {
  'use strict';

  angular
    .module('Core')
    .factory('TrackingId', TrackingId);

  /* @ngInject */
  function TrackingId($http, Utils) {

    var service = {
      generate: generate,
      increment: increment,
      clear: clear,
      get: get,
      set: set
    };

    var TRACKING_ID = 'TrackingID';
    var SENDER_TYPE = 'ATLAS';
    var SEPARATOR = '_';
    var INITIAL_SEQUENCE = '0';
    var trackingId;

    return service;

    function generate() {
      return set(SENDER_TYPE + SEPARATOR + Utils.getUUID() + SEPARATOR + INITIAL_SEQUENCE);
    }

    function increment() {
      // If we don't have a tracking id yet, generate a new one
      if (!exists()) {
        return generate();
      }

      var trackingIdComponents = get().split(SEPARATOR);
      // If we already have something appended to the <SENDER_TYPE>_<UUID>
      if (trackingIdComponents.length > 2) {
        // Convert the last component to a number
        var lastComponent = _.chain(trackingIdComponents).last().parseInt().value();
        // If not a number, it could have been an nvpair that we need to ignore
        if (_.isNaN(lastComponent)) {
          // Set initial sequence value for new sequence
          lastComponent = INITIAL_SEQUENCE;
        } else {
          // Otherwise the last component is a sequence number
          // Increment the sequence and pop off the old one
          lastComponent++;
          trackingIdComponents.pop();
        }
        // Add our new sequence number
        trackingIdComponents.push(lastComponent);
      } else {
        // If we never had a sequence component, add the initial value
        trackingIdComponents.push(INITIAL_SEQUENCE);
      }
      return set(trackingIdComponents.join(SEPARATOR));
    }

    function clear() {
      trackingId = undefined;
      delete $http.defaults.headers.common[TRACKING_ID];
    }

    function get() {
      return trackingId;
    }

    function exists() {
      return !!trackingId;
    }

    function set(_trackingId) {
      trackingId = _trackingId;
      $http.defaults.headers.common[TRACKING_ID] = trackingId;
      return trackingId;
    }

  }
})();
