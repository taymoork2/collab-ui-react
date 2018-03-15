export class CsdmPollerFactory {
  /* @ngInject  */
  constructor(private $timeout) {
  }

  public create(service, hub, options?) {
    return new CsdmPollerInstance(this.$timeout, service, hub, options);
  }
}

export class CsdmHubFactory {
  public create(): Hub {
    return new Hub();
  }
}

class Subscription {
  private listener;
  private event: any;
  private channels;
  private emitListenerRemoved;

  constructor(event, listener, channels, emitListenerRemoved) {
    this.listener = listener;
    this.channels = channels;
    this.emitListenerRemoved = emitListenerRemoved;

    this.event = event;
  }

  public cancel() {
    this.channels[this.event] = _.without(this.channels[this.event], this);
    this.emitListenerRemoved(this);
  }

  public notify(args) {
    this.listener.apply(this, args);
  }
}

export class Hub {
  private channels = {};
  private metaChannels = {};

  constructor() {
  }

  public on = (event, listener, opts) => {
    const subscription = new Subscription(event, listener, this.channels, (subscription) => {
      this.emitListenerRemoved(subscription);
    });
    this.channels[event] = this.channels[event] || [];
    this.channels[event].push(subscription);
    if (opts && opts.scope) {
      opts.scope.$on('$destroy', () => {

        subscription.cancel();
      });
    }
    this.emitListenerAdded(subscription);
    return subscription;
  }

  public onListener(event, listener) {
    this.metaChannels[event] = this.metaChannels[event] || [];
    this.metaChannels[event].push(listener);
  }

  private emitListenerAdded(subscription) {
    _.each(this.metaChannels['added'], (listener) => {
      listener(subscription.event);
    });
  }

  private emitListenerRemoved(subscription) {
    _.each(this.metaChannels['removed'], (listener) => {
      listener(subscription.event);
    });
  }

  public count(event) {
    return (this.channels[event] || []).length;
  }

  public emit(event, ...args) {
    _.each(this.channels[event], (subscription) => {
      subscription.notify(args);
    });
  }
}

class CsdmPollerInstance {
  private pollPromise;
  private defaultPollDelay: number;
  private pollDelay: any;
  /* @ngInject  */
  constructor(private $timeout, private service, private hub, options) {
    hub.onListener('added', event => this.listenerAdded(event));
    hub.onListener('removed', event => this.listenerRemoved(event));

    this.defaultPollDelay = (options && options.delay) || 30 * 1000;
    this.pollDelay = this.defaultPollDelay;
  }

  private listenerAdded(event) {
    if (event === 'data' && this.hub.count('data') === 1) {
      this.poll();
    }
  }

  private listenerRemoved(event) {
    if (event === 'data' && this.hub.count('data') === 0) {
      this.$timeout.cancel(this.pollPromise);
    }
  }

  private poll() {
    const notifyAll = (err, data) => {
      this.hub.emit('data', {
        error: err,
        data: data,
      });
      if (this.hub.count('data') > 0) {
        this.pollPromise = this.$timeout(() => this.poll(), this.pollDelay);
      }
    };
    this.service().then(_.partial(notifyAll, undefined), notifyAll);
  }

  public forceAction() {
    this.$timeout.cancel(this.pollPromise);
    this.poll();
  }

  public updateDelay(delay) {
    this.$timeout.cancel(this.pollPromise);
    this.pollDelay = delay;
    this.pollPromise = this.$timeout(() => this.poll(), delay);
  }

  public resetDelay() {
    this.updateDelay(this.defaultPollDelay);
  }
}

module.exports = angular
  .module('squared.csdm', [])
  .service('CsdmHubFactory', CsdmHubFactory)
  .service('CsdmPoller', CsdmPollerFactory)
  .name;

