(function () {
  'use strict';
  /* @ngInject  */

  function CsdmEventStream($injector) {
    function create(poller) {
      return $injector.instantiate(CsdmEventStreamInstance, {
        poller: poller
      });
    }
    return {
      create: create
    };
  }

  /* @ngInject  */
  function CsdmEventStreamInstance($timeout, poller, $log) {

    var subscriptions = {};
    var subscriptionCount = 0;
    var activeSubscriptionsCount = 0;
    var pollPromise, pollDelay = 5000;

    function poll() {
      $log.debug('polling', poller);

      function notifyAll(err, devices) {
        _.forEach(subscriptions, function (subscription) {
          subscription.doIt(err, devices);
        });
        pollPromise = $timeout(poll, pollDelay);
      }
      poller().then(_.partial(notifyAll, undefined), notifyAll);
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

  /* @ngInject */
  function CodeListService(CsdmEventStream, CsdmService) {
    return CsdmEventStream.create(CsdmService.fetchCodeList);
  }

  /* @ngInject */
  function DeviceListService(CsdmEventStream, CsdmService) {
    return CsdmEventStream.create(CsdmService.fetchDeviceList);
  }

  angular.module('Squared')
    .service('CsdmEventStream', CsdmEventStream)
    .service('CodeListService', CodeListService)
    .service('DeviceListService', DeviceListService);

})();
