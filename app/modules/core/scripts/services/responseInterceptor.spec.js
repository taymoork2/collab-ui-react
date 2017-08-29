'use strict';

var interceptorModule = require('modules/core/scripts/services/responseinterceptor');
describe('ResponseInterceptor', function () {
  beforeEach(function () {
    this.initModules(interceptorModule, function ($httpProvider) {
      $httpProvider.interceptors.push('ResponseInterceptor');
    });

    this.injectDependencies(
      '$http',
      '$httpBackend',
      '$timeout',
      'Auth',
      'RateLimitService',
      'ResponseInterceptor'
    );

    spyOn(this.Auth, 'logout');
    spyOn(this.Auth, 'refreshAccessTokenAndResendRequest');

    this.testRefreshAccessTokenAndResendRequestForResponse = testRefreshAccessTokenAndResendRequestForResponse;
    this.testLogoutForResponse = testLogoutForResponse;
  });

  /* eslint-disable */
  describe('Rate Limit', function () {
    beforeEach(function () {
      jasmine.clock().install();
      jasmine.clock().mockDate();

      this.URL = '/rate-limited-url';

      // overwrite service defaults for testing
      this.RateLimitService.MIN_DELAY = 100;
      this.RateLimitService.MAX_DELAY = 1000;

      installPromiseMatchers();
    });

    afterEach(function () {
      jasmine.clock().uninstall();

      this.$httpBackend.verifyNoOutstandingExpectation();
      this.$httpBackend.verifyNoOutstandingRequest();
    });

    it('should retry until some success code', function () {
      this.$httpBackend.expectGET(this.URL).respond(429);
      var promise = this.$http.get(this.URL);
      this.$httpBackend.flush();

      this.$httpBackend.expectGET(this.URL).respond(429);
      this.$timeout.flush(200);
      this.$httpBackend.flush();

      this.$httpBackend.expectGET(this.URL).respond(200);
      this.$timeout.flush(400);
      this.$httpBackend.flush();

      expect(promise).toBeResolvedWith(jasmine.objectContaining({
        status: 200,
      }));
    });

    it('should retry until some error code', function () {
      this.$httpBackend.expectGET(this.URL).respond(429);
      var promise = this.$http.get(this.URL);
      this.$httpBackend.flush();

      this.$httpBackend.expectGET(this.URL).respond(429);
      this.$timeout.flush(200);
      this.$httpBackend.flush();

      this.$httpBackend.expectGET(this.URL).respond(500);
      this.$timeout.flush(400);
      this.$httpBackend.flush();

      expect(promise).toBeRejectedWith(jasmine.objectContaining({
        status: 500,
      }));
    });

    it('should retry until max retry delay', function () {
      this.RateLimitService.HAS_JITTER = false;

      this.$httpBackend.expectGET(this.URL).respond(429);
      var promise = this.$http.get(this.URL);
      this.$httpBackend.flush();

      this.$httpBackend.expectGET(this.URL).respond(429);
      this.$timeout.flush(100);
      this.$httpBackend.flush();

      this.$httpBackend.expectGET(this.URL).respond(429);
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

      expect(promise).toBeRejectedWith(jasmine.objectContaining({
        status: 429,
      }));
    });
  });

  describe('Token Refresh', function () {
    it('should refresh token for 200001 errors', function () {
      this.testRefreshAccessTokenAndResendRequestForResponse({
        status: 401,
        data: {
          Errors: [{
            errorCode: '200001',
          }],
        },
      });
    });

    it('should refresh token for HTTP auth errors', function () {
      this.testRefreshAccessTokenAndResendRequestForResponse({
        status: 401,
        data: 'This request requires HTTP authentication.',
      });
    });

    it('should refresh token for Request unauthorized', function () {
      this.testRefreshAccessTokenAndResendRequestForResponse({
        status: 401,
        data: {
          error: {
            message: 'Request unauthorized',
          },
        },
      });
    });

    it('should refresh token for hercules 400 auth error responses', function () {
      this.testRefreshAccessTokenAndResendRequestForResponse({
        status: 400,
        data: {
          error: {
            message: [{
              description: 'Invalid access token.',
            }],
          },
        },
      });
    });

    it('should logout when token has expired', function () {
      this.testLogoutForResponse({
        status: 400,
        data: {
          error_description: 'The refresh token provided is expired',
        },
      });
    });

    it('should logout when refresh token is invalid because requested scope is invalid', function () {
      this.testLogoutForResponse({
        status: 400,
        data: {
          error_description: 'The requested scope is invalid',
        },
      });
    });
  });

  function testRefreshAccessTokenAndResendRequestForResponse(response) {
    this.ResponseInterceptor.responseError(response);
    expect(this.Auth.refreshAccessTokenAndResendRequest).toHaveBeenCalledTimes(1);

    // Assume same request is retried - it should not invoke the refresh/resend again
    this.ResponseInterceptor.responseError(response);
    expect(this.Auth.refreshAccessTokenAndResendRequest).toHaveBeenCalledTimes(1);
  }

  function testLogoutForResponse(response) {
    this.ResponseInterceptor.responseError(response);
    expect(this.Auth.logout).toHaveBeenCalledTimes(1);
  }
});
