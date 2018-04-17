class WaitingInterval {
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
export class WaitingIntervalService {
  private waitingIntervals: WaitingInterval[] = [];

  /* @ngInject */
  constructor(
    private $interval: ng.IIntervalService,
  ) {}

  public interval(func: () => ng.IPromise<any>, delay: number, count?: number, invokeApply?: boolean, ...args: any[]): IPromise<any> {
    const intervalInstance = this.$interval(() => {
      const foundWaitingInterval = _.find(this.waitingIntervals, waitingInterval => waitingInterval.interval === intervalInstance);
      if (!foundWaitingInterval || foundWaitingInterval.isBusy) {
        return;
      }

      foundWaitingInterval.isBusy = true;
      foundWaitingInterval.callbackFunction().finally(() => {
        foundWaitingInterval.isBusy = false;
      });
    }, delay, count, invokeApply, ...args);

    this.waitingIntervals.push(new WaitingInterval(intervalInstance, func));

    return intervalInstance;
  }

  public cancel(interval?: ng.IPromise<any>): boolean {
    const foundWaitingInterval = _.find(this.waitingIntervals, waitingInterval => waitingInterval.interval === interval);
    if (!foundWaitingInterval) {
      return false;
    }

    _.pull(this.waitingIntervals, foundWaitingInterval);
    return this.$interval.cancel(foundWaitingInterval.interval);
  }
}
