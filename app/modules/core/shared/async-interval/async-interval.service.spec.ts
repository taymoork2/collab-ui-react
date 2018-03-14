import testModule from './index';
import { AsyncIntervalService } from './async-interval.service';

type Test = atlas.test.IServiceTest<{
  $interval: ng.IIntervalService,
  AsyncIntervalService: AsyncIntervalService,
}>;

describe('AsyncIntervalService:', () => {
  beforeEach(function (this: Test) {
    this.initModules(testModule);
    this.injectDependencies(
      '$q',
      '$interval',
      'AsyncIntervalService',
    );

    jasmine.clock().install();
    jasmine.clock().mockDate();
  });

  afterEach(function (this: Test) {
    jasmine.clock().uninstall();
  });

  describe('interval():', () => {
    const INTERVAL_DURATION = 1000;

    beforeEach(function (this: Test) {
      this.intervalFunction = jasmine.createSpy('intervalFunction').and.callFake(() => {
        // create a new deferred each time the spy function is invoked
        this.intervalDeferred = this.$q.defer();
        return this.intervalDeferred.promise;
      });
    });
    it('should invoke interval function whenever async is not busy until interval is cancelled', function (this: Test) {
      const testInterval = this.AsyncIntervalService.interval(() => {
        return this.intervalFunction();
      }, INTERVAL_DURATION);
      this.$interval.flush(INTERVAL_DURATION - 1);

      expect(this.intervalFunction).not.toHaveBeenCalled();
      this.$interval.flush(1);
      expect(this.intervalFunction).toHaveBeenCalledTimes(1);

      // resolve the async interval function so interval function can fire again
      this.intervalDeferred.resolve();

      this.$interval.flush(INTERVAL_DURATION);
      expect(this.intervalFunction).toHaveBeenCalledTimes(2);

      // don't resolve the async interval function so interval function is skipped

      this.$interval.flush(INTERVAL_DURATION);
      expect(this.intervalFunction).toHaveBeenCalledTimes(2);

      // resolve the async interval function so interval function can fire again
      this.intervalDeferred.resolve();

      this.$interval.flush(INTERVAL_DURATION);
      expect(this.intervalFunction).toHaveBeenCalledTimes(3);

      // resolve the async interval function so interval function can fire again
      this.intervalDeferred.resolve();
      // cancel the interval so it doesn't fire anymore
      this.AsyncIntervalService.cancel(testInterval);

      this.$interval.flush(INTERVAL_DURATION);
      expect(this.intervalFunction).toHaveBeenCalledTimes(3);
    });
  });
});
