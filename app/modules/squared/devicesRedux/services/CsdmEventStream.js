'use strict';

(function () {
  /* @ngInject  */
  function CsdmEventStream($timeout, CsdmService) {
    var subscriptions = {};
    var subscriptionCount = 0;
    var activeSubscriptionsCount = 0;
    var pollPromise, pollDelay = 5000;

    function poll() {
      CsdmService.fillCodesAndDevicesCache(function (err, devices) {
        _.forEach(subscriptions, function (subscription) {
          if (!err) {
            subscription(devices);
          }
        });
        pollPromise = $timeout(poll, pollDelay);
      });
    }

    function cancelSubscription(subscriptionId) {
      delete subscriptions[subscriptionId];
      activeSubscriptionsCount--;
      if (activeSubscriptionsCount === 0) {
        $timeout.cancel(pollPromise);
      }
    }

    function subscribe(callback, options) {
      options = options || {};
      var subscriptionId = subscriptionCount++;
      subscriptions[subscriptionId] = callback;
      if (activeSubscriptionsCount === 0) {
        poll();
      }
      activeSubscriptionsCount++;
      var cancel = _.bind(cancelSubscription, subscriptionId);
      if (options.scope) {
        options.scope.$on('$destroy', cancel);
      }
      return {
        count: function () {
          throw "Not implemented";
        },
        cancel: cancel
      };
    }

    return {
      subscribe: subscribe
    };
  }

  angular.module('Squared').service('CsdmEventStream', CsdmEventStream);

})();
