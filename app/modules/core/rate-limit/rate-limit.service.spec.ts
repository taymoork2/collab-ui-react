import rateLimit from './index';

describe('RateLimitService', () => {
  beforeEach(function () {
    this.initModules(rateLimit);
    this.injectDependencies(
      '$http',
      '$httpBackend',
      '$timeout',
      'RateLimitService',
    );

    jasmine.clock().install();
    jasmine.clock().mockDate();

    installPromiseMatchers();
  });

  afterEach(function () {
    jasmine.clock().uninstall();

    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  describe('hasBeenThrottled()', () => {
    it('should only throttle for 429 responses', function () {
      expect(this.RateLimitService.hasBeenThrottled()).toBe(false);
      expect(this.RateLimitService.hasBeenThrottled({
        status: 500,
      })).toBe(false);
      expect(this.RateLimitService.hasBeenThrottled({
        status: 429,
      })).toBe(true);
    });
  });

  describe('retryThrottledResponse()', () => {
    beforeEach(function () {
      // overwrite service defaults for testing
      this.RateLimitService.MIN_DELAY = 100;
      this.RateLimitService.MAX_DELAY = 1000;
      this.URL = '/rate-limited-url';
    });

    it('should reject if no http config', function () {
      expect(this.RateLimitService.retryThrottledResponse('some error')).toBeRejectedWith('some error');
    });

    it('should reject if has exhausted retries', function () {
      const errorResponse = {
        config: {
          retryConfig: {
            isLastRetry: true,
          },
          status: 429,
        },
      };
      expect(this.RateLimitService.retryThrottledResponse(errorResponse)).toBeRejectedWith(errorResponse);
    });

    describe('with recommended Retry-After header', () => {
      beforeEach(function () {
        this.RateLimitService.MAX_DELAY = 2000;
      });

      it('should retry a request within the exponential backoff range after the Retry-After value', function () {
        this.$httpBackend.expectGET(this.URL).respond(200);

        const throttledResponse = {
          config: {
            method: 'GET',
            url: this.URL,
            status: 429,
          },
          headers: jasmine.createSpy('headers').and.returnValue('.8'), // 800ms
        };

        const delay = 800;
        const response = this.RateLimitService.retryThrottledResponse(throttledResponse);
        expect(throttledResponse.headers).toHaveBeenCalledWith('Retry-After');
        this.$timeout.flush(delay - 1);
        expect(this.$httpBackend.flush).toThrow(); // nothing to flush yet

        this.$timeout.flush(delay + 1); // covered delay + jitter
        expect(this.$httpBackend.flush).not.toThrow(); // retried request

        expect(response).toBeResolvedWith(jasmine.objectContaining({
          status: 200,
        }));
      });

      it('should retry a request with the MAX_DELAY if the Retry-After value is too large', function () {
        this.$httpBackend.expectGET(this.URL).respond(200);

        const throttledResponse = {
          config: {
            method: 'GET',
            url: this.URL,
            status: 429,
          },
          headers: jasmine.createSpy('headers').and.returnValue('2.5'),
        };

        const delay = 2000;
        const response = this.RateLimitService.retryThrottledResponse(throttledResponse);
        this.$timeout.flush(delay - 1);
        expect(this.$httpBackend.flush).toThrow(); // nothing to flush yet

        this.$timeout.flush(delay + 1); // covered delay + jitter
        expect(this.$httpBackend.flush).not.toThrow(); // retried request

        expect(response).toBeResolvedWith(jasmine.objectContaining({
          status: 200,
          config: jasmine.objectContaining({
            retryConfig: jasmine.objectContaining({
              isLastRetry: true,
            }),
          }),
        }));
      });
    });

    describe('without recommended Retry-After header', () => {
      it('should retry an initial request after a minimum delay period', function () {
        this.$httpBackend.expectGET(this.URL).respond(200);

        const throttledResponse = {
          config: {
            method: 'GET',
            url: this.URL,
            status: 429,
          },
        };
        const delay = this.RateLimitService.MIN_DELAY;
        const response = this.RateLimitService.retryThrottledResponse(throttledResponse);
        this.$timeout.flush(delay - 1);
        expect(this.$httpBackend.flush).toThrow(); // nothing to flush yet

        this.$timeout.flush(delay + 1); // covered delay + jitter
        expect(this.$httpBackend.flush).not.toThrow(); // retried request

        expect(response).toBeResolvedWith(jasmine.objectContaining({
          status: 200,
        }));
      });

      it('should retry a request after an attempted exponential backoff delay period', function () {
        this.$httpBackend.expectGET(this.URL).respond(200);

        const throttledResponse = {
          config: {
            method: 'GET',
            url: this.URL,
            status: 429,
            retryConfig: {
              baseMultiplier: 4,
            },
          },
        };
        const delay = this.RateLimitService.MIN_DELAY * throttledResponse.config.retryConfig.baseMultiplier;
        const response = this.RateLimitService.retryThrottledResponse(throttledResponse);
        this.$timeout.flush(delay - 1);
        expect(this.$httpBackend.flush).toThrow(); // nothing to flush yet

        this.$timeout.flush(delay + 1); // covered delay + jitter
        expect(this.$httpBackend.flush).not.toThrow(); // retried request

        expect(response).toBeResolvedWith(jasmine.objectContaining({
          status: 200,
        }));
      });

      it('should retry a request after a max delay period', function () {
        this.$httpBackend.expectGET(this.URL).respond(200);

        const throttledResponse = {
          config: {
            method: 'GET',
            url: this.URL,
            status: 429,
            retryConfig: {
              baseMultiplier: 100,
            },
          },
        };
        const delay = this.RateLimitService.MAX_DELAY;
        const response = this.RateLimitService.retryThrottledResponse(throttledResponse);
        this.$timeout.flush(delay - 1);
        expect(this.$httpBackend.flush).toThrow(); // nothing to flush yet

        this.$timeout.flush(delay + 1); // covered delay + jitter
        expect(this.$httpBackend.flush).not.toThrow(); // retried request

        expect(response).toBeResolvedWith(jasmine.objectContaining({
          status: 200,
          config: jasmine.objectContaining({
            retryConfig: jasmine.objectContaining({
              isLastRetry: true,
            }),
          }),
        }));
      });
    });
  });
});
