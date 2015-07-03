(function () {
  'use strict';

  /* @ngInject */
  function ClusterProxy($interval, ConnectorService) {
    var pollPromise,
      error = null,
      clusters = [],
      callbacks = [],
      pollCount = 0,
      pollDelay = 2000,
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

    var deleteHost = function (clusterId, serial) {
      return ConnectorService.deleteHost(clusterId, serial).then(function () {
        poll();
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

    var isPolling = function () {
      return !!pollCount;
    };

    var togglePolling = function () {
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
    };

    var poll = function (callback) {
      ConnectorService.fetch().then(function (_clusters) {
        clusters = _clusters || [];
        pollInFlight = false;
        togglePolling();
        if (callback) callback.apply(null, arguments);
        while ((callback = callbacks.pop()) != null) {
          if (_.isFunction(callback)) {
            callback.apply(null, arguments);
          }
        }
      }, function (err) {
        error = err;
      });
    };

    return {
      stopPolling: stop,
      startPolling: start,
      deleteHost: deleteHost,
      getClusters: getClusters,
      /* for testing */
      _isPolling: isPolling
    };
  }

  angular
    .module('Hercules')
    .service('ClusterProxy', ClusterProxy);

}());
