import testModule from './index';

describe('RateLimitInterceptor', () => {
  beforeEach(function () {
    this.initModules(testModule);

    this.injectDependencies(
      '$http',
      '$httpBackend',
      '$timeout',
      'MetricsService',
      'RateLimitService',
    );

    spyOn(this.MetricsService, 'trackOperationalMetric');

    jasmine.clock().install();
    jasmine.clock().mockDate();

    this.URL = '/rate-limited-url';

    // overwrite service defaults for testing
    this.RateLimitService.HAS_JITTER = false;
    this.RateLimitService.MIN_DELAY = 100;
    this.RateLimitService.MAX_DELAY = 1000;

    installPromiseMatchers();

    this.expectOperationalMetric = (index: number, props: Object) => {
      expect(this.MetricsService.trackOperationalMetric.calls.argsFor(index)).toEqual(['atlas_rate_limit_retry', _.assign({
        request_method: 'GET',
        request_url: this.URL,
        tracking_id: undefined,
      }, props)]);
    };
  });

  afterEach(function () {
    jasmine.clock().uninstall();

    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  it('should retry until some success code', function () {
    this.$httpBackend.expectGET(this.URL).respond(429);
    const promise = this.$http.get(this.URL);
    this.$httpBackend.flush();

    this.$httpBackend.expectGET(this.URL).respond(503);
    this.$timeout.flush(100);
    this.$httpBackend.flush();

    this.$httpBackend.expectGET(this.URL).respond(200);
    this.$timeout.flush(200);
    this.$httpBackend.flush();

    expect(promise).toBeResolvedWith(jasmine.objectContaining({
      status: 200,
    }));
    this.expectOperationalMetric(0, {
      state: 'retry',
      delay_in_millis: 100,
      orig_http_status: 429,
    });
    this.expectOperationalMetric(1, {
      state: 'success',
      delay_in_millis: 200,
      orig_http_status: 503,
    });
  });

  it('should retry until some error code', function () {
    this.$httpBackend.expectGET(this.URL).respond(503);
    this.$http.get(this.URL).catch(response => {
      expect(response.status).toBe(500);
      this.expectOperationalMetric(0, {
        state: 'retry',
        delay_in_millis: 100,
        orig_http_status: 503,
      });
      this.expectOperationalMetric(1, {
        state: 'success', // still a "successful" retry even with 500 status code
        delay_in_millis: 200,
        orig_http_status: 429,
      });
    });
    this.$httpBackend.flush();

    this.$httpBackend.expectGET(this.URL).respond(429);
    this.$timeout.flush(100);
    this.$httpBackend.flush();

    this.$httpBackend.expectGET(this.URL).respond(500);
    this.$timeout.flush(200);
    this.$httpBackend.flush();
  });

  it('should retry until max retry delay', function () {
    this.$httpBackend.expectGET(this.URL).respond(503);
    this.$http.get(this.URL).catch(response => {
      expect(response.status).toBe(429);
      this.expectOperationalMetric(0, {
        state: 'retry',
        delay_in_millis: 100,
        orig_http_status: 503,
      });
      this.expectOperationalMetric(1, {
        state: 'retry',
        delay_in_millis: 200,
        orig_http_status: 503,
      });
      this.expectOperationalMetric(2, {
        state: 'retry',
        delay_in_millis: 400,
        orig_http_status: 503,
      });
      this.expectOperationalMetric(3, {
        state: 'retry',
        delay_in_millis: 800,
        orig_http_status: 429,
      });
      this.expectOperationalMetric(4, {
        state: 'fail',
        delay_in_millis: 1000,
        orig_http_status: 429,
      });
    });
    this.$httpBackend.flush();

    this.$httpBackend.expectGET(this.URL).respond(503);
    this.$timeout.flush(100);
    this.$httpBackend.flush();

    this.$httpBackend.expectGET(this.URL).respond(503);
    this.$timeout.flush(200);
    this.$httpBackend.flush();

    this.$httpBackend.expectGET(this.URL).respond(429);
    this.$timeout.flush(400);
    this.$httpBackend.flush();

    this.$httpBackend.expectGET(this.URL).respond(429);
    this.$timeout.flush(800);
    this.$httpBackend.flush();

    this.$httpBackend.expectGET(this.URL).respond(429);
    this.$timeout.flush(1000);
    this.$httpBackend.flush();
  });
});
