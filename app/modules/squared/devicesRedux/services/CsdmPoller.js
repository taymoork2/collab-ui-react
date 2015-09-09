(function () {
  'use strict';

  /* @ngInject  */
  function CsdmPoller($injector) {
    function create(service) {
      return $injector.instantiate(CsdmPollerInstance, {
        service: service
      });
    }
    return {
      create: create
    };
  }

  /* @ngInject  */
  function CsdmPollerInstance($timeout, service, $log) {
    var subscriptions = {};
    var subscriptionCount = 0;
    var activeSubscriptionsCount = 0;
    var pollPromise, pollDelay = 30000;

    function poll() {
      $log.debug('polling', service);

      function notifyAll(err, devices) {
        _.forEach(subscriptions, function (subscription) {
          subscription.doIt(err, devices);
        });
        if (activeSubscriptionsCount > 0) {
          pollPromise = $timeout(poll, pollDelay);
        }
      }
      service().then(_.partial(notifyAll, undefined), notifyAll);
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
        options.scope.$on('$destroy', function () {
          subscription.cancel();
          $log.debug('Subscription cancelled', subscription);
        });
      }
      return subscription;
    }

    function Subscription(id, callback) {
      this.id = id;
      this.eventCount = 0;
      this.callback = callback;
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

  angular.module('Squared')
    .service('CsdmPoller', CsdmPoller);

})();
