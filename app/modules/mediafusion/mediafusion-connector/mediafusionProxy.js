'use strict';

angular.module('Mediafusion')
  .service('MediafusionProxy', MediafusionProxy);

/* @ngInject */
function MediafusionProxy($interval, clusterService) {
  var pollPromise,
    error = null,
    clusters = [],
    callbacks = [],
    pollCount = 0,
    pollDelay = 1000,
    pollInFlight = false;

  var start = function (callback) {
    pollCount++;
    togglePolling();
    if (callback) callbacks.push(callback);
  };

  var stop = function () {
    if (pollCount > 0) pollCount--;
    togglePolling();
  };

  var defuseConnector = function (clusterId) {
    clusterService.defuseConnector(clusterId, function () {
      var args = arguments;
      poll(function () {
        //if (callback) callback.apply(args);
      });
    });
  };

  var getClusters = function (callback) {
    if (callback) {
      callbacks.push(callback);
    }
    return {
      error: error,
      clusters: clusters
    };
  };

  var upgradeSoftware = function (clusterId, serviceType, callback, opts) {
    clusterService.upgradeSoftware(clusterId, serviceType, function () {
      var args = arguments;
      poll(function () {
        if (callback) callback.apply(args);
      });
    }, opts);
  };

  var isPolling = function () {
    return !!pollCount;
  };

  function togglePolling() {
    if (pollCount <= 0) {
      $interval.cancel(pollPromise);
      pollInFlight = false;
      return;
    }
    if (pollInFlight) {
      return;
    }
    pollInFlight = true;

    if (pollPromise) $interval.cancel(pollPromise);
    pollPromise = $interval(poll, pollDelay, 1);
  }

  function poll(callback) {
    clusterService.fetch(function (err, _clusters) {
      error = err;
      clusters = _clusters || [];
      pollInFlight = false;
      togglePolling();
      if (callback) callback.apply(null, arguments);
      while ((callback = callbacks.pop()) != null) {
        if (_.isFunction(callback)) {
          callback.apply(null, arguments);
        }
      }
    }, {
      squelchErrors: true
    });
  }

  return {
    stopPolling: stop,
    startPolling: start,
    defuseConnector: defuseConnector,
    getClusters: getClusters,
    upgradeSoftware: upgradeSoftware,
    /* for testing */
    _isPolling: isPolling
  };
}
