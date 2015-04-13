'use strict';

angular.module('Hercules')
  .service('ClusterProxy', ['$interval', 'ConnectorService',
    function ClusterProxy($interval, connectorService) {
      var pollPromise,
        error = null,
        clusters = [],
        pollCount = 0,
        pollDelay = 1000,
        pollInFlight = false;

      var start = function (callback) {
        pollCount++;
        togglePolling(callback);
      };

      var stop = function () {
        if (pollCount > 0) pollCount--;
        togglePolling();
      };

      var deleteHost = function (clusterId, serial, callback) {
        connectorService.deleteHost(clusterId, serial, function () {
          $interval.flush(pollDelay);
          callback.apply(arguments);
        });
      };

      var getClusters = function () {
        return {
          error: error,
          clusters: clusters
        };
      };

      var upgradeSoftware = function (clusterId, serviceType, callback, opts) {
        connectorService.upgradeSoftware(clusterId, serviceType, function () {
          $interval.flush(pollDelay);
          callback.apply(arguments);
        }, opts);
      };

      var isPolling = function () {
        return !!pollCount;
      };

      var togglePolling = function (callback) {
        if (pollCount <= 0) {
          $interval.cancel(pollPromise);
          pollInFlight = false;
          return;
        }
        if (pollInFlight) {
          return;
        }
        pollInFlight = true;
        pollPromise = $interval(_.bind(reload, null, callback), pollDelay, 1);
      };

      var reload = function (callback) {
        connectorService.fetch(function (err, _clusters) {
          error = err;
          clusters = _clusters || [];
          pollInFlight = false;
          togglePolling();
          if (callback) {
            callback.apply(null, arguments);
          }
        }, {
          squelchErrors: true
        });
      };

      return {
        stopPolling: stop,
        startPolling: start,
        deleteHost: deleteHost,
        getClusters: getClusters,
        upgradeSoftware: upgradeSoftware,
        /* for testing */
        _isPolling: isPolling
      };
    }
  ]);
