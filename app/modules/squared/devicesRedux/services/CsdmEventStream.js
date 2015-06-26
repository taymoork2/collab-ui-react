(function () {
  'use strict';
  /* @ngInject  */
  function CsdmEventStream($timeout, CsdmService) {
    var subscriptions = {};
    var subscriptionCount = 0;
    var activeSubscriptionsCount = 0;
    var pollPromise, pollDelay = 5000;

    function poll() {
      CsdmService.fillCodesAndDevicesCache(function (err, devices) {
        _.forEach(subscriptions, function (subscription) {
          subscription.doIt(err, devices);
        });
        pollPromise = $timeout(poll, pollDelay);
      });
    }

    function subscribe(callback, options) {
      options = options || {};
      var subscription = new Subscription(subscriptionCount++, callback);
      subscriptions[subscription.id] = subscription;
      if (activeSubscriptionsCount === 0) {
        poll();
      }
      activeSubscriptionsCount++;
      if (options.scope) {
        options.scope.$on('$destroy', subscription.cancel);
      }
      return subscription;
    }

    function Subscription(id, callback) {
      this.id = id;
      this.callback = callback;
      this.eventCount = 0;
      this.currentError = null;

      this.doIt = function (err, devices) {
        this.eventCount++;
        this.currentError = err;
        if (!err) {
          this.callback(devices);
        }
      };

      this.cancel = function () {
        delete subscriptions[this.id];
        activeSubscriptionsCount--;
        if (activeSubscriptionsCount === 0) {
          $timeout.cancel(pollPromise);
        }
      };
    }

    return {
      subscribe: subscribe
    };
  }

  angular.module('Squared').service('CsdmEventStream', CsdmEventStream);

})();
