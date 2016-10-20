(function () {
  'use strict';

  /* @ngInject */
  function HelpdeskHttpRequestCanceller($q, $timeout) {

    var cancelPromises = [];
    var defaultTimeout = 30000;

    function newCancelableTimeout(searchTimeout) {
      searchTimeout = searchTimeout || defaultTimeout;

      var cancelPromise = $q.defer();
      cancelPromises.push(cancelPromise);

      cancelPromise.promise.cancelled = false;
      cancelPromise.promise.timedout = false;

      cancelPromise.promise.timer = $timeout(function () {
        cancelPromise.resolve();
        cancelPromise.promise.timedout = true;
      }, searchTimeout);

      return cancelPromise.promise;
    }

    function nrOfRegisteredRequests() {
      return cancelPromises.length;
    }

    function empty() {
      return cancelPromises.length === 0;
    }

    function cancelAll() {
      var cancelled = $q.defer();
      if (nrOfRegisteredRequests() > 0) {
        _.forEach(cancelPromises, function (cancelPromise) {
          cancelPromise.resolve();
          cancelPromise.promise.cancelled = $timeout.cancel(cancelPromise.promise.timer);
          cancelPromise.promise.timedout = false;
        });
        forceDigestCycle(cancelled);
      } else {
        cancelled.resolve(0);
      }
      return cancelled.promise;
    }

    function forceDigestCycle(cancelled) {
      // Use this timeout to "force" the digest cycle resolve the 'cancelled' promises
      // In order to force this in test, timer must be flushed.
      $timeout(function () {
        cancelled.resolve(nrOfRegisteredRequests());
        cancelPromises.length = 0;
      }, 1);
    }

    return {
      newCancelableTimeout: newCancelableTimeout,
      cancelAll: cancelAll,
      nrOfRegisteredRequests: nrOfRegisteredRequests,
      empty: empty
    };
  }

  angular.module('Squared')
    .service('HelpdeskHttpRequestCanceller', HelpdeskHttpRequestCanceller);
}());
