import cacheModuleName from './index';

describe('CacheWarmUpService', () => {
  const orgId = 'cisco';
  const csdmUrl = 'https://www.csdm.com/';

  function init() {
    this.initModules(cacheModuleName);
    this.injectDependencies(
      '$httpBackend',
      '$interval',
      '$q',
      'Authinfo',
      'CacheWarmUpService',
      'UrlConfig',
    );
    spyOn(this.Authinfo, 'getOrgId').and.returnValue(orgId);
    spyOn(this.UrlConfig, 'getCsdmServiceUrl').and.returnValue(csdmUrl);

    this.numberOfExpectedRequests = 1;
    this.intervalDelay = 100000;

    this.expectCacheRequests = () => {
      // Add urls for other caches that should be warmed up here

      // strange that `$httpBackend.expectPOST` can't handle multiple requests
      // flushing 1 request actually flushes all requests on the expected endpoint
      // since we want to verify the number of queued requests and not the actual responses, use `$httpBackend.whenPOST`
      this.$httpBackend.whenPOST(`${csdmUrl}/organization/${orgId}/preloadCaches`).respond([200, {}]);
    };

    this.expectCacheRequestsAfterInterval = () => {
      this.$interval.flush(this.intervalDelay - 1);
      expect(() => this.$httpBackend.flush(this.numberOfExpectedRequests)).toThrow(); // nothing yet to flush
      this.$interval.flush(1);
      expect(() => this.$httpBackend.flush(this.numberOfExpectedRequests)).not.toThrow(); // flush number of expected requests
      expect(() => this.$httpBackend.flush(this.numberOfExpectedRequests)).toThrow(); // nothing afterwards to flush
    };

    jasmine.clock().install();
    jasmine.clock().mockDate();
  }

  beforeEach(init);

  afterEach(function () {
    jasmine.clock().uninstall();

    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  it('should warm up all caches for admins', function () {
    spyOn(this.Authinfo, 'isAdmin').and.returnValue(true);
    this.expectCacheRequests();

    this.CacheWarmUpService.warmUpCaches().catch((error) => {
      fail(error);
    });
    this.$httpBackend.flush(this.numberOfExpectedRequests);
  });

  it('should not warm up any cache for non admins', function() {
    spyOn(this.Authinfo, 'isAdmin').and.returnValue(false);
    this.CacheWarmUpService.warmUpCaches().catch((error) => {
      fail(error);
    });
  });

  it('should warm caches up on an interval', function () {
    spyOn(this.Authinfo, 'isAdmin').and.returnValue(true);
    this.expectCacheRequests();

    this.CacheWarmUpService.warmUpOnInterval().catch(error => expect(error).toBe('canceled'));
    this.$httpBackend.flush(this.numberOfExpectedRequests);

    this.expectCacheRequestsAfterInterval();
    this.expectCacheRequestsAfterInterval();

    // retriggering interval should cancel previous interval gracefully
    this.CacheWarmUpService.warmUpOnInterval().catch(error => fail(error));
    this.$httpBackend.flush(this.numberOfExpectedRequests);

    this.expectCacheRequestsAfterInterval();
    this.expectCacheRequestsAfterInterval();
  });
});
