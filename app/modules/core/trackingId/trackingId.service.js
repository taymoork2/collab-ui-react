(function () {
  'use strict';

  angular
    .module('core.trackingId')
    .factory('TrackingId', TrackingId);

  /* @ngInject */
  function TrackingId($http, Utils) {

    var service = {
      increment: increment,
      clear: clear,
      get: get,
      getWithoutSequence: getWithoutSequence
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
        // Increment the last component sequence
        var sequence = _.chain(trackingIdComponents)
          .pop()
          .parseInt()
          .add(1)
          .value();
        // Add our new sequence number
        trackingIdComponents.push(sequence);
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

    function getWithoutSequence() {
      if (trackingId) {
        return _.chain(trackingId)
          .split(SEPARATOR)
          .dropRight(1)
          .join(SEPARATOR)
          .value();
      } else {
        return '';
      }
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
