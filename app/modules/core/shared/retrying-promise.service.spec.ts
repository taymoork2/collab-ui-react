import moduleName from './index';
import { RetryingPromiseService } from './retrying-promise.service';

type Test = atlas.test.IServiceTest<{
  $timeout: ng.ITimeoutService,
  RetryingPromiseService: RetryingPromiseService,
}>;

describe('LicenseUsageUtilService:', () => {
  let DEFAULT_DELAY_500_MS = 500;

  beforeEach(function (this: Test) {
    this.initModules(moduleName);
    this.injectDependencies(
      '$timeout',
      'RetryingPromiseService',
    );
  });

  describe('tryUntil():', () => {
    describe('default behaviors:', () => {
      it('should call the given function arg after an initial delay of 500ms', function (this: Test) {
        const fooFn = jasmine.createSpy('fooFn');
        this.RetryingPromiseService.tryUntil(fooFn, 'foo');
        this.$timeout.flush(499);
        expect(fooFn).not.toHaveBeenCalled();
        this.$timeout.flush(1);
        expect(fooFn).toHaveBeenCalled();
      });

      it('should retry up to 2 times, doubling the delay each time, if the function did not resolve with the expected result', function (this: Test, done) {
        const fooFn = jasmine.createSpy('fooFn').and.returnValue(this.$q.resolve('bar')); // incorrect result on the first try
        this.RetryingPromiseService.tryUntil(fooFn, 'foo').then((expectedResult) => {
          expect(expectedResult).toBe('foo');
          done();
        });
        this.$timeout.flush(DEFAULT_DELAY_500_MS);
        expect(fooFn.calls.count()).toBe(1);

        fooFn.and.returnValue(this.$q.resolve('bar')); // assume incorrect result on second try
        this.$timeout.flush(DEFAULT_DELAY_500_MS * 2); // second try waits 2x longer before firing
        expect(fooFn.calls.count()).toBe(2);

        fooFn.and.returnValue(this.$q.resolve('foo')); // assume correct result on third try
        this.$timeout.flush(DEFAULT_DELAY_500_MS * 2 * 2); // third try waits 2x longer before firing
        expect(fooFn.calls.count()).toBe(3);
      });

      it('should reject if the given function arg rejects', function (this: Test, done) {
        const fooFn = jasmine.createSpy('fooFn').and.returnValue(this.$q.reject());
        this.RetryingPromiseService.tryUntil(fooFn, 'foo').catch(() => {
          done();
        });
        this.$timeout.flush(500);
      });

      it('should should reject if max number of calls (3) has been tried, and expected result is still not resolved', function (this: Test, done) {
        const fooFn = jasmine.createSpy('fooFn').and.returnValue(this.$q.resolve('bar')); // incorrect result
        this.RetryingPromiseService.tryUntil(fooFn, 'foo').catch((msg) => {
          expect(msg).toBe('max calls (3) exceeded.');
          done();
        });
        this.$timeout.flush(DEFAULT_DELAY_500_MS);
        this.$timeout.flush(DEFAULT_DELAY_500_MS * 2);
        this.$timeout.flush(DEFAULT_DELAY_500_MS * 2 * 2);
        this.$timeout.flush(DEFAULT_DELAY_500_MS * 2 * 2 * 2);
      });
    });

    describe('optional overrides:', () => {
      describe('startDelay:', () => {
        it('should delay calling the function arg using the "startDelay" property from the options arg', function (this: Test) {
          const fooFn = jasmine.createSpy('fooFn');
          const CUSTOM_DELAY_999_MS = 999;
          this.RetryingPromiseService.tryUntil(fooFn, 'foo', {
            startDelay: CUSTOM_DELAY_999_MS,
          });
          this.$timeout.flush(DEFAULT_DELAY_500_MS);
          expect(fooFn).not.toHaveBeenCalled();

          this.$timeout.flush(CUSTOM_DELAY_999_MS - 500); // tick forward until custom delay value is reached
          expect(fooFn).toHaveBeenCalled();
        });
      });

      describe('maxCalls:', () => {
        it('should call the function arg up to value specified by "maxCalls" from options arg', function (this: Test, done) {
          const fooFn = jasmine.createSpy('fooFn').and.returnValue(this.$q.resolve('bar')); // incorrect result
          const CUSTOM_MAX_CALLS = 1;
          this.RetryingPromiseService.tryUntil(fooFn, 'foo', {
            maxCalls: CUSTOM_MAX_CALLS,
          }).catch((msg) => {
            expect(msg).toBe('max calls (1) exceeded.');
            done();
          });
          this.$timeout.flush(DEFAULT_DELAY_500_MS);
          this.$timeout.flush(DEFAULT_DELAY_500_MS * 2);
        });

        it('should call the function arg only up to 10 times if "maxCalls" from options arg is greater than 10', function (this: Test, done) {
          const fooFn = jasmine.createSpy('fooFn').and.returnValue(this.$q.resolve('bar')); // incorrect result
          const CUSTOM_MAX_CALLS = 11;
          const CUSTOM_BACKOFF_FN = (delay) => delay;
          this.RetryingPromiseService.tryUntil(fooFn, 'foo', {
            maxCalls: CUSTOM_MAX_CALLS,
            backOffFn: CUSTOM_BACKOFF_FN,
          }).catch((msg) => {
            expect(msg).toBe('max calls (10) exceeded.');
            done();
          });
          // tick forward 11 times, 10th time will reject
          _.times(11, () => {
            this.$timeout.flush(DEFAULT_DELAY_500_MS);
          });
        });
      });

      describe('startDelay:', () => {
        it('should call the function arg after delay of value from "startDelay" from options arg', function (this: Test) {
          const fooFn = jasmine.createSpy('fooFn');
          const CUSTOM_START_DELAY_1_SEC = 1000;
          this.RetryingPromiseService.tryUntil(fooFn, 'foo', {
            startDelay: CUSTOM_START_DELAY_1_SEC,
          });
          this.$timeout.flush(DEFAULT_DELAY_500_MS);
          expect(fooFn).not.toHaveBeenCalled();
          this.$timeout.flush(DEFAULT_DELAY_500_MS);
          expect(fooFn).toHaveBeenCalled();
        });

        it('should call use minimum 500ms delay if "startDelay" from options arg is less than 500ms', function (this: Test) {
          const fooFn = jasmine.createSpy('fooFn');
          const CUSTOM_START_DELAY_1_MS = 1;
          this.RetryingPromiseService.tryUntil(fooFn, 'foo', {
            startDelay: CUSTOM_START_DELAY_1_MS,
          });
          this.$timeout.flush(CUSTOM_START_DELAY_1_MS);
          expect(fooFn).not.toHaveBeenCalled();
          this.$timeout.flush(DEFAULT_DELAY_500_MS - CUSTOM_START_DELAY_1_MS);
          expect(fooFn).toHaveBeenCalled();
        });
      });

      describe('backOffFn:', () => {
        it('should increment the delay for each subsequent call using "backOffFn" property from options arg', function (this: Test) {
          const fooFn = jasmine.createSpy('fooFn');
          const CUSTOM_DELAY_INCREMENT_1_SEC = 5000;
          const CUSTOM_BACKOFF_FN = (delay) => delay + CUSTOM_DELAY_INCREMENT_1_SEC;
          this.RetryingPromiseService.tryUntil(fooFn, 'foo', {
            backOffFn: CUSTOM_BACKOFF_FN,
          });
          this.$timeout.flush(DEFAULT_DELAY_500_MS);
          expect(fooFn.calls.count()).toBe(1);
          this.$timeout.flush(DEFAULT_DELAY_500_MS + CUSTOM_DELAY_INCREMENT_1_SEC);
          expect(fooFn.calls.count()).toBe(2);
        });
      });
    });
  });
});
