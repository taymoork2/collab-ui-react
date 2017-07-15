describe('CacheWarmUpService', () => {
  const orgId = 'cisco';
  const csdmUrl = 'https://www.csdm.com/';

  function init() {
    this.initModules('Core');
    this.injectDependencies(
      '$httpBackend',
      '$q',
      'Authinfo',
      'CacheWarmUpService',
      'UrlConfig',
    );
    spyOn(this.Authinfo, 'getOrgId').and.returnValue(orgId);
    spyOn(this.UrlConfig, 'getCsdmServiceUrl').and.returnValue(csdmUrl);
  }

  beforeEach(init);

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  it('should warm up all caches for admins', function () {
    spyOn(this.Authinfo, 'isAdmin').and.returnValue(true);

    // Add urls for other caches that should be warmed up here
    this.$httpBackend.expectPOST(`${csdmUrl}/organization/${orgId}/preloadCaches`).respond(200, {});

    this.CacheWarmUpService.warmUpCaches().catch((error) => {
      fail(error);
    });
    this.$httpBackend.flush();
  });

  it('should not warm up any cache for non admins', function() {
    spyOn(this.Authinfo, 'isAdmin').and.returnValue(false);
    this.CacheWarmUpService.warmUpCaches().catch((error) => {
      fail(error);
    });
  });
});
