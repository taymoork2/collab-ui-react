class AsyncInterval {
  constructor(
    public interval: ng.IPromise<any> | undefined,
    public intervalFunction: () => ng.IPromise<any>,
    public isBusy = false,
  ) {}
}

/**
 * The purpose of this service is to behave like $interval, but not to invoke the interval callback
 * when the previous callback is still being resolved. Otherwise we run the risk of queueing an
 * unbound amount of asynchronous callbacks and overloading servers with requests.
 */
export class AsyncIntervalService {
  private intervals: AsyncInterval[] = [];

  /* @ngInject */
  constructor(
    private $interval: ng.IIntervalService,
  ) {}

  public interval(func: () => ng.IPromise<any>, delay: number, count?: number, invokeApply?: boolean, ...args: any[]): IPromise<any> {
    const interval = this.$interval(() => {
      const foundInterval = _.find(this.intervals, _interval => _interval.interval === interval);
      if (!foundInterval || foundInterval.isBusy) {
        return;
      }

      foundInterval.isBusy = true;
      foundInterval.intervalFunction().finally(() => {
        foundInterval.isBusy = false;
      });
    }, delay, count, invokeApply, ...args);

    this.intervals.push(new AsyncInterval(interval, func));

    return interval;
  }

  public cancel(interval?: ng.IPromise<any>): boolean {
    const foundInterval = _.find(this.intervals, _interval => _interval.interval === interval);
    if (!foundInterval) {
      return false;
    }

    _.pull(this.intervals, foundInterval);
    const cancelStatus = this.$interval.cancel(foundInterval.interval!);
    foundInterval.interval = undefined;
    return cancelStatus;
  }
}
