export class RetryingPromiseService {

  /* @ngInject */
  constructor(
      private $q: ng.IQService,
      private $timeout: ng.ITimeoutService,
  ) {}

  public tryUntil(
    tryFn: (...args: any[]) => {} | ng.IPromise<{}>,
    expectedResult: any,
    options: {
      callCounter?: number,
      maxCalls?: number,
      startDelay?: number,
      backOffFn?: Function,
    } = {}): ng.IPromise<any> {

    const DEFAULT_CALL_COUNTER = 1;
    const DEFAULT_MAX_CALLS = 3;
    const MAX_CALLS_HIGH_LIMIT = 10;
    const DELAY_500_MS = 500;

    let {
      callCounter = DEFAULT_CALL_COUNTER,
      maxCalls = DEFAULT_MAX_CALLS,
      startDelay = DELAY_500_MS,
    } = options;

    const {
      backOffFn = (delay) => delay * 2,
    } = options;

    // prevent max calls from being too aggressive
    maxCalls = maxCalls > MAX_CALLS_HIGH_LIMIT ? MAX_CALLS_HIGH_LIMIT : maxCalls;

    // prevent delay from being set too short
    startDelay = startDelay < DELAY_500_MS ? DELAY_500_MS : startDelay;

    // reject after max calls exceeded
    if (callCounter > maxCalls) {
      return this.$q.reject(`max calls (${maxCalls}) exceeded.`);
    }

    // call the given function after delay has elapsed
    return this.$timeout(tryFn, startDelay)
      .then((_expectedResult) => {
        // expected result arrived, simply resolve with it
        if (_.isEqual(_expectedResult, expectedResult)) {
          return expectedResult;
        }

        // otherwise recurse, increasing the delay amount
        // double the delay amount for next call
        callCounter = callCounter + 1;
        startDelay = backOffFn(startDelay);
        return this.tryUntil(tryFn, expectedResult, {
          callCounter,
          maxCalls,
          startDelay,
          backOffFn,
        });
      });
  }
}
