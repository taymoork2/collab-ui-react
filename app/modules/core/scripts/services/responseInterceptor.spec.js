'use strict';

var interceptorModule = require('modules/core/scripts/services/responseinterceptor');
describe('ResponseInterceptor', function () {
  beforeEach(function () {
    this.initModules(interceptorModule);

    this.injectDependencies(
      'Auth',
      'ResponseInterceptor'
    );

    spyOn(this.Auth, 'logout');
    spyOn(this.Auth, 'refreshAccessTokenAndResendRequest');

    this.testRefreshAccessTokenAndResendRequestForResponse = testRefreshAccessTokenAndResendRequestForResponse;
    this.testLogoutForResponse = testLogoutForResponse;
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
