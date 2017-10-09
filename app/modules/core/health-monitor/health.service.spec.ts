import healthModuleName from './index';

describe('HealthService', function () {
  beforeEach(function () {
    this.initModules(healthModuleName);
    this.injectDependencies(
      '$httpBackend',
      'HealthService',
    );

    this.pingRegex = /.*\/ping\.*/;
  });

  afterEach(function () {
    this.$httpBackend.verifyNoOutstandingExpectation();
    this.$httpBackend.verifyNoOutstandingRequest();
  });

  describe('Health Status for server', function () {
    beforeEach(installPromiseMatchers);

    it('should return online if service is available', function () {
      this.$httpBackend.expectGET(this.pingRegex).respond({
        serviceState: 'online',
      });

      const promise = this.HealthService.getHealthStatus();

      this.$httpBackend.flush();
      expect(promise).toBeResolvedWith('online');
    });

    it('should return an error if service is unavailable', function () {
      this.$httpBackend.expectGET(this.pingRegex).respond(404);

      const promise = this.HealthService.getHealthStatus();

      this.$httpBackend.flush();
      expect(promise).toBeRejected();
    });
  });
});
