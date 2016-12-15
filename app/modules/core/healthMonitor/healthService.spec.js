'use strict';

describe('HealthService', function () {
  beforeEach(angular.mock.module('Core'));
  beforeEach(angular.mock.module('core.healthservice'));

  var $httpBackend, HealthService;

  var regex = /.*\/ping\.*/;

  afterEach(function () {
    $httpBackend = HealthService = undefined;
  });

  afterAll(function () {
    regex = undefined;
  });

  beforeEach(inject(function (_$httpBackend_, _HealthService_) {
    $httpBackend = _$httpBackend_;
    HealthService = _HealthService_;
  }));

  afterEach(function () {
    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  });

  describe('Health Status for server', function () {
    beforeEach(installPromiseMatchers);

    it('should return online if service is available', function () {
      $httpBackend.expect('GET', regex).respond({
        serviceState: 'online'
      });

      var promise = HealthService.getHealthStatus();

      $httpBackend.flush();
      expect(promise.$$state.value).toBe('online');
    });

    it('should return an error if service is unavailable', function () {
      $httpBackend.expect('GET', regex).respond(404);

      var promise = HealthService.getHealthStatus();

      $httpBackend.flush();
      expect(promise).toBeRejected();
    });
  });

});
