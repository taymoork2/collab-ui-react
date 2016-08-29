(function () {
  'use strict';

  /* @ngInject  */
  function CsdmPoller($injector) {
    function create(service, hub, options) {
      return $injector.instantiate(CsdmPollerInstance, {
        hub: hub,
        service: service,
        options: options || {}
      });
    }
    return {
      create: create
    };
  }

  function CsdmHubFactory() {
    return {
      create: function () {
        return new Hub();
      }
    };
  }

  function Hub() {
    var channels = {};
    var metaChannels = {};

    function Subscription(event, listener) {
      var subscription = this;

      this.event = event;

      this.eventCount = 0;

      this.cancel = function () {
        channels[event] = _.without(channels[event], subscription);
        emitListenerRemoved(subscription);
      };

      this.notify = function (args) {
        listener.apply(this, args);
        subscription.eventCount++;
      };
    }

    function on(event, listener, opts) {
      var subscription = new Subscription(event, listener);
      channels[event] = channels[event] || [];
      channels[event].push(subscription);
      if (opts && opts.scope) {
        opts.scope.$on('$destroy', function () {
          subscription.cancel();
        });
      }
      emitListenerAdded(subscription);
      return subscription;
    }

    function onListener(event, listener) {
      metaChannels[event] = metaChannels[event] || [];
      metaChannels[event].push(listener);
    }

    function emitListenerAdded(subscription) {
      _.each(metaChannels['added'], function (listener) {
        listener(subscription.event);
      });
    }

    function emitListenerRemoved(subscription) {
      _.each(metaChannels['removed'], function (listener) {
        listener(subscription.event);
      });
    }

    function count(event) {
      return (channels[event] || []).length;
    }

    function emit(event) {
      var args = arguments;
      _.each(channels[event], function (subscription) {
        subscription.notify([].slice.call(args, 1));
      });
    }

    return {
      on: on,
      emit: emit,
      count: count,
      onListener: onListener
    };
  }

  /* @ngInject  */
  function CsdmPollerInstance($timeout, service, hub, options) {
    hub.onListener('added', listenerAdded);
    hub.onListener('removed', listenerRemoved);

    var pollPromise;
    var defaultPollDelay = options.delay || 30 * 1000;
    var pollDelay = defaultPollDelay;

    function listenerAdded(event) {
      if (event == 'data' && hub.count('data') == 1) {
        poll();
      }
    }

    function listenerRemoved(event) {
      if (event == 'data' && hub.count('data') === 0) {
        $timeout.cancel(pollPromise);
      }
    }

    function poll() {
      function notifyAll(err, data) {
        hub.emit('data', {
          error: err,
          data: data
        });
        if (hub.count('data') > 0) {
          pollPromise = $timeout(poll, pollDelay);
        }
      }
      service().then(_.partial(notifyAll, undefined), notifyAll);
    }

    function forceAction() {
      $timeout.cancel(pollPromise);
      poll();
    }

    function updateDelay(delay) {
      $timeout.cancel(pollPromise);
      pollDelay = delay;
      pollPromise = $timeout(poll, delay);
    }

    function resetDelay() {
      updateDelay(defaultPollDelay);
    }

    return {
      forceAction: forceAction,
      updateDelay: updateDelay,
      resetDelay: resetDelay
    };
  }

  angular.module('Squared')
    .service('CsdmHubFactory', CsdmHubFactory)
    .service('CsdmPoller', CsdmPoller);

})();
