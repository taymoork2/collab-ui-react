class AsyncInterval {
  constructor(
    public interval: ng.IPromise<any>,
    public callbackFunction: () => ng.IPromise<any>,
    public isBusy = false,
  ) {}
}

/**
 * The purpose of this service is to behave like $interval, but not to invoke the interval callback
 * when the previous callback is still being resolved. Otherwise we run the risk of queueing an
 * unbound amount of asynchronous callbacks and overloading servers with requests.
 */
export class AsyncIntervalService {
  private asyncIntervals: AsyncInterval[] = [];

  /* @ngInject */
  constructor(
    private $interval: ng.IIntervalService,
  ) {}

  public interval(func: () => ng.IPromise<any>, delay: number, count?: number, invokeApply?: boolean, ...args: any[]): IPromise<any> {
    const intervalInstance = this.$interval(() => {
      const foundAsyncInterval = _.find(this.asyncIntervals, asyncInterval => asyncInterval.interval === intervalInstance);
      if (!foundAsyncInterval || foundAsyncInterval.isBusy) {
        return;
      }

      foundAsyncInterval.isBusy = true;
      foundAsyncInterval.callbackFunction().finally(() => {
        foundAsyncInterval.isBusy = false;
      });
    }, delay, count, invokeApply, ...args);

    this.asyncIntervals.push(new AsyncInterval(intervalInstance, func));

    return intervalInstance;
  }

  public cancel(interval?: ng.IPromise<any>): boolean {
    const foundAsyncInterval = _.find(this.asyncIntervals, asyncInterval => asyncInterval.interval === interval);
    if (!foundAsyncInterval) {
      return false;
    }

    _.pull(this.asyncIntervals, foundAsyncInterval);
    return this.$interval.cancel(foundAsyncInterval.interval);
  }
}
